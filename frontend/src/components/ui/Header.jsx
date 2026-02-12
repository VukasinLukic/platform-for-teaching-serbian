import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from './Button';

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
                src="/icon.png"
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
                    Ваш Панел
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
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-full bg-white shadow-2xl animate-slide-in-right">
            {/* Menu Header */}
            <div className="bg-gradient-to-r from-[#D62828] to-[#B91F1F] p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/icon.png" alt="Logo" className="h-12 w-auto" />
                <span className="text-white font-bold text-lg">Мени</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Content */}
            <nav className="flex flex-col p-6 space-y-2 overflow-y-auto h-[calc(100%-88px)]">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#1A1A1A] hover:bg-gradient-to-r hover:from-[#FFF5F5] hover:to-white px-5 py-4 rounded-2xl transition font-semibold text-base border-l-4 border-transparent hover:border-[#D62828]"
              >
                Почетна
              </Link>

              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#1A1A1A] hover:bg-gradient-to-r hover:from-[#FFF5F5] hover:to-white px-5 py-4 rounded-2xl transition font-semibold text-base border-l-4 border-transparent hover:border-[#D62828]"
              >
                Курсеви
              </Link>

              <Link
                to="/online-nastava"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#1A1A1A] hover:bg-gradient-to-r hover:from-[#FFF5F5] hover:to-white px-5 py-4 rounded-2xl transition font-semibold text-base border-l-4 border-transparent hover:border-[#D62828]"
              >
                Online настава
              </Link>

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#1A1A1A] hover:bg-gradient-to-r hover:from-[#FFF5F5] hover:to-white px-5 py-4 rounded-2xl transition font-semibold text-base border-l-4 border-transparent hover:border-[#D62828]"
              >
                О нама
              </Link>

              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#1A1A1A] hover:bg-gradient-to-r hover:from-[#FFF5F5] hover:to-white px-5 py-4 rounded-2xl transition font-semibold text-base border-l-4 border-transparent hover:border-[#D62828]"
              >
                Контакт
              </Link>

              <div className="border-t-2 border-gray-200 my-6" />

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#1A1A1A] bg-gray-50 hover:bg-gray-100 px-5 py-4 rounded-2xl transition font-semibold text-base border-l-4 border-[#D62828]"
                  >
                    Ваш Панел
                  </Link>
                  {userProfile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[#1A1A1A] bg-gray-50 hover:bg-gray-100 px-5 py-4 rounded-2xl transition font-semibold text-base border-l-4 border-[#D62828]"
                    >
                      Админ
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-left text-white bg-gradient-to-r from-[#D62828] to-[#B91F1F] hover:shadow-xl px-5 py-4 rounded-2xl transition font-bold text-base mt-4"
                  >
                    Одјави се
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#1A1A1A] bg-gray-50 hover:bg-gray-100 px-5 py-4 rounded-2xl transition font-semibold text-base text-center border-2 border-gray-200"
                  >
                    Пријави се
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white bg-gradient-to-r from-[#D62828] to-[#B91F1F] hover:shadow-xl px-5 py-4 rounded-2xl transition font-bold text-base text-center mt-2"
                  >
                    Региструј се
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
