import { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';

export default function EmailVerificationGate() {
  const { user, userProfile, logout, refreshUserProfile } = useAuthStore();
  const [resending, setResending] = useState(false);
  const [emailResent, setEmailResent] = useState(false);

  // Auto-check verification status every 3 seconds
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        await refreshUserProfile();
        // If email is verified, the ProtectedRoute will automatically allow access
      } catch (error) {
        console.error('Error auto-checking verification:', error);
      }
    }, 3000); // Check every 3 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [refreshUserProfile]);

  const handleResendEmail = async () => {
    try {
      setResending(true);
      const resendVerificationEmail = httpsCallable(functions, 'resendVerificationEmail');
      const result = await resendVerificationEmail();

      if (result.data.success) {
        setEmailResent(true);
        setTimeout(() => setEmailResent(false), 5000);
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      alert('Greška prilikom slanja email-a. Pokušajte ponovo.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header - minimalist */}
          <div className="bg-[#D62828] p-6 text-center">
            <Mail className="w-12 h-12 text-white mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white mb-1">Верификујте Email</h1>
            <p className="text-white/90 text-sm">Проверите ваш inbox</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-gray-600 text-sm mb-2">
                Email послат на:
              </p>
              <p className="text-lg font-bold text-[#D62828] mb-4">
                {userProfile?.email || user?.email}
              </p>

              {/* Auto-checking indicator */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <p className="text-xs font-medium">
                    Чекамо верификацију...
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2 font-medium">Шта да урадите:</p>
                <ol className="text-left text-gray-600 text-xs space-y-1.5 max-w-xs mx-auto">
                  <li className="flex gap-2">
                    <span className="text-[#D62828] font-bold">1.</span>
                    <span>Отворите email inbox</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#D62828] font-bold">2.</span>
                    <span>Кликните на верификациони линк</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#D62828] font-bold">3.</span>
                    <span>Аутоматски улазак на платформу</span>
                  </li>
                </ol>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Нисте добили email? Проверите спам фолдер.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Resend Email Button */}
              <button
                onClick={handleResendEmail}
                disabled={resending || emailResent}
                className="w-full bg-white border border-[#D62828] text-[#D62828] py-2.5 rounded-lg font-semibold text-sm hover:bg-[#D62828] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Шаљем...
                  </>
                ) : emailResent ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Послато!
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Пошаљи Поново
                  </>
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
              >
                Одјави се
              </button>
            </div>
          </div>
        </div>

        {/* Help text - compact */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Проблеми?{' '}
            <a href="mailto:kontakt@srpskiusrcu.com" className="text-[#D62828] hover:underline font-medium">
              kontakt@srpskiusrcu.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
