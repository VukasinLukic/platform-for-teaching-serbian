import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from './Button';

export default function Header({ transparent = false }) {
  const { user, logout, userProfile } = useAuthStore();

  return (
    <header
      className={`sticky top-0 z-50 shadow-lg transition-all duration-300 ${
        transparent ? 'bg-white/95 backdrop-blur-lg' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
              <img
                src="/logoFULL.svg"
                alt="СРПСКИ У СРЦУ"
                className="h-12 w-auto"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link to="/" className="text-[#1A1A1A] hover:text-[#D62828] transition">
                Почетна
              </Link>

              <Link to="/courses" className="text-[#1A1A1A] hover:text-[#D62828] transition">
                Курсеви
              </Link>

              <Link to="/about" className="text-[#1A1A1A] hover:text-[#D62828] transition">
                О нама
              </Link>

              <Link to="/contact" className="text-[#1A1A1A] hover:text-[#D62828] transition">
                Контакт
              </Link>
            </nav>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
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
        </div>
      </div>
    </header>
  );
}
