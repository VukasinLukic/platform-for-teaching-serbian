/**
 * Route metadata registry — the single source of truth for page SEO.
 *
 * Used by:
 *  - components/SEO.jsx at runtime (title, description, canonical, OG, JSON-LD);
 *  - scripts/seo-build.mjs at build time (static HTML shells per route, sitemap).
 *
 * Pure module: no React, no Vite-only APIs, relative imports with ".js" so plain
 * Node can import it. Quiz data comes from public/data/quizzes/manifest.json,
 * which callers pass in (fetched at runtime, read from disk at build time).
 *
 * Meta shape:
 * {
 *   path, title, description, ogImage?, ogType?, noindex?, publishedTime?,
 *   jsonLd: [],            // page-level structured data
 *   jsonLdFromPage?: bool, // runtime: prefer the jsonLd prop the page passes
 *   sitemap?: { priority, changefreq, lastmod } | false,
 *   prerender?: string     // optional HTML for the shell body (build only)
 * }
 */

import {
  DOMAIN,
  SITE_NAME,
  absoluteUrl,
  breadcrumbSchema,
  normalizePath,
  organizationSchema,
  orgRef,
  personSchema,
  teacherRef,
  websiteSchema,
} from './site.js';
import { blogPosts, getBlogPost } from '../data/blogPosts.js';
import { seoTestovi } from '../data/seoTestovi.js';
import { inicijalniTestovi } from '../data/inicijalniTestovi.js';
import { faqs } from '../data/faqs.js';
import { quizSeo, quizListIntro } from '../data/quizSeo.js';

