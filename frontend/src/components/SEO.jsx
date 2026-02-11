import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Српски у Срцу';
const DEFAULT_IMAGE = 'https://srpskiusrcu.rs/og-image.png';
const DOMAIN = 'https://srpskiusrcu.rs';

/**
 * SEO component za dinamičke meta tagove po stranicama
 * Koristi react-helmet-async za server-safe rendering
 *
 * @param {string} title - Naslov stranice (bez naziva sajta)
 * @param {string} description - Meta opis (150-160 karaktera)
 * @param {string} canonical - Kanonični URL (opciono)
 * @param {string} ogImage - Open Graph slika URL
 * @param {string} ogType - OG type: 'website', 'article', itd.
 * @param {Array} jsonLd - Niz JSON-LD strukturiranih podataka
 * @param {boolean} noindex - Da li se stranica indeksira
 */
export default function SEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  jsonLd = [],
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Online Курсеви за Малу Матуру из Српског`;
  const canonicalUrl = canonical ? `${DOMAIN}${canonical}` : undefined;

  return (
    <Helmet>
      {/* Osnovni meta tagovi */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph tagovi */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="sr_RS" />

      {/* Twitter Card tagovi */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD strukturirani podaci */}
      {jsonLd.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
