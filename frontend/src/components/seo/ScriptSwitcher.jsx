import { useLocation } from 'react-router-dom';
import { IS_LATIN } from '../../seo/script';
import { toLatinPath } from '../../seo/site';

/**
 * "Ћирилица / Latinica" switch between the Cyrillic site and the /lat mirror.
 *
 * Uses plain <a> links (full page load): the script mode and the router
 * basename are chosen once per load (see src/seo/script.js). Marked
 * data-no-translit / data-script-switch so the Latin-mode DOM transliteration
 * leaves the labels and hrefs alone.
 *
 * Mount it anywhere inside <BrowserRouter> (intended: Header/Footer).
 * `className` lets the host position it; `tone="dark"` for dark backgrounds.
 */
export default function ScriptSwitcher({ className = '', tone = 'light' }) {
  const location = useLocation();
  // Inside /lat the router basename strips the prefix, so pathname is Cyrillic.
  const suffix = `${location.search || ''}${location.hash || ''}`;
  const cyrHref = `${location.pathname || '/'}${suffix}`;
  const latHref = `${toLatinPath(location.pathname || '/')}${suffix}`;

  const base =
    'px-2.5 py-1 rounded-full text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';
  const active = tone === 'dark' ? 'bg-white text-ink' : 'bg-ink text-white';
  const idle =
    tone === 'dark' ? 'text-white hover:text-white' : 'text-gray-600 hover:text-brand';

  return (
    <nav
      aria-label="Писмо / Pismo"
      data-no-translit=""
      className={`inline-flex items-center gap-1 rounded-full border ${tone === 'dark' ? 'border-white/30' : 'border-gray-200'} p-0.5 ${className}`}
    >
      <a
        href={cyrHref}
        data-script-switch=""
        hrefLang="sr-Cyrl"
        lang="sr-Cyrl"
        aria-current={!IS_LATIN ? 'true' : undefined}
        className={`${base} ${!IS_LATIN ? active : idle}`}
      >
        Ћирилица
      </a>
      <a
        href={latHref}
        data-script-switch=""
        hrefLang="sr-Latn"
        lang="sr-Latn"
        aria-current={IS_LATIN ? 'true' : undefined}
        className={`${base} ${IS_LATIN ? active : idle}`}
      >
        Latinica
      </a>
    </nav>
  );
}
