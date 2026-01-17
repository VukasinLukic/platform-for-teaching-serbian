import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

export default function PaymentSlipPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);

  // Get company data from environment variables
  const bankAccount = import.meta.env.VITE_BANK_ACCOUNT || '265-1110310006926-90';
  const companyName = import.meta.env.VITE_COMPANY_NAME || 'Centar za edukaciju "Baza Znanja Education", Beograd';
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'bazaznanjafon@gmail.com';

  useEffect(() => {
    // Get payment data from location state
    if (location.state?.paymentData) {
      setPaymentData(location.state.paymentData);
    } else {
      // Redirect back if no payment data
      navigate('/kursevi');
    }
  }, [location, navigate]);

  if (!paymentData) {
    return null;
  }

  const {
    amount,
    courseName,
    packageName,
    paymentReference,
    userName,
  } = paymentData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <Header />

      {/* Main Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-gray-600 hover:text-[#D62828] transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>

          <div className="grid lg:grid-cols-[3fr,1fr] gap-8">
            {/* LEFT SIDE - Payment Slip */}
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#D62828] to-[#B91F1F] text-white text-center py-6">
                <h1 className="text-3xl font-bold uppercase tracking-wider">
                  Налог за уплату
                </h1>
              </div>

              {/* Payment Slip Content */}
              <div className="p-6 md:p-10">
                <div className="border-4 border-gray-800 p-8 md:p-10">
                  {/* Top Row */}
                  <div className="grid md:grid-cols-[2fr,1fr] gap-6 mb-6">
                    {/* Left Column - Уплатилац */}
                    <div>
                      <div className="text-xs uppercase font-bold mb-2 text-gray-500">
                        уплатилац
                      </div>
                      <div className="border-2 border-gray-800 p-4 min-h-[80px] font-bold text-lg">
                        {userName || ''}
                      </div>
                    </div>

                    {/* Right Column - Шифра, Валута, Износ */}
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <div className="text-xs uppercase font-bold mb-1 text-gray-500">
                            шифра плаћања
                          </div>
                          <div className="border-2 border-gray-800 p-3 text-center font-bold text-base">
                            189-289*
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs uppercase font-bold mb-1 text-gray-500">
                            валута
                          </div>
                          <div className="border-2 border-gray-800 p-3 text-center font-bold text-base">
                            RSD
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase font-bold mb-1 text-gray-500">
                          износ
                        </div>
                        <div className="border-2 border-gray-800 p-4 text-center font-black text-2xl text-[#D62828]">
                          {amount.toLocaleString('sr-RS')} RSD
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Сврха уплате */}
                    <div>
                      <div className="text-xs uppercase font-bold mb-2 text-gray-500">
                        сврха уплате
                      </div>
                      <div className="border-2 border-gray-800 p-4 min-h-[100px] font-bold text-base">
                        {courseName || packageName || 'Online настава српског језика'}
                      </div>
                    </div>

                    {/* Рачун примаоца */}
                    <div>
                      <div className="text-xs uppercase font-bold mb-2 text-gray-500">
                        рачун примаоца
                      </div>
                      <div className="border-2 border-gray-800 p-4 text-center font-mono font-bold text-base min-h-[100px] flex items-center justify-center">
                        {bankAccount}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Прималац */}
                    <div>
                      <div className="text-xs uppercase font-bold mb-2 text-gray-500">
                        прималац
                      </div>
                      <div className="border-2 border-gray-800 p-4 min-h-[80px] font-bold text-base flex items-center">
                        {companyName}
                      </div>
                    </div>

                    {/* Модел и Позив на број */}
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-24">
                          <div className="text-xs uppercase font-bold mb-1 text-gray-500">
                            модел
                          </div>
                          <div className="border-2 border-gray-800 p-3 text-center font-bold text-base min-h-[50px]">

                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs uppercase font-bold mb-1 text-gray-500">
                            позив на број
                          </div>
                          <div className="border-2 border-gray-800 p-3 text-center font-mono font-bold text-base min-h-[50px] flex items-center justify-center">
                            {paymentReference}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signature Lines */}
                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div>
                      <div className="border-t-2 border-gray-800 pt-2">
                        <div className="text-xs text-gray-500">печат и потпис уплатиоца</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="border-t-2 border-gray-800 pt-2">
                        <div className="text-xs text-gray-500">место и датум пријема</div>
                      </div>
                      <div className="border-t-2 border-gray-800 pt-2">
                        <div className="text-xs text-gray-500">датум валуте</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="mt-6 text-sm text-gray-600 italic">
                  *Шифра плаћања за готовинске уплате је 189, а за online је 289
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Instructions */}
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#F2994A] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black text-white">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      Попуните уплатницу
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Попуните налог за уплату овим подацима и одите у банку или користите е-банкарство.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#F2994A] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black text-white">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      Курсеви ће бити доступни након што уплата легне на рачун
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Приступ курсу ће бити активиран у року од 24 сата након верификације уплате.
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Info Box */}
              <div className="bg-gradient-to-br from-[#FFF5F5] to-white rounded-2xl shadow-lg p-6 border-2 border-[#D62828]/20">
                <div className="flex items-start gap-3 mb-4">
                  <Check className="w-6 h-6 text-[#D62828] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] mb-2">
                      Уколико су вам курсеви хитно потребни
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Проследите доказ о уплати на следећи имејл:
                    </p>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-block bg-[#D62828] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#B91F1F] transition-colors"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Print Styles */}
      <style>{`
        @media print {
          header, footer, button, .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
