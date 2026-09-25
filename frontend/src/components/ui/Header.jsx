import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Menu, X, ChevronDown, ClipboardList, GraduationCap, ListChecks, LayoutDashboard, ShieldCheck, LogOut, Mail, CircleHelp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// Primary navigation (Contact and FAQ live in the footer and in the mobile menu).
const NAV_ITEMS = [
  { to: '/courses', label: 'Курсеви' },
  { to: '/online-nastava', label: 'Онлајн настава' },
  { id: 'tests', label: 'Тестови' },
  { to: '/blog', label: 'Блог' },
  { to: '/about', label: 'О нама' },
];

const TEST_LINKS = [
  { to: '/inicijalni-test/5', label: 'Иницијални тест — 5. разред', icon: ClipboardList },
  { to: '/inicijalni-test/6', label: 'Иницијални тест — 6. разред', icon: ClipboardList },
  { to: '/inicijalni-test/7', label: 'Иницијални тест — 7. разред', icon: ClipboardList },
  { to: '/inicijalni-test/8', label: 'Иницијални тест — 8. разред', icon: ClipboardList },
  { to: '/probni-prijemni', label: 'Пробни пријемни', hint: 'Бесплатно · 20 питања', icon: GraduationCap },
  { to: '/kvizovi', label: 'Квизови', hint: 'Вежбај по областима', icon: ListChecks },
];

const TEST_PATH_RE = /^(\/lat)?\/(inicijalni-test|probni-prijemni|kvizovi|quizzes)(\/|$)/;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const desktopLinkClass = ({ isActive }) =>
  `relative inline-flex items-center h-10 px-3 rounded-full text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828]/40 ${
    isActive ? 'text-[#D62828] bg-red-50' : 'text-[#1A1A1A] hover:text-[#D62828] hover:bg-red-50/60'
  }`;

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

