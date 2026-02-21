import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Upload, Download, Printer } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

export default function PaymentSlipPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const uplatnicaRef = useRef(null);

  const bankAccount = import.meta.env.VITE_BANK_ACCOUNT || '1701009451800050';
  const companyName = import.meta.env.VITE_COMPANY_NAME || 'Marina Lukic';

  useEffect(() => {
    if (location.state?.paymentData) {
      setPaymentData(location.state.paymentData);
    } else {
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

  const formattedAmount = `=${amount.toLocaleString('sr-RS')},00`;
  const purposeText = courseName || packageName || 'Online nastava srpskog jezika';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(uplatnicaRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `uplatnica-${paymentReference || 'download'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <Header />

      <div className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-gray-600 hover:text-[#D62828] transition-colors no-print"
          >
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>

          <div className="grid lg:grid-cols-[3fr,1fr] gap-8">
            {/* LEFT SIDE - Payment Slip */}
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden">
              {/* Header with title + buttons */}
              <div className="bg-gradient-to-r from-[#D62828] to-[#B91F1F] text-white py-5 px-6 flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider">
                  Налог за уплату
                </h1>
                <div className="flex gap-2 no-print">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-bold transition-all backdrop-blur-sm"
                  >
                    <Printer size={16} />
                    <span className="hidden sm:inline">Штампај</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 bg-white text-[#D62828] hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-bold transition-all"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Скини</span>
                  </button>
                </div>
              </div>

              {/* Uplatnica - Pure CSS recreation */}
              <div className="p-4 md:p-8 overflow-x-auto">
                <div
                  ref={uplatnicaRef}
                  data-uplatnica
                  className="mx-auto bg-white"
                  style={{
                    width: '780px',
                    minWidth: '780px',
                    height: '356px',
                    border: '1px solid #999',
                    fontFamily: 'Arial, Verdana, sans-serif',
                    fontSize: '12px',
                    position: 'relative',
                  }}
                >
                  {/* ===== LEFT SIDE (uplatilac, svrha, primalac) ===== */}
                  <div
                    style={{
                      float: 'left',
                      width: '370px',
                      height: '227px',
                      marginTop: '34px',
                      marginLeft: '19px',
                      borderRight: '1px solid #999',
                      paddingRight: '10px',
                    }}
                  >
                    {/* Уплатилац */}
                    <div style={{ marginBottom: '2px', fontSize: '12px', color: '#333' }}>
                      уплатилац
                    </div>
                    <div
                      style={{
                        border: '1px solid #333',
                        width: '344px',
                        height: '57px',
                        padding: '4px 6px',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {userName || ''}
                      </span>
                    </div>

                    {/* Сврха уплате */}
                    <div style={{ marginBottom: '2px', fontSize: '12px', color: '#333' }}>
                      сврха уплате
                    </div>
                    <div
                      style={{
                        border: '1px solid #333',
                        width: '344px',
                        height: '57px',
                        padding: '4px 6px',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.3' }}>
                        {purposeText}
                      </span>
                    </div>

                    {/* Прималац */}
                    <div style={{ marginBottom: '2px', fontSize: '12px', color: '#333' }}>
                      прималац
                    </div>
                    <div
                      style={{
                        border: '1px solid #333',
                        width: '344px',
                        height: '57px',
                        padding: '4px 6px',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {companyName}
                      </span>
                    </div>
                  </div>

                  {/* ===== RIGHT SIDE (naslov, iznos, racun, poziv) ===== */}
                  <div
                    style={{
                      float: 'right',
                      width: '380px',
                      height: '265px',
                    }}
                  >
                    {/* Title - НАЛОГ ЗА УПЛАТУ */}
                    <div
                      style={{
                        textTransform: 'uppercase',
                        fontWeight: '900',
                        fontFamily: 'Verdana, Geneva, sans-serif',
                        fontSize: '16px',
                        float: 'right',
                        width: '174px',
                        marginRight: '26px',
                        marginTop: '11px',
                        letterSpacing: '0.5px',
                      }}
                    >
                      налог за уплату
                    </div>

                    {/* Clear float */}
                    <div style={{ clear: 'both' }}></div>

                    {/* Šifra, Valuta, Iznos row */}
                    <div
                      style={{
                        width: '348px',
                        marginTop: '30px',
                        marginLeft: '20px',
                      }}
                    >
                      {/* Labels row */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '3px' }}>
                        <div style={{ width: '50px', fontSize: '11px', color: '#333', lineHeight: '1.2' }}>
                          шифра плаћања
                        </div>
                        <div style={{ width: '50px', marginLeft: '14px', fontSize: '12px', color: '#333' }}>
                          валута
                        </div>
                        <div style={{ flex: 1, marginLeft: '14px', fontSize: '12px', color: '#333' }}>
                          износ
                        </div>
                      </div>
                      {/* Input boxes row */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '50px',
                            height: '24px',
                            border: '2px solid #333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>289</span>
                        </div>
                        <div
                          style={{
                            width: '50px',
                            height: '24px',
                            border: '2px solid #333',
                            marginLeft: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textTransform: 'uppercase',
                          }}
                        >
                          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>RSD</span>
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: '24px',
                            border: '2px solid #333',
                            marginLeft: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ fontWeight: '900', fontSize: '16px', color: '#D62828' }}>
                            {formattedAmount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Рачун примаоца */}
                    <div
                      style={{
                        width: '348px',
                        marginLeft: '20px',
                        marginTop: '12px',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#333', marginBottom: '3px' }}>
                        рачун примаоца
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '24px',
                          border: '2px solid #333',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            letterSpacing: '1.5px',
                          }}
                        >
                          {bankAccount}
                        </span>
                      </div>
                    </div>

                    {/* Модел и позив на број */}
                    <div
                      style={{
                        width: '348px',
                        marginLeft: '20px',
                        marginTop: '12px',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#333', marginBottom: '3px' }}>
                        модел и позив на број (одобрење)
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '50px',
                            height: '24px',
                            border: '2px solid #333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>97</span>
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: '24px',
                            border: '2px solid #333',
                            marginLeft: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              color: '#D62828',
                            }}
                          >
                            {paymentReference}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ===== FOOTER ===== */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      width: '100%',
                      height: '70px',
                      paddingLeft: '19px',
                      paddingTop: '10px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      paddingBottom: '8px',
                    }}
                  >
                    {/* Печат и потпис */}
                    <div style={{ width: '200px' }}>
                      <div style={{ borderTop: '1px solid #333', paddingTop: '2px', fontSize: '11px', color: '#333' }}>
                        печат и потпис уплатиоца
                      </div>
                    </div>

                    {/* Место и датум */}
                    <div style={{ width: '190px', marginLeft: '70px' }}>
                      <div style={{ borderTop: '1px solid #333', paddingTop: '2px', fontSize: '11px', color: '#333' }}>
                        место и датум пријема
                      </div>
                    </div>

                    {/* Датум валуте */}
                    <div style={{ width: '130px', marginLeft: '50px' }}>
                      <div style={{ borderTop: '1px solid #333', paddingTop: '2px', fontSize: '11px', color: '#333' }}>
                        датум валуте
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Instructions */}
            <div className="space-y-6 no-print">
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

              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#F2994A] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black text-white">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      {courseName
                        ? 'Курсеви ће бити доступни након што уплата легне на рачун'
                        : 'Часови ће бити доступни након што уплата легне на рачун'
                      }
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {courseName
                        ? 'Приступ курсу ће бити активиран у року од 24 сата након верификације уплате.'
                        : 'Приступ часовима ће бити активиран у року од 24 сата након верификације уплате.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#F2994A] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black text-white">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      Поставите потврду уплате
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      Након уплате, поставите слику уплатнице на свом панелу како бисмо брже верификовали уплату.
                    </p>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="inline-flex items-center gap-2 bg-[#D62828] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#B91F1F] transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Отвори мој панел
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#FFF5F5] to-white rounded-2xl shadow-lg p-6 border-2 border-[#D62828]/20">
                <div className="flex items-start gap-3 mb-4">
                  <Check className="w-6 h-6 text-[#D62828] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] mb-2">
                      Уколико су вам {courseName ? 'курсеви' : 'часови'} хитно потребни
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Проследите доказ о уплати на следећи имејл:
                    </p>
                    <a
                      href="mailto:profesorka.marinalukic@gmail.com"
                      className="inline-block bg-[#D62828] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#B91F1F] transition-colors"
                    >
                      profesorka.marinalukic@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media print {
          /* Hide everything */
          body * {
            visibility: hidden !important;
          }
          /* Show only the uplatnica */
          [data-uplatnica],
          [data-uplatnica] * {
            visibility: visible !important;
          }
          [data-uplatnica] {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 780px !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 1px solid #999 !important;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: landscape;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
