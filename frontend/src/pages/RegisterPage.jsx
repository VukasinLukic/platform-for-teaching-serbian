import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../services/auth.service';
import SEO from '../components/SEO';
import { zodResolver } from '../components/auth/zodResolver';
import { authErrorMessage } from '../components/auth/errorMessages';

const LETTER = /[A-Za-zА-Яа-яЂђЈјЉљЊњЋћЏџČčĆćŠšŽžĐđ]/;

const registerSchema = z
  .object({
    ime: z.string().trim().min(2, 'Унесите име и презиме').max(80, 'Име је предугачко'),
    email: z.string().trim().min(1, 'Унесите имејл адресу').pipe(z.email('Имејл адреса није исправна (нпр. ime@gmail.com)')),
    telefon: z
      .string()
      .trim()
      .refine((v) => v === '' || /^(\+381|0)6\d{7,8}$/.test(v.replace(/[\s/-]/g, '')), 'Неисправан број телефона (нпр. 0612345678)'),
    password: z
      .string()
      .min(8, 'Лозинка мора имати најмање 8 карактера')
      .refine((v) => LETTER.test(v), 'Лозинка мора садржати бар једно слово')
      .refine((v) => /\d/.test(v), 'Лозинка мора садржати бар један број'),
    confirmPassword: z.string().min(1, 'Поновите лозинку'),
    consent: z.literal(true, { error: 'Потребно је да прихватите услове и потврдите сагласност родитеља' }),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Лозинке се не поклапају' });

const inputClass = (hasError) =>
  `w-full pl-12 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 ${
    hasError ? 'border-red-400 focus:border-red-500 bg-red-50/40' : 'border-gray-200 focus:border-[#F2C94C] hover:border-gray-300'
  }`;

function FieldError({ id, error }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm font-medium text-red-600">
      {error.message}
    </p>
  );
}

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { ime: '', email: '', telefon: '', password: '', confirmPassword: '', consent: false },
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    try {
      await registerUser(data.email.trim(), data.password, data.ime.trim(), data.telefon.trim(), {
        termsAndParentalConsent: true,
      });
      setSuccess('Налог је направљен! Послали смо ти имејл са линком за потврду (провери и Spam/Промоције). Можеш одмах да користиш панел и квизове.');
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      console.error('Registration error:', err);
      setError(authErrorMessage(err, 'Грешка при регистрацији. Покушајте поново.'));
    }
  };

  const loading = isSubmitting;
  const labelStyle = { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', letterSpacing: '0.5px' };
  const fieldStyle = { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem' };

  return (
    <>
      <SEO title="РЕГИСТРАЦИЈА" description="Региструјте се на платформу Српски у Срцу." noindex={true} />
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
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="group">
              <label htmlFor="ime" className="block text-[#1A1A1A] mb-2 font-semibold" style={labelStyle}>ИМЕ И ПРЕЗИМЕ</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F2C94C] transition-colors" aria-hidden="true" />
                <input id="ime" type="text" autoComplete="name" placeholder="Марко Марковић"
                  aria-invalid={!!errors.ime} aria-describedby={errors.ime ? 'ime-error' : undefined}
                  className={`${inputClass(errors.ime)} pr-4`} style={fieldStyle} {...register('ime')} />
              </div>
              <FieldError id="ime-error" error={errors.ime} />
            </div>

            <div className="group">
              <label htmlFor="email" className="block text-[#1A1A1A] mb-2 font-semibold" style={labelStyle}>ИМЕЈЛ АДРЕСА</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F2C94C] transition-colors" aria-hidden="true" />
                <input id="email" type="email" autoComplete="email" placeholder="ime@gmail.com" inputMode="email"
                  aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`${inputClass(errors.email)} pr-4`} style={fieldStyle} {...register('email')} />
              </div>
              <FieldError id="email-error" error={errors.email} />
            </div>

            <div className="group">
              <label htmlFor="telefon" className="block text-[#1A1A1A] mb-2 font-semibold" style={labelStyle}>ТЕЛЕФОН (опционо)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F2C94C] transition-colors" aria-hidden="true" />
                <input id="telefon" type="tel" autoComplete="tel" placeholder="0612345678" inputMode="tel"
                  aria-invalid={!!errors.telefon} aria-describedby={errors.telefon ? 'telefon-error' : undefined}
                  className={`${inputClass(errors.telefon)} pr-4`} style={fieldStyle} {...register('telefon')} />
              </div>
              <FieldError id="telefon-error" error={errors.telefon} />
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-[#1A1A1A] mb-2 font-semibold" style={labelStyle}>ЛОЗИНКА</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F2C94C] transition-colors" aria-hidden="true" />
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••"
                  aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : 'password-help'}
                  className={`${inputClass(errors.password)} pr-12`} style={fieldStyle} {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Сакриј лозинку' : 'Прикажи лозинку'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F2C94C] transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password ? (
                <FieldError id="password-error" error={errors.password} />
              ) : (
                <p id="password-help" className="mt-2 text-sm text-gray-500">Најмање 8 карактера, бар једно слово и један број</p>
              )}
            </div>

            <div className="group">
              <label htmlFor="confirmPassword" className="block text-[#1A1A1A] mb-2 font-semibold" style={labelStyle}>ПОНОВИТЕ ЛОЗИНКУ</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F2C94C] transition-colors" aria-hidden="true" />
                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  className={`${inputClass(errors.confirmPassword)} pr-12`} style={fieldStyle} {...register('confirmPassword')} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Сакриј лозинку' : 'Прикажи лозинку'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F2C94C] transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldError id="confirmPassword-error" error={errors.confirmPassword} />
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-5 py-4 rounded-2xl animate-fade-in-up" style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem'}}>
                ✅ {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl animate-fade-in-up" style={{fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem'}}>
                {error}
              </div>
            )}

            {/* Terms and parental consent (ZZPL čl. 16: saglasnost roditelja za mlađe od 15 godina) */}
            <label htmlFor="consent" className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                id="consent"
                aria-invalid={!!errors.consent}
                aria-describedby={errors.consent ? 'consent-error' : undefined}
                {...register('consent')}
                className="mt-1 w-4 h-4 accent-[#D62828] flex-shrink-0"
              />
              <span>
                Прихватам <Link to="/terms" className="text-[#D62828] underline">услове коришћења</Link> и{' '}
                <Link to="/privacy" className="text-[#D62828] underline">политику приватности</Link>. Ако је ученик млађи од 15 година,
                потврђујем да сам родитељ или старатељ, или да се родитељ сагласио са регистрацијом.
              </span>
            </label>
            <FieldError id="consent-error" error={errors.consent} />

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
    </>
  );
}