/** Accessible "Тестови" dropdown: button + menu of links, keyboard and Escape aware. */
function TestsDropdown({ active }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const menuId = useId();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const focusItem = (index) => {
    const items = wrapRef.current?.querySelectorAll('[data-menu-item]');
    if (!items?.length) return;
    const i = (index + items.length) % items.length;
    items[i].focus();
  };

  const onButtonKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusItem(0));
    }
  };

  const onMenuKeyDown = (e) => {
    const items = Array.from(wrapRef.current?.querySelectorAll('[data-menu-item]') || []);
    const current = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusItem(current + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusItem(current - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusItem(items.length - 1);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        className={`${desktopLinkClass({ isActive: active })} gap-1`}
      >
        Тестови
        <ChevronDown
          className={`w-4 h-4 motion-safe:transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        // pt-2 keeps the hover bridge between button and panel
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
          <ul
            id={menuId}
            onKeyDown={onMenuKeyDown}
            className="w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-2 motion-safe:animate-dropdown-in"
          >
            <li className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-gray-500">
              Иницијални тестови (бесплатно)
            </li>
            <li className="grid grid-cols-4 gap-1.5 px-1 pb-2">
              {TEST_LINKS.slice(0, 4).map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  data-menu-item
                  aria-label={t.label}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center rounded-xl py-2.5 border text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828]/40 ${
                      isActive
                        ? 'border-[#D62828] bg-red-50 text-[#D62828]'
                        : 'border-gray-100 hover:border-[#D62828]/40 hover:bg-red-50/60 text-[#1A1A1A]'
                    }`
                  }
                >
                  <span className="text-lg font-black leading-none">{t.to.slice(-1)}.</span>
                  <span className="text-xs text-gray-500 mt-1">разред</span>
                </NavLink>
              ))}
            </li>
            <li role="separator" className="h-px bg-gray-100 mx-2 my-1" />
            {TEST_LINKS.slice(4).map((t) => (
              <li key={t.to}>
                <NavLink
                  to={t.to}
                  data-menu-item
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828]/40 ${
                      isActive ? 'bg-red-50 text-[#D62828]' : 'hover:bg-gray-50 text-[#1A1A1A]'
                    }`
                  }
                >
                  <span className="w-9 h-9 rounded-lg bg-red-50 text-[#D62828] flex items-center justify-center flex-shrink-0">
                    <t.icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{t.label}</span>
                    {t.hint && <span className="block text-xs text-gray-500">{t.hint}</span>}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Full-height mobile menu dialog with focus trap, Escape, scroll lock. */
function MobileMenu({ open, onClose, user, userProfile, onLogout, scriptSwitcher }) {
  const panelRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = requestAnimationFrame(() => {
      panelRef.current?.querySelector('[data-autofocus]')?.focus();
    });

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll(FOCUSABLE));
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(focusTimer);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKey);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const rowClass = ({ isActive }) =>
    `flex items-center justify-between min-h-[48px] px-4 rounded-xl text-base font-semibold transition-colors ${
      isActive ? 'bg-red-50 text-[#D62828]' : 'text-[#1A1A1A] hover:bg-gray-50'
    }`;

  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <div
        className="absolute inset-0 bg-[#1A1A1A]/50 motion-safe:animate-overlay-fade"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 w-full sm:w-[24rem] bg-white shadow-2xl flex flex-col motion-safe:animate-drawer-in-right"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingRight: 'env(safe-area-inset-right)' }}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100 flex-shrink-0">
          <h2 id={titleId} className="text-base font-bold text-[#1A1A1A]">
            Мени
          </h2>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-[#1A1A1A] hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828]/40"
            aria-label="Затвори мени"
          >
            <X size={22} />
          </button>
        </div>

        <nav aria-label="Главна навигација" className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <ul className="space-y-1">
            <li>
              <NavLink to="/" end className={rowClass}>
                Почетна
              </NavLink>
            </li>
            {NAV_ITEMS.filter((i) => i.to).slice(0, 2).map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={rowClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-2xl bg-[#FFF8F8] border border-red-100 p-3">
            <p className="px-1 pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Тестови</p>
            <div className="grid grid-cols-4 gap-2">
              {TEST_LINKS.slice(0, 4).map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  aria-label={t.label}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center min-h-[56px] rounded-xl border bg-white ${
                      isActive ? 'border-[#D62828] text-[#D62828]' : 'border-gray-200 text-[#1A1A1A]'
                    }`
                  }
                >
                  <span className="text-lg font-black leading-none">{t.to.slice(-1)}.</span>
                  <span className="text-xs text-gray-500 mt-0.5">разред</span>
                </NavLink>
              ))}
            </div>
            <ul className="mt-2 space-y-1">
              {TEST_LINKS.slice(4).map((t) => (
                <li key={t.to}>
                  <NavLink to={t.to} className={rowClass}>
                    <span className="flex items-center gap-3">
                      <t.icon className="w-5 h-5 text-[#D62828]" aria-hidden="true" />
                      {t.label}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <ul className="mt-4 space-y-1">
            {NAV_ITEMS.filter((i) => i.to).slice(2).map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={rowClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink to="/contact" className={rowClass}>
                <span className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" aria-hidden="true" /> Контакт
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/faq" className={rowClass}>
                <span className="flex items-center gap-3">
                  <CircleHelp className="w-5 h-5 text-gray-400" aria-hidden="true" /> Честа питања
                </span>
              </NavLink>
            </li>
          </ul>

          {/* INTEGRATION SLOT (mobile): ScriptSwitcher renders here when passed to <Header scriptSwitcher={...} /> */}
          {scriptSwitcher && <div className="mt-4 px-1">{scriptSwitcher}</div>}
        </nav>

        <div className="flex-shrink-0 border-t border-gray-100 p-4 space-y-2">
          {user ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 min-h-[48px] rounded-full bg-[#1A1A1A] text-white font-bold"
                >
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" /> Мој панел
                </Link>
                {userProfile?.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="flex items-center justify-center gap-2 min-h-[48px] rounded-full border-2 border-gray-200 text-[#1A1A1A] font-bold"
                  >
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Админ
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 min-h-[48px] rounded-full border-2 border-gray-200 text-[#1A1A1A] font-bold"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" /> Одјави се
                  </button>
                )}
              </div>
              {userProfile?.role === 'admin' && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full min-h-[44px] rounded-full text-gray-600 font-semibold hover:bg-gray-50"
                >
                  Одјави се
                </button>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                className="flex items-center justify-center min-h-[48px] rounded-full border-2 border-gray-200 text-[#1A1A1A] font-bold"
              >
                Пријави се
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center min-h-[48px] rounded-full bg-[#D62828] text-white font-bold shadow-md shadow-red-900/10"
              >
                Региструј се
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Site header.
 *
 * @param {boolean} [transparent]  translucent background (kept for existing callers)
 * @param {React.ReactNode} [scriptSwitcher]
 *   INTEGRATION SLOT: the Cyrillic/Latin `ScriptSwitcher` (components/seo/ScriptSwitcher.jsx,
 *   built by the SEO agent) is mounted here. During integration either pass it from pages
 *   (`<Header scriptSwitcher={<ScriptSwitcher />} />`) or import it in this file and use it
 *   as the default value of this prop. It renders next to the auth buttons on desktop and
 *   inside the mobile menu.
 */
export default function Header({ transparent = false, scriptSwitcher = null }) {
  const { user, logout, userProfile } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrolled = useScrolled();
  const location = useLocation();
  const testsActive = TEST_PATH_RE.test(location.pathname);

  // Close the mobile menu on every route change.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b motion-safe:transition-[background-color,box-shadow,border-color] motion-safe:duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md border-gray-200/80 shadow-[0_6px_24px_-12px_rgba(26,26,26,0.25)]'
            : transparent
              ? 'bg-white/70 backdrop-blur-md border-transparent'
              : 'bg-white border-gray-100'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-14 motion-safe:transition-[height] motion-safe:duration-300 ${
            scrolled ? 'lg:h-14' : 'lg:h-[72px]'
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center flex-shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828]/40"
            aria-label="Српски у срцу — почетна"
          >
            <img
              src="/footer.webp"
              alt=""
              className={`w-auto motion-safe:transition-[height] motion-safe:duration-300 h-9 ${scrolled ? 'lg:h-9' : 'lg:h-11'}`}
              width="766"
              height="291"
            />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Главна навигација" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) =>
                item.id === 'tests' ? (
                  <li key="tests">
                    <TestsDropdown active={testsActive} />
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink to={item.to} className={desktopLinkClass}>
                      {item.label}
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* INTEGRATION SLOT (desktop): ScriptSwitcher */}
            {scriptSwitcher}
            {user ? (
              <>
                <NavLink to="/dashboard" className={desktopLinkClass}>
                  Мој панел
                </NavLink>
                {userProfile?.role === 'admin' && (
                  <NavLink to="/admin" className={desktopLinkClass}>
                    Админ
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center h-10 px-4 rounded-full border-2 border-gray-200 text-sm font-bold text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828]/40"
                >
                  Одјави се
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center h-10 px-4 rounded-full text-[15px] font-semibold text-[#1A1A1A] hover:text-[#D62828] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828]/40"
                >
                  Пријави се
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center h-10 px-5 rounded-full bg-[#D62828] text-white text-[15px] font-bold shadow-md shadow-red-900/10 hover:bg-[#B91F1F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D62828]"
                >
                  Региструј се
                </Link>
              </>
            )}
          </div>

          {/* Mobile: primary CTA + burger */}
          <div className="flex items-center gap-1 lg:hidden">
            {!user && (
              <Link
                to="/register"
                className="hidden min-[400px]:inline-flex items-center h-9 px-4 rounded-full bg-[#D62828] text-white text-sm font-bold"
              >
                Региструј се
              </Link>
            )}
            {user && (
              <Link
                to="/dashboard"
                className="inline-flex items-center h-9 px-3 rounded-full text-sm font-semibold text-[#1A1A1A] hover:bg-gray-100"
              >
                Мој панел
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-[#1A1A1A] hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828]/40"
              aria-label="Отвори мени"
              aria-expanded={mobileMenuOpen}
              aria-haspopup="dialog"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={closeMenu}
        user={user}
        userProfile={userProfile}
        onLogout={handleLogout}
        scriptSwitcher={scriptSwitcher}
      />
    </>
  );
}
