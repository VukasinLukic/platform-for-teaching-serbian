import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Sparkles, Award } from 'lucide-react';
import { registerUser } from '../services/auth.service';
import { sendWelcomeEmail } from '../services/email.service';
import { isValidEmail, isValidPhone } from '../utils/helpers';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    ime: '',
    email: '',
    telefon: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.ime.trim()) {
      setError('Име и презиме су обавезни');
      return false;
    }

    if (!isValidEmail(formData.email)) {
      setError('Неважећи емаил формат');
      return false;
    }

    if (formData.telefon && !isValidPhone(formData.telefon)) {
      setError('Неважећи формат телефона (нпр. 0612345678)');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Лозинка мора имати најмање 6 карактера');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Лозинке се не поклапају');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await registerUser(
        formData.email,
        formData.password,
        formData.ime,
        formData.telefon
      );

      // Send welcome email
      try {
        await sendWelcomeEmail(formData.email, formData.ime);
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr);
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Емаил је већ регистрован. Покушајте са другим емаилом.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Неважећи емаил формат');
      } else if (err.code === 'auth/weak-password') {
        setError('Лозинка је преслаба. Користите јаче комбинације.');
      } else {
        setError('Грешка при регистрацији. Покушајте поново.');
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

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
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

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        .animate-glow {
          animation: glow 4s ease-in-out infinite;
        }
      `}</style>

      {/* LEFT SIDE - Logo Only */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden">
        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full pl-20 pr-2 animate-slide-in-left -mt-16">
          {/* Logo */}
          <div className="w-full max-w-3xl">
            <img
              src="/logoFULL.svg"
              alt="СРПСКИ У СРЦУ"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Clean & Sophisticated Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-start p-8 lg:pl-8 lg:pr-16 relative bg-white overflow-y-auto">
        {/* Subtle Background Texture */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #1A1A1A 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-slide-in-right py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/">
              <img src="/logoFULL.svg" alt="СРПСКИ У СРЦУ" className="h-16 mx-auto" />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-10 animate-fade-in-up">
            <h2 className="text-[#1A1A1A] mb-3" style={{fontFamily: "'Playfair Display', serif", fontSize: '2.75rem', fontWeight: '700', lineHeight: '1.1'}}>
              Започните<br />бесплатно
            </h2>
            <p className="text-gray-600" style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.125rem', fontWeight: '400'}}>
              Креирајте налог за приступ курсевима
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            {/* Name Field */}
            <div className="group">
              <label
                htmlFor="ime"
                className="block text-[#1A1A1A] mb-2 font-semibold"
                style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', letterSpacing: '0.5px'}}
              >
                ИМЕ И ПРЕЗИМЕ
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F2C94C] transition-colors" />
                <input
                  type="text"
                  id="ime"
                  name="ime"
                  value={formData.ime}
                  onChange={handleChange}
                  placeholder="Марко Марковић"
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#F2C94C] focus:outline-none transition-all duration-300 hover:border-gray-300"
                  style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem'}}
                />
              </div>
            </div>

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
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F2C94C] transition-colors" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ваш@емаил.рс"
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#F2C94C] focus:outline-none transition-all duration-300 hover:border-gray-300"
                  style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem'}}
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="group">
              <label
                htmlFor="telefon"
                className="block text-[#1A1A1A] mb-2 font-semibold"
                style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', letterSpacing: '0.5px'}}
              >
                ТЕЛЕФОН <span className="text-gray-400 font-normal">(опционално)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F2C94C] transition-colors" />
                <input
                  type="tel"
                  id="telefon"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleChange}
                  placeholder="0612345678"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#F2C94C] focus:outline-none transition-all duration-300 hover:border-gray-300"
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
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F2C94C] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#F2C94C] focus:outline-none transition-all duration-300 hover:border-gray-300"
                  style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem'}}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F2C94C] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
                Најмање 6 карактера
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label
                htmlFor="confirmPassword"
                className="block text-[#1A1A1A] mb-2 font-semibold"
                style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', letterSpacing: '0.5px'}}
              >
                ПОТВРДИТЕ ЛОЗИНКУ
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F2C94C] transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#F2C94C] focus:outline-none transition-all duration-300 hover:border-gray-300"
                  style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem'}}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F2C94C] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl animate-fade-in-up" style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem'}}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#F2C94C] to-[#D4A843] text-[#1A1A1A] py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-[#F2C94C]/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
              style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', letterSpacing: '0.5px'}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  РЕГИСТРАЦИЈА У ТОКУ...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  КРЕИРАЈТЕ НАЛОГ
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-8 border-t-2 border-gray-100 text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <p className="text-gray-600" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
              Већ имате налог?{' '}
              <Link
                to="/login"
                className="text-[#F2C94C] font-bold hover:text-[#D4A843] transition-colors inline-flex items-center gap-1 group"
              >
                Пријавите се
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center animate-fade-in-up" style={{animationDelay: '0.5s'}}>
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
