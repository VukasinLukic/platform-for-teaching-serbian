/**
 * Script mode (Cyrillic / Latin) for the current page load.
 *
 * The Latin mirror lives under /lat/... . The mode is fixed per page load:
 * switching script is a full navigation (see components/seo/ScriptSwitcher.jsx),
 * and inside /lat the router runs with basename "/lat", so every <Link>/navigate()
 * keeps the prefix automatically.
 */

import { LAT_PREFIX } from './site.js';

export function isLatinPathname(pathname = '') {
  return pathname === LAT_PREFIX || pathname.startsWith(`${LAT_PREFIX}/`);
}

export const IS_LATIN =
  typeof window !== 'undefined' && isLatinPathname(window.location.pathname);

/** Pass to <BrowserRouter basename={ROUTER_BASENAME}>. */
export const ROUTER_BASENAME = IS_LATIN ? LAT_PREFIX : undefined;
