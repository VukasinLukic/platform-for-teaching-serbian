import { Link } from 'react-router-dom';
import { Book } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from './Button';

export default function Header({ transparent = false }) {
  const { user, logout, userProfile } = useAuthStore();

  return (
    <header
      className={`sticky top-0 z-50 shadow-lg transition-all duration-300 ${
        transparent ? 'bg-[#003366]/95 backdrop-blur-lg' : 'bg-[#003366]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-[#BFECC9] p-2 rounded-xl transition-transform group-hover:scale-110">
                <Book className="h-6 w-6 text-[#003366]" />
              </div>
              <span className="text-2xl font-serif font-bold text-white">Nauči Srpski</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link to="/" className="text-white hover:text-[#BFECC9] transition">
                Početna
              </Link>

              <Link to="/courses" className="text-white hover:text-[#BFECC9] transition">
                Kursevi
              </Link>

              <Link to="/about" className="text-white hover:text-[#BFECC9] transition">
                O nama
              </Link>
              
              <Link to="/contact" className="text-white hover:text-[#BFECC9] transition">
                Kontakt
              </Link>
            </nav>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-white hover:text-[#BFECC9] transition text-sm font-medium"
                >
                  Vaš Panel
                </Link>
                {userProfile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-white hover:text-[#BFECC9] transition text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Button variant="outlineWhite" size="sm" onClick={logout}>
                  Odjavi se
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:text-[#BFECC9]">
                    Prijavi se
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outlineWhite" size="sm">
                    Registruj se
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
