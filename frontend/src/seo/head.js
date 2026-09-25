/**
 * Builds the <head> SEO tags for a page as plain data.
 * Rendered by components/SEO.jsx (react-helmet-async) at runtime and by
 * scripts/seo-build.mjs into static HTML shells — so both always agree.
 */

import {
  DEFAULT_OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_NAME_LATIN,
  absoluteUrl,
  formatTitle,
  normalizePath,
  toLatinPath,
} from './site.js';
import { cyrToLat, deepCyrToLat } from './transliterate.js';
import { escapeHtml } from './routes.js';

/**
 * @param {object} meta   route meta (see routes.js); `path` is the Cyrillic path
 * @param {object} opts   { latin: boolean }
 * @returns {{ htmlLang, title, metas: Array<{name?, property?, content}>,
 *            links: Array<{rel, href, hreflang?}>, jsonLd: object[] }}
 */
export function buildHead(meta, { latin = false } = {}) {
  const path = normalizePath(meta.path || '/');
  const tr = latin ? cyrToLat : (s) => s;

  const title = tr(formatTitle(meta.title));
  const description = meta.description ? tr(meta.description) : undefined;
  const canonicalPath = latin ? toLatinPath(path) : path;
  const canonical = absoluteUrl(canonicalPath);
  const ogImage = absoluteUrl(meta.ogImage || DEFAULT_OG_IMAGE);
  const noindex = !!meta.noindex;

  const metas = [];
  if (description) metas.push({ name: 'description', content: description });
  metas.push({
    name: 'robots',
    content: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1',
  });
  metas.push({ property: 'og:type', content: meta.ogType || 'website' });
  metas.push({ property: 'og:site_name', content: latin ? SITE_NAME_LATIN : SITE_NAME });
  metas.push({ property: 'og:locale', content: 'sr_RS' });
  metas.push({ property: 'og:url', content: canonical });
  metas.push({ property: 'og:title', content: title });
  if (description) metas.push({ property: 'og:description', content: description });
  metas.push({ property: 'og:image', content: ogImage });
  metas.push({ property: 'og:image:width', content: String(OG_IMAGE_WIDTH) });
  metas.push({ property: 'og:image:height', content: String(OG_IMAGE_HEIGHT) });
  metas.push({ property: 'og:image:alt', content: title });
  if (meta.publishedTime) {
    metas.push({ property: 'article:published_time', content: meta.publishedTime });
  }
  metas.push({ name: 'twitter:card', content: 'summary_large_image' });
  metas.push({ name: 'twitter:title', content: title });
  if (description) metas.push({ name: 'twitter:description', content: description });
  metas.push({ name: 'twitter:image', content: ogImage });

  const links = [{ rel: 'canonical', href: canonical }];
  if (!noindex) {
    const cyrUrl = absoluteUrl(path);
    const latUrl = absoluteUrl(toLatinPath(path));
    links.push({ rel: 'alternate', hreflang: 'sr-Cyrl', href: cyrUrl });
    links.push({ rel: 'alternate', hreflang: 'sr-Latn', href: latUrl });
    links.push({ rel: 'alternate', hreflang: 'x-default', href: cyrUrl });
  }

  const jsonLd = (meta.jsonLd || []).map((s) => (latin ? deepCyrToLat(s) : s));

  return { htmlLang: latin ? 'sr-Latn' : 'sr-Cyrl', title, metas, links, jsonLd };
}

/** Serialises JSON-LD safely for inline <script> (no "</script>" breakout). */
export function jsonLdToString(schema) {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

/**
 * HTML string for the build-time shells. Tags carry data-rh="true" so that
 * react-helmet-async takes them over (replaces them) once the app boots —
 * this keeps exactly one of each tag in the live DOM.
 */
export function renderHeadHtml(head) {
  const out = [];
  out.push(`<title>${escapeHtml(head.title)}</title>`);
  for (const m of head.metas) {
    const key = m.name ? `name="${escapeHtml(m.name)}"` : `property="${escapeHtml(m.property)}"`;
    out.push(`<meta data-rh="true" ${key} content="${escapeHtml(m.content)}" />`);
  }
  for (const l of head.links) {
    const hreflang = l.hreflang ? ` hreflang="${escapeHtml(l.hreflang)}"` : '';
    out.push(`<link data-rh="true" rel="${escapeHtml(l.rel)}"${hreflang} href="${escapeHtml(l.href)}" />`);
  }
  for (const s of head.jsonLd) {
    out.push(`<script data-rh="true" type="application/ld+json">${jsonLdToString(s)}</script>`);
  }
  return out.join('\n    ');
}
