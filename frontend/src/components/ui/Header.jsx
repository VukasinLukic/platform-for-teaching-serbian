import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Menu,
  X,
  Home,
  BookOpen,
  Video,
  Info,
  Mail,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from './Button';

const NAV_LINKS = [
  { to: '/', label: 'Почетна', icon: Home },
  { to: '/courses', label: 'Курсеви', icon: BookOpen },
  { to: '/online-nastava', label: 'Online настава', icon: Video },
  { to: '/about', label: 'О нама', icon: Info },
  { to: '/contact', label: 'Контакт', icon: Mail },
];

export default function Header({ transparent = false }) {
  const { user, logout, userProfile } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 shadow-lg transition-all duration-300 ${
          transparent ? 'bg-white/95 backdrop-blur-lg' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center group transition-transform hover:scale-105">
              <img
                src="/icon.webp"
                alt="СРПСКИ У СРЦУ"
                className="h-16 md:h-20 w-auto py-2"
                width="80"
                height="80"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
              <Link to="/" className="text-[#1A1A1A] hover:text-[#D62828] transition">
                Почетна
              </Link>

              <Link to="/courses" className="text-[#1A1A1A] hover:text-[#D62828] transition">
                Курсеви
              </Link>

              <Link to="/online-nastava" className="text-[#1A1A1A] hover:text-[#D62828] transition">
                Online настава
              </Link>

              <Link to="/about" className="text-[#1A1A1A] hover:text-[#D62828] transition">
                О нама
              </Link>

              <Link to="/contact" className="text-[#1A1A1A] hover:text-[#D62828] transition">
                Контакт
              </Link>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-[#1A1A1A] hover:text-[#D62828] transition text-sm font-medium"
                  >
                    Ваш панел
                  </Link>
                  {userProfile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-[#1A1A1A] hover:text-[#D62828] transition text-sm font-medium"
                    >
                      Админ
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={logout}>
                    Одјави се
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-[#1A1A1A] hover:text-[#D62828]">
                      Пријави се
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Региструј се
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Burger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#1A1A1A] hover:text-[#D62828] transition"
              aria-label={mobileMenuOpen ? 'Затвори мени' : 'Отвори мени'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-[#1A1A1A]/55 backdrop-blur-sm menu-backdrop-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-2xl menu-panel-in">
            {/* Menu Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#D62828] to-[#B91F1F] px-5 py-5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <img src="/icon.webp" alt="" className="h-11 w-11 rounded-xl bg-white/15 p-1" />
                <span className="text-white font-bold text-lg leading-tight">Мени</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/85 hover:text-white hover:bg-white/15 p-2 rounded-full transition-colors"
                aria-label="Затвори мени"
              >
                <X size={22} />
              </button>
            </div>

            {/* Profile chip */}
            {user && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 mx-5 mt-5 p-3 rounded-2xl bg-[#FFF5F5] border border-[#D62828]/10 flex-shrink-0 menu-item-in"
                style={{ animationDelay: '40ms' }}
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#D62828] to-[#B91F1F] text-white font-bold text-lg">
                  {userProfile?.ime?.charAt(0)?.toUpperCase() || 'У'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-[#1A1A1A] text-sm">
                    {userProfile?.ime || 'Твој налог'}
                  </span>
                  <span className="block text-xs text-gray-500">Отвори свој панел</span>
                </span>
                <ChevronRight className="h-4 w-4 flex-none text-[#D62828]" />
              </Link>
            )}

            {/* Menu Content */}
            <nav className="flex flex-1 flex-col overflow-y-auto px-5 py-5 gap-1">
              {NAV_LINKS.map(({ to, label, icon: Icon }, index) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 font-semibold text-[15px] text-[#1A1A1A] transition-colors hover:bg-[#FFF5F5] menu-item-in"
                  style={{ animationDelay: `${80 + index * 45}ms` }}
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors group-hover:bg-[#D62828]/10 group-hover:text-[#D62828]">
                    <Icon size={17} />
                  </span>
                  {label}
                </Link>
              ))}

              {userProfile?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 font-semibold text-[15px] text-[#1A1A1A] transition-colors hover:bg-[#FFF5F5] menu-item-in"
                  style={{ animationDelay: `${80 + NAV_LINKS.length * 45}ms` }}
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors group-hover:bg-[#D62828]/10 group-hover:text-[#D62828]">
                    <ShieldCheck size={17} />
                  </span>
                  Админ
                </Link>
              )}

              <div className="flex-1" />

              <div className="border-t border-gray-100 pt-4 mt-4 menu-item-in" style={{ animationDelay: '340ms' }}>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-50 px-5 py-3.5 font-bold text-[#1A1A1A] transition-colors hover:bg-gray-100"
                  >
                    <LogOut size={17} /> Одјави се
                  </button>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 px-5 py-3.5 font-semibold text-[#1A1A1A] transition-colors hover:bg-gray-50"
                    >
                      <LogIn size={17} /> Пријави се
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D62828] to-[#B91F1F] px-5 py-3.5 font-bold text-white shadow-lg shadow-[#D62828]/20 transition-shadow hover:shadow-xl"
                    >
                      <UserPlus size={17} /> Региструј се
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      <style>{`
        @keyframes menu-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes menu-panel-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes menu-item-in { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .menu-backdrop-in { animation: menu-backdrop-in 220ms ease-out; }
        .menu-panel-in { animation: menu-panel-in 320ms cubic-bezier(0.16, 1, 0.3, 1); }
        .menu-item-in { animation: menu-item-in 320ms ease-out backwards; }
        @media (prefers-reduced-motion: reduce) {
          .menu-backdrop-in, .menu-panel-in, .menu-item-in { animation-duration: 1ms; }
        }
      `}</style>
    </>
  );
}
