import { useState } from 'react';
import { Mail, Send, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { showToast } from '../../utils/toast';

export default function EmailTestingPanel({ isOpen, onClose }) {
  const [testEmail, setTestEmail] = useState('vukasin.lukic.sr@gmail.com');
  const [loadingStates, setLoadingStates] = useState({});
  const [sendingAll, setSendingAll] = useState(false);

  // Get today's date in Serbian format
  const getTodayInSerbian = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    return `${day}.${month}.${year}.`;
  };

  const emailTypes = [
    {
      id: 'contactForm',
      title: 'Kontakt Forma',
      description: 'Email koji se šalje kada korisnik popuni kontakt formu',
      icon: Mail,
      color: 'bg-blue-500',
      functionName: 'sendContactFormEmail',
      testData: {
        name: 'Test Korisnik',
        email: testEmail,
        phone: '0601234567',
        message: 'Ovo je test poruka sa kontakt forme. Testiram funkcionalnost slanja email-ova.'
      }
    },
    {
      id: 'paymentConfirmation',
      title: 'Potvrda Uplate',
      description: 'Email koji se šalje kada se uplata potvrdi',
      icon: CheckCircle2,
      color: 'bg-green-500',
      functionName: 'sendPaymentConfirmationEmail',
      testData: {
        userName: 'Test Korisnik',
        userEmail: testEmail,
        courseTitle: 'Srpski jezik - 8. razred',
        transactionId: 'TEST123456789'
      }
    },
    {
      id: 'paymentRejection',
      title: 'Odbijcna Uplata',
      description: 'Email koji se šalje kada se uplata odbije',
      icon: AlertCircle,
      color: 'bg-red-500',
      functionName: 'sendPaymentRejectionEmail',
      testData: {
        userName: 'Test Korisnik',
        userEmail: testEmail,
        courseTitle: 'Srpski jezik - 8. razred',
        reason: 'Test razlog odbijanja - podaci na uplati se ne poklapaju sa podacima na profilu'
      }
    },
    {
      id: 'welcome',
      title: 'Dobrodošlica',
      description: 'Email koji se šalje novim korisnicima',
      icon: Mail,
      color: 'bg-purple-500',
      functionName: 'sendWelcomeEmail',
      testData: {
        userName: 'Test Korisnik',
        userEmail: testEmail
      }
    },
    {
      id: 'classReminder',
      title: 'Podsetnik za Čas',
      description: 'Email koji se šalje kao podsetnik za onlajn čas',
      icon: Mail,
      color: 'bg-yellow-500',
      functionName: 'sendClassReminderEmail',
      testData: {
        userName: 'Test Korisnik',
        userEmail: testEmail,
        className: 'Online nastava - Srpski jezik',
        classDate: getTodayInSerbian(),
        classTime: '18:00',
        meetLink: 'https://meet.google.com/test-meeting-link',
        groupName: 'Grupa A - 8. razred'
      }
    }
  ];

  const sendTestEmail = async (emailType) => {
    const loadingKey = emailType.id;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));

    try {
      // Update test data with current email
      const testData = {
        ...emailType.testData,
        email: testEmail,
        userEmail: testEmail
      };

      const sendEmail = httpsCallable(functions, emailType.functionName);
      const result = await sendEmail(testData);

      if (result.data.success) {
        showToast.success(`${emailType.title} email uspešno poslat!`);
      } else {
        throw new Error(result.data.error || 'Greška pri slanju email-a');
      }
    } catch (error) {
      console.error(`Error sending ${emailType.title}:`, error);
      showToast.error(`Greška: ${error.message}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const sendAllEmails = async () => {
    setSendingAll(true);
    const toastId = showToast.loading('Šaljem sve test email-ove...');

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const emailType of emailTypes) {
        try {
          const testData = {
            ...emailType.testData,
            email: testEmail,
            userEmail: testEmail
          };

          const sendEmail = httpsCallable(functions, emailType.functionName);
          const result = await sendEmail(testData);

          if (result.data.success) {
            successCount++;
          } else {
            errorCount++;
          }

          // Small delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error sending ${emailType.title}:`, error);
          errorCount++;
        }
      }

      showToast.dismiss(toastId);

      if (errorCount === 0) {
        showToast.success(`Svi email-ovi uspešno poslati! (${successCount}/${emailTypes.length})`);
      } else {
        showToast.error(`Poslato ${successCount}/${emailTypes.length} email-ova. ${errorCount} greške.`);
      }
    } catch (error) {
      showToast.dismiss(toastId);
      showToast.error('Greška pri slanju email-ova');
    } finally {
      setSendingAll(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D62828] to-[#F77F00] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Mail size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold font-serif">Email Testing Panel</h2>
              <p className="text-white/80 mt-1">Testiraj sve email funkcije odjednom</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Email Input */}
          <div className="mb-8 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Test Email Adresa
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#D62828] focus:ring-4 focus:ring-[#D62828]/20 transition-all outline-none font-medium"
              placeholder="vukasin.lukic.sr@gmail.com"
            />
            <p className="text-xs text-gray-500 mt-2">
              Svi test email-ovi će biti poslati na ovu adresu
            </p>
          </div>

          {/* Email Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {emailTypes.map((emailType) => {
              const Icon = emailType.icon;
              const isLoading = loadingStates[emailType.id];

              return (
                <div
                  key={emailType.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-[#D62828]/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`${emailType.color} p-3 rounded-xl text-white`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{emailType.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{emailType.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => sendTestEmail(emailType)}
                    disabled={isLoading || sendingAll}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                      isLoading || sendingAll
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#D62828] to-[#F77F00] hover:shadow-lg hover:scale-105 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Šaljem...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Pošalji Test
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Send All Button */}
          <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] p-6 rounded-2xl">
            <h3 className="text-white font-bold text-xl mb-3 font-serif">Pošalji SVE odjednom</h3>
            <p className="text-white/70 text-sm mb-4">
              Šalje sve {emailTypes.length} test email-ova redom na unetu adresu
            </p>
            <button
              onClick={sendAllEmails}
              disabled={sendingAll || Object.values(loadingStates).some(v => v)}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                sendingAll || Object.values(loadingStates).some(v => v)
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#D62828] to-[#F77F00] hover:shadow-2xl hover:scale-105 text-white'
              }`}
            >
              {sendingAll ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Šaljem sve email-ove...
                </>
              ) : (
                <>
                  <Send size={24} />
                  Pošalji SVE Test Email-ove
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
