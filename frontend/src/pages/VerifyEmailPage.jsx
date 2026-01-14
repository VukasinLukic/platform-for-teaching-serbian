import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { useAuthStore } from '../store/authStore';

/**
 * Email Verification Page
 * Handles email verification when user clicks the link from their email
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUserProfile } = useAuthStore();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, waiting
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      // No token = user just registered, show waiting screen
      if (!token) {
        setStatus('waiting');
        setMessage('Послали смо вам email са линком за верификацију. Проверите свој inbox и кликните на линк.');
        return;
      }

      try {
        setStatus('verifying');
        setMessage('Verifikujem vaš email...');

        // Call Cloud Function to verify the token
        const verifyEmailToken = httpsCallable(functions, 'verifyEmailToken');
        const result = await verifyEmailToken({ token });

        if (result.data.success) {
          setStatus('success');
          setMessage(result.data.message || 'Email uspešno verifikovan! Možete koristiti aplikaciju.');

          // Refresh user profile to get updated emailVerified status
          try {
            await refreshUserProfile();
          } catch (profileError) {
            console.error('Error refreshing profile:', profileError);
          }

          // Start countdown for redirect
          let seconds = 5;
          setCountdown(seconds);

          const interval = setInterval(() => {
            seconds--;
            setCountdown(seconds);

            if (seconds <= 0) {
              clearInterval(interval);
              navigate('/dashboard');
            }
          }, 1000);

          return () => clearInterval(interval);
        } else {
          setStatus('error');
          setMessage('Greška prilikom verifikacije. Pokušajte ponovo.');
        }
      } catch (error) {
        console.error('Email verification error:', error);

        setStatus('error');

        // Handle specific error messages from backend
        if (error.code === 'not-found') {
          setMessage('Nevažeći ili istekao token. Molimo zatražite novi email za verifikaciju.');
        } else if (error.code === 'already-exists') {
          setMessage('Ovaj token je već iskorišćen. Vaš email je već verifikovan.');
          // Still redirect after 3 seconds
          setTimeout(() => navigate('/dashboard'), 3000);
        } else if (error.code === 'deadline-exceeded') {
          setMessage('Token je istekao. Molimo zatražite novi email za verifikaciju.');
        } else {
          setMessage(error.message || 'Greška prilikom verifikacije. Pokušajte ponovo.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendEmail = async () => {
    try {
      setStatus('verifying');
      setMessage('Šaljem novi email za verifikaciju...');

      const resendVerificationEmail = httpsCallable(functions, 'resendVerificationEmail');
      const result = await resendVerificationEmail();

      if (result.data.success) {
        setStatus('success');
        setMessage('Novi email za verifikaciju je poslat! Proverite svoj inbox.');
      } else {
        setStatus('error');
        setMessage('Greška prilikom slanja email-a. Pokušajte ponovo.');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setStatus('error');
      setMessage(error.message || 'Greška prilikom slanja email-a.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-accent-light flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10">
        {/* Verification Status Icon */}
        <div className="text-center mb-6">
          {status === 'waiting' && (
            <div className="text-7xl mb-4 animate-pulse">📧</div>
          )}
          {status === 'verifying' && (
            <div className="inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary"></div>
            </div>
          )}
          {status === 'success' && (
            <div className="text-7xl mb-4 animate-bounce">✅</div>
          )}
          {status === 'error' && (
            <div className="text-7xl mb-4">❌</div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-4 text-primary">
          {status === 'waiting' && 'Проверите Ваш Email'}
          {status === 'verifying' && 'Verifikacija u toku...'}
          {status === 'success' && 'Email Verifikovan!'}
          {status === 'error' && 'Greška'}
        </h1>

        {/* Message */}
        <p className="text-center text-gray-700 mb-6 text-lg">
          {message}
        </p>

        {/* Success - Show Countdown */}
        {status === 'success' && countdown > 0 && (
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-3">
              Biće vam automatski preusmeren na Dashboard za:
            </p>
            <div className="text-5xl font-bold text-primary animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {status === 'waiting' && (
            <>
              <button
                onClick={handleResendEmail}
                className="w-full bg-accent text-primary py-4 rounded-2xl font-semibold hover:bg-accent-dark transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Пошаљи поново email
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Назад на Пријаву
              </button>
            </>
          )}

          {status === 'success' && (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-primary text-white py-4 rounded-2xl font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Idi na Dashboard
            </button>
          )}

          {status === 'error' && (
            <>
              <button
                onClick={handleResendEmail}
                className="w-full bg-accent text-primary py-4 rounded-2xl font-semibold hover:bg-accent-dark transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Pošalji novi email
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Nazad na Prijavu
              </button>
            </>
          )}
        </div>

        {/* Additional Info */}
        {status === 'waiting' && (
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Савети:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Проверите spam/junk фолдер у вашем email-у</li>
              <li>Email би требало да стигне за 1-2 минута</li>
              <li>Кликните на линк у email-у да верификујете налог</li>
              <li>Након верификације, моћи ћете да приступите апликацији</li>
            </ul>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>💡 Saveti:</strong>
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
              <li>Proverite da li ste kliknuli na najnoviji link</li>
              <li>Link za verifikaciju ističe nakon 60 minuta</li>
              <li>Zatražite novi email ako je link istekao</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
