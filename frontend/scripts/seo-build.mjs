/**
 * Build-time SEO step (runs after `vite build`, from the Vite plugin in
 * vite.config.js; can also be run on an existing dist: `node scripts/seo-build.mjs`).
 *
 * The app is a client-rendered SPA, and social/chat crawlers (Viber, WhatsApp,
 * Facebook, LinkedIn…) do not execute JS. For every public route this writes a
 * static HTML shell with that route's <title>, description, canonical, robots,
 * Open Graph, Twitter, hreflang and JSON-LD tags — plus the /lat (Latin script)
 * mirror — and generates sitemap.xml. Blog posts, lists and tests also get their
 * text prerendered into #root for crawlers without JS (hidden once JS runs;
 * React replaces it on mount).
 *
 * Output layout (Firebase Hosting `cleanUrls: true` serves "/about" from about.html):
 *   /                 -> index.html        (also the SPA fallback)
 *   /about            -> about.html
 *   /blog/<slug>      -> blog/<slug>.html
 *   /lat              -> lat.html
 *   /lat/blog/<slug>  -> lat/blog/<slug>.html
 *
 * No network, no browser: data comes from src/ modules and public/data.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getAllPublicRoutes } from '../src/seo/routes.js';
import { buildHead, renderHeadHtml, jsonLdToString } from '../src/seo/head.js';
import { cyrToLat } from '../src/seo/transliterate.js';
import { DOMAIN, MAX_TITLE_LENGTH, absoluteUrl, toLatinPath } from '../src/seo/site.js';

const SEO_BLOCK_RE = /<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/;
const PRERENDER_MARK = '<!-- PRERENDER -->';

function routeToFile(routePath) {
  if (routePath === '/') return 'index.html';
  return `${routePath.replace(/^\/+/, '')}.html`;
}

function latinizeHtml(html) {
  // Internal links keep the /lat prefix inside the Latin mirror.
  return cyrToLat(html).replace(/href="\/(?!lat(?:\/|"))(?!\/)/g, 'href="/lat/').replace(/href="\/lat\/"/g, 'href="/lat"');
}

const PRERENDER_STYLE =
  '<style>html.js-on [data-prerender]{display:none}' +
  '[data-prerender]{max-width:48rem;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif;line-height:1.6;color:#1A1A1A}' +
  '[data-prerender] a{color:#D62828}</style>' +
  "<script>document.documentElement.classList.add('js-on')</script>";

function renderShell(template, meta, { latin }) {
  const head = buildHead(meta, { latin });
  let html = template.replace(SEO_BLOCK_RE, `<!-- SEO:START -->\n    ${renderHeadHtml(head)}\n    <!-- SEO:END -->`);
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${head.htmlLang}"`);
  if (meta.prerender) {
    const body = latin ? latinizeHtml(meta.prerender) : meta.prerender;
    html = html.replace('</head>', `  ${PRERENDER_STYLE}\n  </head>`);
    html = html.replace(PRERENDER_MARK, `<div data-prerender>${body}</div>`);
  }
  return { html, head };
}

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildSitemap(routes) {
  const entries = [];
  for (const r of routes) {
    if (r.noindex || !r.sitemap) continue;
    const cyr = absoluteUrl(r.path);
    const lat = absoluteUrl(toLatinPath(r.path));
    const alternates =
      `    <xhtml:link rel="alternate" hreflang="sr-Cyrl" href="${xmlEscape(cyr)}"/>\n` +
      `    <xhtml:link rel="alternate" hreflang="sr-Latn" href="${xmlEscape(lat)}"/>\n` +
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(cyr)}"/>\n`;
    for (const [loc, priorityFactor] of [[cyr, 1], [lat, 0.8]]) {
      const { lastmod, changefreq, priority } = r.sitemap;
      entries.push(
        `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n` +
          (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '') +
          (changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : '') +
          (priority != null ? `    <priority>${(priority * priorityFactor).toFixed(1)}</priority>\n` : '') +
          alternates +
          `  </url>`
      );
    }
  }
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!-- Generated at build time by scripts/seo-build.mjs from src/seo/routes.js. Do not edit. -->\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    entries.join('\n') +
    '\n</urlset>\n'
  );
}

export async function writeSeoFiles({ distDir, publicDir, log = console.log } = {}) {
  const templatePath = path.join(distDir, 'index.html');
  const template = fs.readFileSync(templatePath, 'utf8');
  if (!SEO_BLOCK_RE.test(template)) {
    throw new Error('[seo-build] index.html is missing the <!-- SEO:START --> / <!-- SEO:END --> markers');
  }
  if (!template.includes(PRERENDER_MARK)) {
    throw new Error('[seo-build] index.html is missing the <!-- PRERENDER --> marker inside #root');
  }

  const manifestPath = path.join(publicDir, 'data', 'quizzes', 'manifest.json');
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : [];

  const routes = getAllPublicRoutes({ manifest });
  const warnings = [];
  const seenTitles = new Map();
  const seenDescriptions = new Map();
  let files = 0;

  for (const meta of routes) {
    // Missing per-page OG image -> fall back to the default image (and warn).
    if (meta.ogImage && !fs.existsSync(path.join(distDir, meta.ogImage))) {
      warnings.push(`OG image missing for ${meta.path}: ${meta.ogImage} (using default)`);
      meta.ogImage = undefined;
    }

    for (const latin of [false, true]) {
      const routePath = latin ? toLatinPath(meta.path) : meta.path;
      const { html, head } = renderShell(template, meta, { latin });

      // Validate JSON-LD is well-formed.
      for (const schema of head.jsonLd) JSON.parse(jsonLdToString(schema));

      if (!latin) {
        if (head.title.length > MAX_TITLE_LENGTH + 2) warnings.push(`Title > ${MAX_TITLE_LENGTH} chars (${head.title.length}) on ${meta.path}: ${head.title}`);
        if (seenTitles.has(head.title)) warnings.push(`Duplicate title on ${meta.path} and ${seenTitles.get(head.title)}`);
        seenTitles.set(head.title, meta.path);
        if (meta.description) {
          if (meta.description.length > 175) warnings.push(`Description > 175 chars (${meta.description.length}) on ${meta.path}`);
          if (seenDescriptions.has(meta.description)) warnings.push(`Duplicate description on ${meta.path}`);
          seenDescriptions.set(meta.description, meta.path);
        }
      }

      const outFile = path.join(distDir, routeToFile(routePath));
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, html);
      files++;
    }
  }

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemap(routes));

  for (const w of warnings) log(`[seo-build] warning: ${w}`);
  log(`[seo-build] wrote ${files} HTML shells (${routes.length} routes × Cyrillic/Latin) and sitemap.xml for ${DOMAIN}`);
  return { routes: routes.length, files, warnings };
}

// CLI: node scripts/seo-build.mjs [distDir]
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  writeSeoFiles({
    distDir: path.resolve(process.argv[2] || path.join(root, 'dist')),
    publicDir: path.join(root, 'public'),
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
