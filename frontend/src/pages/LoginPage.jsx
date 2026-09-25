import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import SEO from '../components/SEO';
import { authErrorMessage } from '../components/auth/errorMessages';
import AuthShell, { authInputClass, authLabelClass, authIconClass } from '../components/auth/AuthShell';
import Button from '../components/ui/Button';

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
      const returnTo = localStorage.getItem('srpskiusrcu_return_to');
      if (returnTo) {
        localStorage.removeItem('srpskiusrcu_return_to');
        navigate(returnTo, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
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
      const returnTo = localStorage.getItem('srpskiusrcu_return_to');
      if (returnTo) {
        localStorage.removeItem('srpskiusrcu_return_to');
        navigate(returnTo);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(authErrorMessage(err, 'Грешка при пријављивању. Проверите имејл и лозинку.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="ПРИЈАВА" description="Пријавите се на платформу Српски у Срцу." noindex={true} />
      <AuthShell
        title="Добро дошли назад"
        subtitle="Пријавите се на свој налог"
        footer={
          <p>
            Немате налог?{' '}
            <Link to="/register" className="font-semibold text-brand hover:text-brand-700 underline-offset-4 hover:underline">
              Региструјте се бесплатно
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label htmlFor="email" className={authLabelClass}>Имејл адреса</label>
            <div className="relative">
              <Mail className={authIconClass} aria-hidden="true" />
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ime@gmail.com"
                required
                className={`${authInputClass(false)} pr-4`}
              />
            </div>
          </div>

          <div className="group">
            <div className="flex items-baseline justify-between mb-2">
              <label htmlFor="password" className="text-sm font-semibold text-ink">Лозинка</label>
              <Link to="/reset-password" className="text-sm font-semibold text-brand hover:text-brand-700 underline-offset-4 hover:underline">
                Заборавили сте лозинку?
              </Link>
            </div>
            <div className="relative">
              <Lock className={authIconClass} aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={`${authInputClass(false)} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Сакриј лозинку' : 'Прикажи лозинку'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-ink-500 hover:text-brand transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" fullWidth loading={loading} rightIcon={loading ? undefined : ArrowRight}>
            {loading ? 'Пријава у току...' : 'Пријави се'}
          </Button>
        </form>
      </AuthShell>
    </>
  );
}
