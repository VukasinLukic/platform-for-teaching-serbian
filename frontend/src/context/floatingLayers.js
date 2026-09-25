import { create } from 'zustand';

/**
 * Floating layer coordination.
 *
 * Several overlays compete for the bottom of the screen: CookieConsent, QuickDock
 * (which is also the Alano assistant launcher), PromoQuizModal and TutorialTooltip.
 * Each layer reports its state here and reads the others, so the rules live in one
 * place:
 *
 *  1. CookieConsent goes first. While it is visible, the dock moves away from the
 *     bottom edge, tutorials wait, and the promo modal is never shown.
 *  2. On "focus routes" (course player, quizzes, tests, payment slip, a running
 *     mock exam) the dock is hidden; on course pages it collapses to a small
 *     Alano button so help is still one tap away.
 *  3. The promo modal never overlaps the tutorial or the cookie banner, never opens
 *     while the assistant is open, and only opens after ~30s of browsing or on exit
 *     intent (see PromoQuizModal).
 *  4. The dock publishes its height as `--dock-offset` on <html>, and the body gets
 *     matching bottom padding so the footer and page CTAs are never covered.
 */
export const useFloatingLayers = create((set) => ({
  cookieBannerVisible: false,
  tutorialActive: false,
  promoOpen: false,
  // Set by pages that run a timed test (e.g. /probni-prijemni) while the test is in progress.
  testingActive: false,

  setCookieBannerVisible: (cookieBannerVisible) => set({ cookieBannerVisible }),
  setTutorialActive: (tutorialActive) => set({ tutorialActive }),
  setPromoOpen: (promoOpen) => set({ promoOpen }),
  setTestingActive: (testingActive) => set({ testingActive }),
}));

// Routes where the learner should not be distracted by floating UI.
const FOCUS_ROUTE_PATTERNS = [
  /^\/course\/[^/]+/,
  /^\/kurs\/[^/]+/,
  /^\/kvizovi\/[^/]+/,
  /^\/quizzes\/[^/]+/,
  /^\/inicijalni-test(\/|$)/,
  /^\/uplatnica(\/|$)/,
  /^\/online-class\//,
  /^\/admin(\/|$)/,
];

// Focus routes where a minimized Alano button is still offered (watching lessons).
const MINIMIZED_ASSISTANT_PATTERNS = [/^\/course\/[^/]+/, /^\/kurs\/[^/]+/];

function stripLatinPrefix(pathname) {
  // Latin mirror (/lat/...) behaves exactly like the Cyrillic route.
  return pathname.replace(/^\/lat(?=\/|$)/, '') || '/';
}

/**
 * Returns 'full' | 'minimized' | 'hidden' — how the dock/assistant launcher should render.
 */
export function getDockMode(pathname, { testingActive = false } = {}) {
  const path = stripLatinPrefix(pathname);
  if (testingActive && /^\/probni-prijemni(\/|$)/.test(path)) return 'hidden';
  if (MINIMIZED_ASSISTANT_PATTERNS.some((re) => re.test(path))) return 'minimized';
  if (FOCUS_ROUTE_PATTERNS.some((re) => re.test(path))) return 'hidden';
  return 'full';
}

export function isFocusRoute(pathname, opts) {
  return getDockMode(pathname, opts) !== 'full';
}
