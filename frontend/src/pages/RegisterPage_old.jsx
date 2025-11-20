import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/auth.service';
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user types
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">
            Nauči Srpski
          </h1>
          <p className="text-gray-600">Kreirajte svoj nalog</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="ime" className="block text-sm font-medium text-gray-700 mb-1">
                Ime i prezime <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ime"
                name="ime"
                value={formData.ime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="Marko Marković"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email adresa <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="vas@email.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                id="telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="0612345678"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Lozinka <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Najmanje 6 karaktera</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Potvrdite lozinku <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-opacity-90 text-secondary font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Registracija u toku...' : 'Registrujte se'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Već imate nalog?{' '}
              <Link to="/login" className="text-secondary font-semibold hover:underline">
                Prijavite se
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-secondary">
            ← Nazad na početnu
          </Link>
        </div>
      </div>
    </div>
  );
}