/* ------------------------------------------------------------------------ */
/* helpers                                                                   */
/* ------------------------------------------------------------------------ */

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtml(str) {
  return String(str ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/* ------------------------------------------------------------------------ */
/* static pages                                                              */
/* ------------------------------------------------------------------------ */

const STATIC_ROUTES = {
  '/': {
    title: 'Мала матура из српског — онлајн курсеви',
    description:
      'Видео курсеви и онлајн часови за припрему мале матуре из српског језика са наставницом Марином Лукић, 27 година искуства. Mala matura srpski — online priprema.',
    jsonLd: () => [organizationSchema(), websiteSchema(), personSchema()],
    sitemap: { priority: 1.0, changefreq: 'weekly' },
  },
  '/about': {
    title: 'О нама — наставница Марина Лукић',
    description:
      'Наставница Марина Лукић: Филолошки факултет у Београду, 27 година рада са ученицима од 5. до 8. разреда, републичке награде. Profesorka srpskog jezika.',
    jsonLd: () => [personSchema(), breadcrumbSchema([{ name: 'О нама', path: '/about' }])],
    sitemap: { priority: 0.8, changefreq: 'monthly' },
  },
  '/courses': {
    title: 'Онлајн курсеви за малу матуру из српског',
    description:
      'Видео курсеви за припрему мале матуре из српског језика: граматика, књижевност и правопис, учење својим темпом. Online kursevi srpskog jezika za malu maturu.',
    jsonLd: () => [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Онлајн курсеви српског језика за малу матуру',
        url: `${DOMAIN}/courses`,
        inLanguage: 'sr',
        isPartOf: { '@id': `${DOMAIN}/#website` },
        publisher: orgRef(),
      },
      breadcrumbSchema([{ name: 'Курсеви', path: '/courses' }]),
    ],
    sitemap: { priority: 0.9, changefreq: 'weekly' },
  },
  '/online-nastava': {
    title: 'Онлајн настава српског језика уживо',
    description:
      'Групни и индивидуални онлајн часови српског језика уживо за ученике од 5. до 8. разреда и припрему мале матуре. Online nastava srpskog jezika.',
    jsonLd: () => [breadcrumbSchema([{ name: 'Онлајн настава', path: '/online-nastava' }])],
    jsonLdFromPage: true,
    sitemap: { priority: 0.9, changefreq: 'weekly' },
  },
  '/benefits': {
    title: 'Зашто учити са нама — предности',
    description:
      'Зашто ученици и родитељи бирају Српски у Срцу: видео лекције доступне 24/7, наставница са 27 година искуства, тестови и материјали. Priprema za malu maturu.',
    jsonLd: () => [breadcrumbSchema([{ name: 'Предности', path: '/benefits' }])],
    sitemap: { priority: 0.7, changefreq: 'monthly' },
  },
  '/faq': {
    title: 'Честа питања о курсевима и настави',
    description:
      'Одговори на честа питања о онлајн курсевима српског језика: начин рада, плаћање, приступ лекцијама, трајање и подршка. Česta pitanja — Srpski u Srcu.',
    jsonLd: () => [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.title,
          acceptedAnswer: { '@type': 'Answer', text: faq.content },
        })),
      },
      breadcrumbSchema([{ name: 'Честа питања', path: '/faq' }]),
    ],
    prerender: () =>
      `<h1>Често постављана питања</h1>` +
      faqs.map((f) => `<h2>${escapeHtml(f.title)}</h2><p>${escapeHtml(f.content)}</p>`).join(''),
    sitemap: { priority: 0.7, changefreq: 'monthly' },
  },
  '/contact': {
    title: 'Контакт',
    description:
      'Пишите нам за питања о онлајн курсевима српског језика и припреми мале матуре. Kontakt — Srpski u Srcu, online nastava srpskog jezika.',
    jsonLd: () => [breadcrumbSchema([{ name: 'Контакт', path: '/contact' }])],
    jsonLdFromPage: true,
    sitemap: { priority: 0.6, changefreq: 'monthly' },
  },
  '/blog': {
    title: 'Блог — савети за малу матуру из српског',
    description:
      'Чланци и водичи за припрему мале матуре из српског језика: граматика, књижевност, лектира и савети за родитеље. Blog — mala matura srpski.',
    jsonLd: () => [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: `${SITE_NAME} — блог`,
        url: `${DOMAIN}/blog`,
        inLanguage: 'sr',
        publisher: orgRef(),
        blogPost: blogPosts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          url: `${DOMAIN}/blog/${p.slug}`,
          datePublished: p.date,
        })),
      },
      breadcrumbSchema([{ name: 'Блог', path: '/blog' }]),
    ],
    prerender: () =>
      `<h1>Блог</h1><ul>` +
      blogPosts
        .map(
          (p) =>
            `<li><a href="/blog/${p.slug}">${escapeHtml(p.title)}</a><p>${escapeHtml(p.excerpt)}</p></li>`
        )
        .join('') +
      `</ul>`,
    sitemap: { priority: 0.8, changefreq: 'weekly' },
  },
  '/privacy': {
    title: 'Политика приватности',
    description:
      'Како платформа Српски у Срцу прикупља, користи и чува податке о личности ученика и родитеља. Politika privatnosti.',
    jsonLd: () => [],
    sitemap: { priority: 0.3, changefreq: 'yearly' },
  },
  '/terms': {
    title: 'Услови коришћења',
    description:
      'Услови коришћења платформе Српски у Срцу: налози, курсеви, плаћање и приступ садржају. Uslovi korišćenja — Srpski u Srcu.',
    jsonLd: () => [],
    sitemap: { priority: 0.3, changefreq: 'yearly' },
  },
  '/probni-prijemni': {
    title: 'Пробни пријемни из српског — бесплатан тест',
    description:
      'Урадите бесплатан пробни пријемни тест из српског језика, без регистрације, и одмах видите резултат. Probni prijemni iz srpskog za malu maturu.',
    jsonLd: () => [
      {
        '@context': 'https://schema.org',
        '@type': 'Quiz',
        name: 'Пробни пријемни из српског језика',
        url: `${DOMAIN}/probni-prijemni`,
        inLanguage: 'sr',
        educationalLevel: 'Основна школа, 8. разред',
        about: 'Мала матура из српског језика',
        isAccessibleForFree: true,
        provider: orgRef(),
      },
      breadcrumbSchema([{ name: 'Пробни пријемни', path: '/probni-prijemni' }]),
    ],
    sitemap: { priority: 0.8, changefreq: 'monthly' },
  },
  '/kvizovi': {
    title: 'Квизови из српског језика за малу матуру',
    description:
      'Бесплатни онлајн квизови из српског: гласовне промене, падежи, глаголи, стилске фигуре и књижевност. Kvizovi za malu maturu iz srpskog jezika.',
    // jsonLd/prerender filled in by quizListMeta (needs the manifest)
    jsonLd: () => [breadcrumbSchema([{ name: 'Квизови', path: '/kvizovi' }])],
    sitemap: { priority: 0.8, changefreq: 'weekly' },
  },
};

