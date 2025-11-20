import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Book, Trophy } from 'lucide-react';
import { registerUser } from '../services/auth.service';
import { isValidEmail, isValidPhone } from '../utils/helpers';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardBody } from '../components/ui/Card';

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
      setError('Ime i prezime su obavezni');
      return false;
    }

    if (!isValidEmail(formData.email)) {
      setError('Nevažeći email format');
      return false;
    }

    if (formData.telefon && !isValidPhone(formData.telefon)) {
      setError('Nevažeći format telefona (npr. 0612345678)');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Lozinke se ne poklapaju');
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
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email je već registrovan. Pokušajte sa drugim emailom.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Nevažeći email format');
      } else if (err.code === 'auth/weak-password') {
        setError('Lozinka je preslaba. Koristite jače kombinacije.');
      } else {
        setError('Greška pri registraciji. Pokušajte ponovo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-12 right-12 opacity-20">
        <div className="w-40 h-40 bg-[#BFECC9] rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-12 left-12 opacity-20">
        <div className="w-32 h-32 bg-[#FF6B35] rounded-full blur-3xl"></div>
      </div>
      <div className="absolute top-1/3 right-1/4 opacity-10">
        <Trophy className="w-20 h-20 text-[#FFD700]" />
      </div>

      <div className="w-full max-w-lg relative z-10">
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

        {/* Registration Card */}
        <Card variant="elevated" className="shadow-2xl">
          <CardBody className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#003366] mb-2">Započnite besplatno!</h2>
              <p className="text-gray-600">Kreirajte nalog za pristup kursevima</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <Input
                type="text"
                id="ime"
                name="ime"
                label="Ime i prezime"
                placeholder="Marko Marković"
                value={formData.ime}
                onChange={handleChange}
                leftIcon={User}
                required
              />

              {/* Email */}
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

              {/* Phone */}
              <Input
                type="tel"
                id="telefon"
                name="telefon"
                label="Telefon"
                placeholder="0612345678"
                value={formData.telefon}
                onChange={handleChange}
                leftIcon={Phone}
                helperText="Opcionalno"
              />

              {/* Password */}
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

              {/* Confirm Password */}
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                label="Potvrdite lozinku"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={Lock}
                required
              />

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-6"
                loading={loading}
                disabled={loading}
                showArrow
              >
                {loading ? 'Registracija u toku...' : 'Registrujte se besplatno'}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Već imate nalog?{' '}
                <Link
                  to="/login"
                  className="text-[#FF6B35] font-bold hover:text-[#E55A28] transition"
                >
                  Prijavite se
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
