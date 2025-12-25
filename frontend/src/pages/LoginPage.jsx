import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Корисник са овим емаилом не постоји');
      } else if (err.code === 'auth/wrong-password') {
        setError('Погрешна лозинка');
      } else if (err.code === 'auth/invalid-email') {
        setError('Неважећи емаил формат');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Превише неуспешних покушаја. Покушајте поново касније.');
      } else {
        setError('Грешка при пријављивању. Проверите емаил и лозинку.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-rotate {
          animation: rotate 20s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* LEFT SIDE - Logo Only */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden">
        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 animate-slide-in-left">
          {/* Logo */}
          <div className="w-full max-w-2xl">
            <img
              src="/logoFULL.svg"
              alt="СРПСКИ У СРЦУ"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Clean & Sophisticated Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative bg-white">
        {/* Subtle Background Texture */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #1A1A1A 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-slide-in-right">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/">
              <img src="/logoFULL.svg" alt="СРПСКИ У СРЦУ" className="h-16 mx-auto" />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-12 animate-fade-in-up">
            <h2 className="text-[#1A1A1A] mb-3" style={{fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: '700', lineHeight: '1.1'}}>
              Добродошли<br />назад
            </h2>
            <p className="text-gray-600" style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.125rem', fontWeight: '400'}}>
              Пријавите се на свој налог
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            {/* Email Field */}
            <div className="group">
              <label
                htmlFor="email"
                className="block text-[#1A1A1A] mb-2 font-semibold"
                style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', letterSpacing: '0.5px'}}
              >
                ЕМАИЛ АДРЕСА
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#D62828] transition-colors" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ваш@емаил.рс"
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#D62828] focus:outline-none transition-all duration-300 hover:border-gray-300"
                  style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem'}}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label
                htmlFor="password"
                className="block text-[#1A1A1A] mb-2 font-semibold"
                style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', letterSpacing: '0.5px'}}
              >
                ЛОЗИНКА
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#D62828] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#D62828] focus:outline-none transition-all duration-300 hover:border-gray-300"
                  style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem'}}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D62828] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                Најмање 6 карактера
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl animate-fade-in-up" style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem'}}>
                {error}
              </div>
            )}

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/reset-password"
                className="text-[#D62828] hover:text-[#B91F1F] font-semibold transition-colors inline-flex items-center gap-1 group"
                style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem'}}
              >
                Заборавили сте лозинку?
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D62828] to-[#B91F1F] text-white py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-[#D62828]/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
              style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', letterSpacing: '0.5px'}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ПРИЈАВА У ТОКУ...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  ПРИЈАВИ СЕ
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 pt-8 border-t-2 border-gray-100 text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <p className="text-gray-600" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
              Немате налог?{' '}
              <Link
                to="/register"
                className="text-[#D62828] font-bold hover:text-[#B91F1F] transition-colors inline-flex items-center gap-1 group"
              >
                Региструјте се бесплатно
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <Link
              to="/"
              className="text-gray-500 hover:text-[#1A1A1A] font-medium inline-flex items-center gap-2 group transition-colors"
              style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem'}}
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Назад на почетну
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
