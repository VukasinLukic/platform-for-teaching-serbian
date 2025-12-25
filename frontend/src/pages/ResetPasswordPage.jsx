import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Корисник са овим емаилом не постоји');
      } else if (err.code === 'auth/invalid-email') {
        setError('Неважећи емаил формат');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Превише захтева. Покушајте поново касније.');
      } else {
        setError('Грешка при слању емаила. Покушајте поново.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src="/logoFULL.svg" alt="СРПСКИ У СРЦУ" className="h-16" />
        </Link>

        {/* Reset Password Card */}
        <div className="bg-white rounded-[3rem] shadow-xl p-8 border border-gray-100">
          {!success ? (
            <>
              <div className="text-center mb-8">
                <div className="bg-[#D62828]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-10 h-10 text-[#D62828]" />
                </div>
                <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Заборавили сте лозинку?</h2>
                <p className="text-gray-600">
                  Унесите вашу емаил адресу и послаћемо вам линк за ресетовање лозинке.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  type="email"
                  id="email"
                  name="email"
                  label="Емаил адреса"
                  placeholder="ваш@емаил.рс"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={Mail}
                  required
                  error={error}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Слање емаила...' : 'Пошаљи линк за ресетовање'}
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
                <Link
                  to="/login"
                  className="text-sm text-[#D62828] hover:text-[#B91F1F] font-medium inline-flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад на пријаву
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">Емаил је послат!</h3>
              <p className="text-gray-700 mb-6">
                Проверите ваш inbox на <strong>{email}</strong> за линк за ресетовање лозинке.
              </p>
              <p className="text-sm text-gray-600 mb-8">
                Ако не видите емаил, проверите spam фолдер.
              </p>
              <Link to="/login">
                <Button variant="primary" size="lg" className="w-full">
                  Назад на пријаву
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-[#1A1A1A] font-medium inline-flex items-center gap-2 transition"
          >
            ← Назад на почетну
          </Link>
        </div>
      </div>
    </div>
  );
}
