import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Book, Sparkles } from 'lucide-react';
import { loginUser } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardBody } from '../components/ui/Card';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    setError(''); // Clear error when user types
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
        setError('Korisnik sa ovim emailom ne postoji');
      } else if (err.code === 'auth/wrong-password') {
        setError('Pogrešna lozinka');
      } else if (err.code === 'auth/invalid-email') {
        setError('Nevažeći email format');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Previše neuspešnih pokušaja. Pokušajte ponovo kasnije.');
      } else {
        setError('Greška pri prijavljivanju. Proverite email i lozinku.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-12 left-12 opacity-20">
        <div className="w-32 h-32 bg-[#BFECC9] rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-12 right-12 opacity-20">
        <div className="w-40 h-40 bg-[#FFD700] rounded-full blur-3xl"></div>
      </div>
      <div className="absolute top-1/2 left-1/4 opacity-10">
        <Sparkles className="w-16 h-16 text-[#FF6B35]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Header */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="bg-[#003366] p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-xl">
            <Book className="h-8 w-8 text-[#BFECC9]" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#003366]">Nauči Srpski</h1>
            <p className="text-sm text-gray-600">Online priprema za maturu</p>
          </div>
        </Link>

        {/* Login Card */}
        <Card variant="elevated" className="shadow-2xl">
          <CardBody className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#003366] mb-2">Dobrodošli nazad!</h2>
              <p className="text-gray-600">Prijavite se na svoj nalog</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                id="email"
                name="email"
                label="Email adresa"
                placeholder="vas@email.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={Mail}
                required
              />

              <Input
                type="password"
                id="password"
                name="password"
                label="Lozinka"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                leftIcon={Lock}
                required
                helperText="Najmanje 6 karaktera"
              />

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/reset-password"
                  className="text-sm text-[#003366] hover:text-[#FF6B35] font-medium transition"
                >
                  Zaboravili ste lozinku?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
                showArrow
              >
                {loading ? 'Prijava u toku...' : 'Prijavite se'}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Nemate nalog?{' '}
                <Link
                  to="/register"
                  className="text-[#FF6B35] font-bold hover:text-[#E55A28] transition"
                >
                  Registrujte se besplatno
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-[#003366] font-medium inline-flex items-center gap-2 transition"
          >
            ← Nazad na početnu
          </Link>
        </div>
      </div>
    </div>
  );
}
