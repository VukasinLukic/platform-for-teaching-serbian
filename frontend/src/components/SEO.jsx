import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { resolveRouteMeta } from '../seo/routes';
import { buildHead, jsonLdToString } from '../seo/head';
import { normalizePath } from '../seo/site';
import { IS_LATIN } from '../seo/script';

/**
 * Per-page <head> tags (title, description, canonical, robots, Open Graph,
 * Twitter, hreflang alternates, JSON-LD) via react-helmet-async.
 *
 * Source of truth: src/seo/routes.js. For every route the registry knows
 * (static pages, blog posts, tests), the registry's title/description/OG/JSON-LD
 * are used and the props below are ignored — the same data generates the static
 * HTML shells at build time (scripts/seo-build.mjs), so crawlers without JS and
 * the live app always see identical tags.
 *
 * For routes outside the registry (courses from Firestore, quizzes, 404, private
 * pages) the props are used. A canonical is always emitted: `canonical` prop
 * (a path, e.g. "/kurs/slug") or the current path.
 *
 * On the Latin mirror (/lat/...) everything is transliterated and canonical /
 * alternates point to the right script version.
 *
 * @param {string}  title        page title without the brand (brand added when it fits in 60 chars)
 * @param {string}  description  meta description (~150–160 chars)
 * @param {string}  canonical    canonical path, e.g. "/kurs/priprema" (defaults to current path)
 * @param {string}  ogImage      path or absolute URL of a 1200×630 image
 * @param {string}  ogType       'website' | 'article'
 * @param {Array}   jsonLd       page JSON-LD (used when the registry has none for this route)
 * @param {Array}   extraJsonLd  JSON-LD always appended (e.g. runtime Firestore data)
 * @param {boolean} noindex      mark page noindex
 */
export default function SEO({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  jsonLd = [],
  extraJsonLd = [],
  noindex = false,
  publishedTime,
}) {
  const location = useLocation();
  const path = normalizePath(location.pathname);

  const head = useMemo(() => {
    const registry = resolveRouteMeta(path);
    let meta;
    if (registry) {
      meta = { ...registry, noindex: registry.noindex || noindex };
      if (registry.jsonLdFromPage && jsonLd.length) meta.jsonLd = jsonLd;
    } else {
      meta = {
        path: canonical ? normalizePath(canonical) : path,
        title,
        description,
        ogImage,
        ogType,
        noindex,
        publishedTime,
        jsonLd,
      };
    }
    meta.jsonLd = [...(meta.jsonLd || []), ...extraJsonLd];
    return buildHead(meta, { latin: IS_LATIN });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, title, description, canonical, ogImage, ogType, noindex, publishedTime, JSON.stringify(jsonLd), JSON.stringify(extraJsonLd)]);

  return (
    <Helmet>
      <html lang={head.htmlLang} />
      <title>{head.title}</title>
      {head.metas.map((m) =>
        m.name ? (
          <meta key={`n:${m.name}`} name={m.name} content={m.content} />
        ) : (
          <meta key={`p:${m.property}`} property={m.property} content={m.content} />
        )
      )}
      {head.links.map((l) => (
        <link key={`${l.rel}:${l.hreflang || ''}`} rel={l.rel} href={l.href} {...(l.hreflang ? { hrefLang: l.hreflang } : {})} />
      ))}
      {head.jsonLd.map((schema, index) => (
        <script key={`ld:${index}`} type="application/ld+json">
          {jsonLdToString(schema)}
        </script>
      ))}
    </Helmet>
  );
}