function materialize(path, entry) {
  return {
    path,
    title: entry.title,
    description: entry.description,
    ogImage: entry.ogImage,
    ogType: entry.ogType || 'website',
    noindex: !!entry.noindex,
    jsonLd: typeof entry.jsonLd === 'function' ? entry.jsonLd() : entry.jsonLd || [],
    jsonLdFromPage: !!entry.jsonLdFromPage,
    sitemap: entry.sitemap ?? false,
    prerender: typeof entry.prerender === 'function' ? entry.prerender() : entry.prerender,
  };
}

export const STATIC_PATHS = Object.keys(STATIC_ROUTES);

/* ------------------------------------------------------------------------ */
/* dynamic pages                                                             */
/* ------------------------------------------------------------------------ */

export function blogPostMeta(slug) {
  const post = getBlogPost(slug);
  if (!post) return null;
  const path = `/blog/${slug}`;
  return {
    path,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    ogImage: post.ogImage,
    ogType: 'article',
    publishedTime: post.date,
    noindex: false,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: absoluteUrl(post.ogImage || '/og-image.png'),
        author: { ...teacherRef(), url: `${DOMAIN}/about` },
        datePublished: post.date,
        dateModified: post.date,
        publisher: {
          '@type': 'EducationalOrganization',
          '@id': `${DOMAIN}/#organization`,
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: absoluteUrl('/icon-512.png') },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${DOMAIN}${path}` },
        articleSection: post.category,
        inLanguage: 'sr',
      },
      breadcrumbSchema([
        { name: 'Блог', path: '/blog' },
        { name: post.title, path },
      ]),
    ],
    sitemap: { priority: 0.7, changefreq: 'monthly', lastmod: post.date },
    prerender:
      `<article><p><a href="/blog">Блог</a></p><h1>${escapeHtml(post.title)}</h1>` +
      `<p>${escapeHtml(post.author)} · ${escapeHtml(post.date)} · ${escapeHtml(post.readTime)} читања</p>` +
      post.content +
      `<p><a href="/courses">Погледајте курсеве</a></p></article>`,
  };
}

export function inicijalniTestMeta(razred) {
  const test = Object.prototype.hasOwnProperty.call(inicijalniTestovi, razred)
    ? inicijalniTestovi[razred]
    : null;
  if (!test) return null;
  const path = `/inicijalni-test/${razred}`;
  const ukupno = test.pitanja.length;
  return {
    path,
    title: `Иницијални тест из српског — ${test.razred}. разред`,
    description: `${test.kratakOpis} ${ukupno} питања са решењима, бесплатно и без регистрације. Inicijalni test iz srpskog za ${test.razred}. razred.`,
    ogType: 'website',
    noindex: false,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Quiz',
        name: test.naziv,
        description: `${test.naziv} из српског језика и књижевности — ${test.kratakOpis}`,
        url: `${DOMAIN}${path}`,
        inLanguage: 'sr',
        educationalLevel: `${test.razred}. разред основне школе`,
        learningResourceType: 'Quiz',
        about: test.teme.map((t) => ({ '@type': 'Thing', name: t })),
        isAccessibleForFree: true,
        provider: orgRef(),
      },
      breadcrumbSchema([{ name: test.naziv, path }]),
    ],
    sitemap: { priority: 0.7, changefreq: 'monthly' },
    prerender: `<h1>${escapeHtml(test.naziv)}</h1><p>${escapeHtml(test.kratakOpis)}</p><p>${escapeHtml(test.uvod)}</p>`,
  };
}

export function seoTestMeta(kategorija, slug) {
  const key = `${kategorija}/${slug}`;
  const test = Object.prototype.hasOwnProperty.call(seoTestovi, key) ? seoTestovi[key] : null;
  if (!test) return null;
  const path = `/srpski-jezik/${key}`;
  return {
    path,
    title: test.metaTitle,
    description: test.metaDescription,
    ogType: 'website',
    noindex: false,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Quiz',
        name: test.naslov,
        alternateName: test.metaTitle,
        description: test.metaDescription,
        url: `${DOMAIN}${path}`,
        inLanguage: 'sr',
        educationalLevel: 'Основна школа, 5–8. разред',
        learningResourceType: 'Quiz',
        about: { '@type': 'Thing', name: test.kategorijaNaslov },
        isAccessibleForFree: true,
        provider: orgRef(),
      },
      // Category pages do not exist, so the trail is Home > test.
      breadcrumbSchema([{ name: test.naslov, path }]),
    ],
    sitemap: { priority: 0.7, changefreq: 'monthly' },
    prerender: `<h1>${escapeHtml(test.naslov)}</h1><p>${escapeHtml(stripHtml(test.uvod))}</p>`,
  };
}

/** manifest: array from public/data/quizzes/manifest.json */
export function findQuiz(manifest, quizId) {
  return (manifest || []).find((q) => q.id === quizId) || null;
}

export function quizMeta(entry) {
  if (!entry) return null;
  const seo = quizSeo[entry.id] || {};
  const path = `/kvizovi/${entry.id}`;
  const description = `${entry.description} ${seo.latin || 'Kviz iz srpskog jezika za malu maturu.'}`.trim();
  return {
    path,
    title: seo.seoTitle || `${entry.title} — квиз из српског`,
    description,
    ogType: 'website',
    noindex: false,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Quiz',
        name: entry.title,
        description: entry.description,
        url: `${DOMAIN}${path}`,
        inLanguage: 'sr',
        educationalLevel: 'Основна школа, 5–8. разред',
        learningResourceType: 'Quiz',
        isAccessibleForFree: true,
        provider: orgRef(),
      },
      breadcrumbSchema([
        { name: 'Квизови', path: '/kvizovi' },
        { name: entry.title, path },
      ]),
    ],
    sitemap: { priority: 0.6, changefreq: 'monthly' },
    prerender:
      `<p><a href="/kvizovi">Квизови</a></p><h1>${escapeHtml(entry.title)}</h1>` +
      `<p>${escapeHtml(seo.intro || entry.description)}</p><p>${escapeHtml(entry.description)}</p>`,
  };
}

export function quizListMeta(manifest) {
  const meta = materialize('/kvizovi', STATIC_ROUTES['/kvizovi']);
  const list = manifest || [];
  if (list.length) {
    meta.jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Квизови из српског језика',
        itemListElement: list.map((q, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${DOMAIN}/kvizovi/${q.id}`,
          name: q.title,
        })),
      },
      ...meta.jsonLd,
    ];
  }
  meta.prerender =
    `<h1>Квизови из српског језика</h1><p>${escapeHtml(quizListIntro)}</p><ul>` +
    list
      .map((q) => `<li><a href="/kvizovi/${q.id}">${escapeHtml(q.title)}</a> — ${escapeHtml(q.description)}</li>`)
      .join('') +
    `</ul>`;
  return meta;
}

