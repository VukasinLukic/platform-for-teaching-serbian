import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../services/auth.service';
import SEO from '../components/SEO';
import { zodResolver } from '../components/auth/zodResolver';
import { authErrorMessage } from '../components/auth/errorMessages';
import AuthShell, { authInputClass, authLabelClass, authIconClass } from '../components/auth/AuthShell';
import Button from '../components/ui/Button';

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


function FieldError({ id, error }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm font-medium text-danger">
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


  const fields = [
    { id: 'ime', label: 'Име и презиме', icon: User, type: 'text', autoComplete: 'name', placeholder: 'Марко Марковић' },
    { id: 'email', label: 'Имејл адреса', icon: Mail, type: 'email', autoComplete: 'email', placeholder: 'ime@gmail.com', inputMode: 'email' },
    { id: 'telefon', label: 'Телефон (опционо)', icon: Phone, type: 'tel', autoComplete: 'tel', placeholder: '0612345678', inputMode: 'tel' },
  ];

  return (
    <>
      <SEO title="РЕГИСТРАЦИЈА" description="Региструјте се на платформу Српски у Срцу." noindex={true} />
      <AuthShell
        title="Започните бесплатно"
        subtitle="Креирајте налог за приступ курсевима и квизовима"
        mascot="/mascot/alano-celebrating.webp"
        footer={
          <p>
            Већ имате налог?{' '}
            <Link to="/login" className="font-semibold text-brand hover:text-brand-700 underline-offset-4 hover:underline">
              Пријавите се
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {fields.map(({ id, label, icon: Icon, ...rest }) => (
            <div className="group" key={id}>
              <label htmlFor={id} className={authLabelClass}>{label}</label>
              <div className="relative">
                <Icon className={authIconClass} aria-hidden="true" />
                <input
                  id={id}
                  {...rest}
                  aria-invalid={!!errors[id]}
                  aria-describedby={errors[id] ? `${id}-error` : undefined}
                  className={`${authInputClass(errors[id])} pr-4`}
                  {...register(id)}
                />
              </div>
              <FieldError id={`${id}-error`} error={errors[id]} />
            </div>
          ))}

          <div className="group">
            <label htmlFor="password" className={authLabelClass}>Лозинка</label>
            <div className="relative">
              <Lock className={authIconClass} aria-hidden="true" />
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••"
                aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : 'password-help'}
                className={`${authInputClass(errors.password)} pr-12`} {...register('password')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Сакриј лозинку' : 'Прикажи лозинку'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-ink-500 hover:text-brand transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
            {errors.password ? (
              <FieldError id="password-error" error={errors.password} />
            ) : (
              <p id="password-help" className="mt-2 text-sm text-ink-500">Најмање 8 карактера, бар једно слово и један број</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="confirmPassword" className={authLabelClass}>Поновите лозинку</label>
            <div className="relative">
              <Lock className={authIconClass} aria-hidden="true" />
              <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                className={`${authInputClass(errors.confirmPassword)} pr-12`} {...register('confirmPassword')} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Сакриј лозинку' : 'Прикажи лозинку'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-ink-500 hover:text-brand transition-colors">
                {showConfirmPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
            <FieldError id="confirmPassword-error" error={errors.confirmPassword} />
          </div>

          {/* Terms and parental consent (ZZPL čl. 16: saglasnost roditelja za mlađe od 15 godina) */}
          <label htmlFor="consent" className="flex items-start gap-3 text-sm text-ink-700 cursor-pointer">
            <input
              type="checkbox"
              id="consent"
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? 'consent-error' : undefined}
              {...register('consent')}
              className="mt-0.5 w-5 h-5 rounded accent-brand flex-shrink-0"
            />
            <span>
              Прихватам <Link to="/terms" className="text-brand underline underline-offset-2">услове коришћења</Link> и{' '}
              <Link to="/privacy" className="text-brand underline underline-offset-2">политику приватности</Link>. Ако је ученик млађи од 15 година,
              потврђујем да сам родитељ или старатељ, или да се родитељ сагласио са регистрацијом.
            </span>
          </label>
          <FieldError id="consent-error" error={errors.consent} />

          {success && (
            <div role="status" className="rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
              {success}
            </div>
          )}
          {error && (
            <div role="alert" className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" fullWidth loading={loading} rightIcon={loading ? undefined : ArrowRight}>
            {loading ? 'Регистрација у току...' : 'Креирајте налог'}
          </Button>
        </form>
      </AuthShell>
    </>
  );
}
