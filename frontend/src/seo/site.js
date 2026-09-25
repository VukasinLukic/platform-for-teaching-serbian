/**
 * Site-wide SEO constants and schema.org builders.
 * Pure module: imported by the React app and by scripts/seo-build.mjs (Node).
 */

export const DOMAIN = 'https://srpskiusrcu.rs';
export const SITE_NAME = 'Српски у Срцу';
export const SITE_NAME_LATIN = 'Srpski u Srcu';
export const DEFAULT_OG_IMAGE = '/og-image.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const LOGO_PNG = '/icon-512.png';
export const MAX_TITLE_LENGTH = 60;
export const LAT_PREFIX = '/lat';

const TITLE_SEPARATOR = ' | ';

/**
 * Full <title>: appends the brand when the result stays within ~60 chars,
 * otherwise uses the page title alone.
 */
export function formatTitle(title) {
  if (!title) return `Мала матура из српског — онлајн курсеви${TITLE_SEPARATOR}${SITE_NAME}`;
  if (title.includes(SITE_NAME)) return title;
  const withBrand = `${title}${TITLE_SEPARATOR}${SITE_NAME}`;
  return withBrand.length <= MAX_TITLE_LENGTH ? withBrand : title;
}

export function absoluteUrl(path) {
  if (!path) return DOMAIN;
  if (/^https?:\/\//.test(path)) return path;
  return `${DOMAIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** "/about" -> "/lat/about", "/" -> "/lat". */
export function toLatinPath(path = '/') {
  if (path === LAT_PREFIX || path.startsWith(`${LAT_PREFIX}/`)) return path;
  return path === '/' || path === '' ? LAT_PREFIX : `${LAT_PREFIX}${path}`;
}

/** "/lat/about" -> "/about", "/lat" -> "/". */
export function toCyrillicPath(path = '/') {
  if (path === LAT_PREFIX || path === `${LAT_PREFIX}/`) return '/';
  if (path.startsWith(`${LAT_PREFIX}/`)) return path.slice(LAT_PREFIX.length);
  return path;
}

/** Normalises a router pathname for canonical use: no trailing slash (except root). */
export function normalizePath(pathname = '/') {
  let p = pathname.split(/[?#]/)[0] || '/';
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

/* ------------------------------------------------------------------------ */
/* schema.org entities                                                       */
/* ------------------------------------------------------------------------ */

export const ORG_ID = `${DOMAIN}/#organization`;
export const PERSON_ID = `${DOMAIN}/#marina-lukic`;
export const WEBSITE_ID = `${DOMAIN}/#website`;

export const TEACHER = {
  name: 'Марина Лукић',
  jobTitle: 'Наставница српског језика и књижевности',
  yearsOfExperience: 27,
};

// Only facts present in the codebase (AboutPage, ContactPage, Footer).
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': ORG_ID,
    name: SITE_NAME,
    alternateName: SITE_NAME_LATIN,
    url: `${DOMAIN}/`,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(LOGO_PNG),
      width: 512,
      height: 512,
    },
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description:
      'Онлајн платформа за припрему мале матуре из српског језика — видео лекције, онлајн часови уживо и бесплатни тестови са наставницом Марином Лукић.',
    email: 'profesorka.marinalukic@gmail.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Крушевац', addressCountry: 'RS' },
    areaServed: { '@type': 'Country', name: 'Србија' },
    sameAs: ['https://www.instagram.com/srpskiusrcu'],
    founder: { '@id': PERSON_ID },
  };
}

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: TEACHER.name,
    jobTitle: TEACHER.jobTitle,
    description:
      'Наставница српског језика и књижевности са 27 година искуства у раду са ученицима од петог до осмог разреда основне школе.',
    image: absoluteUrl('/profesorkaMarina.webp'),
    url: `${DOMAIN}/about`,
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Филолошки факултет Универзитета у Београду',
    },
    award: 'Републичке награде са ученицима на Књижевној олимпијади',
    knowsAbout: ['Српски језик', 'Књижевност', 'Граматика', 'Правопис', 'Мала матура'],
    knowsLanguage: 'sr',
    worksFor: { '@id': ORG_ID },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    alternateName: SITE_NAME_LATIN,
    url: `${DOMAIN}/`,
    inLanguage: 'sr',
    publisher: { '@id': ORG_ID },
  };
}

/** items: [{ name, path }] — home is prepended automatically. */
export function breadcrumbSchema(items) {
  const all = [{ name: 'Почетна', path: '/' }, ...items];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Organisation reference used inside other entities. */
export function orgRef() {
  return { '@type': 'EducationalOrganization', '@id': ORG_ID, name: SITE_NAME, url: `${DOMAIN}/` };
}

export function teacherRef() {
  return { '@type': 'Person', '@id': PERSON_ID, name: TEACHER.name, jobTitle: TEACHER.jobTitle };
}