/* ------------------------------------------------------------------------ */
/* resolution                                                                */
/* ------------------------------------------------------------------------ */

/**
 * Metadata for a (Cyrillic) pathname, or null when the registry does not know
 * the route (private pages, Firestore courses, unknown URLs).
 * `manifest` (quiz list) is optional; quiz routes resolve only when given.
 */
export function resolveRouteMeta(pathname, { manifest } = {}) {
  const path = normalizePath(pathname);
  if (path === '/kvizovi') return quizListMeta(manifest);
  if (Object.prototype.hasOwnProperty.call(STATIC_ROUTES, path)) {
    return materialize(path, STATIC_ROUTES[path]);
  }
  let m;
  if ((m = path.match(/^\/blog\/([^/]+)$/))) return blogPostMeta(m[1]);
  if ((m = path.match(/^\/inicijalni-test\/([^/]+)$/))) return inicijalniTestMeta(m[1]);
  if ((m = path.match(/^\/srpski-jezik\/([^/]+)\/([^/]+)$/))) return seoTestMeta(m[1], m[2]);
  if ((m = path.match(/^\/kvizovi\/([^/]+)$/)) && manifest) {
    return quizMeta(findQuiz(manifest, m[1]));
  }
  return null;
}

/** Every public, indexable route known at build time. */
export function getAllPublicRoutes({ manifest = [] } = {}) {
  const routes = [];
  for (const path of STATIC_PATHS) routes.push(resolveRouteMeta(path, { manifest }));
  for (const post of blogPosts) routes.push(blogPostMeta(post.slug));
  for (const razred of Object.keys(inicijalniTestovi)) routes.push(inicijalniTestMeta(razred));
  for (const key of Object.keys(seoTestovi)) {
    const [kategorija, slug] = key.split('/');
    routes.push(seoTestMeta(kategorija, slug));
  }
  for (const entry of manifest) routes.push(quizMeta(entry));
  return routes.filter(Boolean);
}
