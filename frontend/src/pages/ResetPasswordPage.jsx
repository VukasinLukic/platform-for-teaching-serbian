import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Book, CheckCircle, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardBody } from '../components/ui/Card';

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
        setError('Korisnik sa ovim emailom ne postoji');
      } else if (err.code === 'auth/invalid-email') {
        setError('Nevažeći email format');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Previše zahteva. Pokušajte ponovo kasnije.');
      } else {
        setError('Greška pri slanju emaila. Pokušajte ponovo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-12 left-12 opacity-20">
        <div className="w-32 h-32 bg-[#42A5F5] rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-12 right-12 opacity-20">
        <div className="w-40 h-40 bg-[#BFECC9] rounded-full blur-3xl"></div>
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

        {/* Reset Password Card */}
        <Card variant="elevated" className="shadow-2xl">
          <CardBody className="p-8">
            {!success ? (
              <>
                <div className="text-center mb-8">
                  <div className="bg-[#42A5F5]/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-10 h-10 text-[#42A5F5]" />
                  </div>
                  <h2 className="text-3xl font-bold text-[#003366] mb-2">Zaboravili ste lozinku?</h2>
                  <p className="text-gray-600">
                    Unesite vašu email adresu i poslaćemo vam link za resetovanje lozinke.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    label="Email adresa"
                    placeholder="vas@email.com"
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
                    {loading ? 'Slanje emaila...' : 'Pošalji link za resetovanje'}
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
                  <Link
                    to="/login"
                    className="text-sm text-[#003366] hover:text-[#FF6B35] font-medium inline-flex items-center gap-2 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Nazad na prijavu
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-[#003366] mb-4">Email je poslat!</h3>
                <p className="text-gray-700 mb-6">
                  Proverite vaš inbox na <strong>{email}</strong> za link za resetovanje lozinke.
                </p>
                <p className="text-sm text-gray-600 mb-8">
                  Ako ne vidite email, proverite spam folder.
                </p>
                <Link to="/login">
                  <Button variant="primary" size="lg" className="w-full">
                    Nazad na prijavu
                  </Button>
                </Link>
              </div>
            )}
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
