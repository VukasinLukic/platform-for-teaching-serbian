import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowLeft, Upload, Download, Printer, Smartphone, ScanLine, CheckCircle2, Clock, Mail, ChevronDown, FileText,
} from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';
import { db } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import CopyField from '../components/payment/CopyField';
import IpsQrCode from '../components/payment/IpsQrCode';
import DrawnPaymentSlip from '../components/payment/DrawnPaymentSlip';
import { buildIpsPayload, normalizeAccount, formatAccountDisplay } from './payment/ipsQr';

// Payment code 289 = "transakcije po nalogu građana" (payment ordered by a citizen).
const PAYMENT_CODE = '289';
// Model 00 (no control digits): the platform's references (0100, 0101, ...) are plain
// sequence numbers and are not valid model-97 references, which banks would reject.
const PAYMENT_MODEL = '00';
const RETURN_TO_KEY = 'srpskiusrcu_return_to';
const SUPPORT_EMAIL = 'profesorka.marinalukic@gmail.com';

const formatAmount = (amount) =>
  Number(amount).toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Maps a Firestore transaction to the data the slip needs. */
function paymentDataFromTransaction(id, tx, fallbackName) {
  return {
    transactionId: id,
    amount: tx.amount,
    courseName: tx.courseName || '',
    packageName: tx.packageName || '',
    paymentReference: tx.payment_ref || tx.paymentReference || '',
    userName: tx.userName || fallbackName || '',
    status: tx.status,
    confirmationUrl: tx.confirmationUrl || null,
  };
}

function StatusNotice({ status, hasProof }) {
  if (status === 'confirmed') {
    return (
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm font-medium">Ова уплата је већ одобрена — приступ је активиран. Није потребно да плаћаш поново.</p>
      </div>
    );
  }
  if (status === 'rejected') {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4">
        <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm font-medium">Ова уплата је одбијена. Пиши нам на {SUPPORT_EMAIL} пре него што поново уплатиш.</p>
      </div>
    );
  }
  if (hasProof) {
    return (
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4">
        <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm font-medium">Доказ о уплати је послат. Проверавамо уплату — обично у року од 24 часа.</p>
      </div>
    );
  }
  return null;
}

function CenteredMessage({ title, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <img src="/mascot/alano-reading.webp" alt="" width="140" height="140" className="w-32 h-32 object-contain mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-ink mb-3">{title}</h1>
        <div className="text-gray-600 space-y-4">{children}</div>
      </div>
      <Footer />
    </div>
  );
}

export default function PaymentSlipPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get('tx');
  const { user, userProfile, loading: authLoading } = useAuthStore();

  const [paymentData, setPaymentData] = useState(location.state?.paymentData || null);
  const [status, setStatus] = useState(location.state?.paymentData ? 'ready' : 'loading');
  const [showSlipMobile, setShowSlipMobile] = useState(false);
  const uplatnicaRef = useRef(null);

  const bankAccount = import.meta.env.VITE_BANK_ACCOUNT || '1701009451800050';
  const companyName = import.meta.env.VITE_COMPANY_NAME || 'Marina Lukic';
  const companyAddress = import.meta.env.VITE_COMPANY_ADDRESS || '';
  const recipient = companyAddress ? `${companyName}\n${companyAddress}` : companyName;
  const account18 = normalizeAccount(bankAccount);
  const accountDisplay = account18 ? formatAccountDisplay(account18) : bankAccount;

  // Recover the slip from a transaction id (?tx=) so it survives refresh and can be
  // opened from the dashboard. Transactions are readable only by their owner.
  useEffect(() => {
    if (location.state?.paymentData) {
      setPaymentData(location.state.paymentData);
      setStatus('ready');
      return undefined;
    }
    if (!txId) {
      setStatus('missing');
      return undefined;
    }
    if (authLoading) return undefined;
    if (!user) {
      setStatus('login');
      return undefined;
    }

    let cancelled = false;
    setStatus('loading');
    getDoc(doc(db, 'transactions', txId))
      .then((snap) => {
        if (cancelled) return;
        if (!snap.exists()) {
          setStatus('missing');
          return;
        }
        setPaymentData(paymentDataFromTransaction(snap.id, snap.data(), userProfile?.ime));
        setStatus('ready');
      })
      .catch((err) => {
        console.error('Error loading transaction:', err);
        if (!cancelled) setStatus('missing');
      });
    return () => {
      cancelled = true;
    };
  }, [location.state, txId, authLoading, user, userProfile?.ime]);

  const amount = Number(paymentData?.amount) || 0;
  const purposeText = paymentData?.courseName || paymentData?.packageName || 'Online nastava srpskog jezika';

  const ipsPayload = useMemo(() => {
    if (!paymentData || !amount) return '';
    try {
      return buildIpsPayload({
        account: bankAccount,
        payeeName: recipient,
        amount,
        payerName: paymentData.userName || userProfile?.ime || '',
        paymentCode: PAYMENT_CODE,
        purpose: purposeText,
        model: PAYMENT_MODEL,
        reference: paymentData.paymentReference,
      });
    } catch (err) {
      console.error('IPS payload error:', err);
      return '';
    }
  }, [paymentData, amount, bankAccount, recipient, purposeText, userProfile?.ime]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" role="status">
        <div className="w-12 h-12 rounded-full border-4 border-brand/15 border-t-brand animate-spin" />
        <span className="sr-only">Учитава се уплатница...</span>
      </div>
    );
  }

  if (status === 'login') {
    const goToLogin = () => {
      try {
        localStorage.setItem(RETURN_TO_KEY, `/uplatnica?tx=${encodeURIComponent(txId)}`);
      } catch {
        /* ignore */
      }
      navigate('/login');
    };
    return (
      <CenteredMessage title="Пријави се да видиш уплатницу">
        <p>Уплатница је везана за твој налог. Након пријаве вратићемо те на њу.</p>
        <button
          type="button"
          onClick={goToLogin}
          className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-bold hover:bg-brand-700"
        >
          Пријави се
        </button>
      </CenteredMessage>
    );
  }

  if (status === 'missing' || !paymentData) {
    return (
      <CenteredMessage title="Уплатница није пронађена">
        <p>Отвори уплатницу са свог панела (одељак „Уплате“) или изабери курс поново.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="inline-flex justify-center items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-bold hover:bg-brand-700">
            Мој панел
          </Link>
          <Link to="/courses" className="inline-flex justify-center items-center gap-2 border-2 border-gray-200 px-6 py-3 rounded-full font-bold hover:border-ink">
            Курсеви
          </Link>
        </div>
      </CenteredMessage>
    );
  }

  const { courseName, paymentReference, userName } = paymentData;
  const formattedAmount = `=${formatAmount(amount)}`;
  const dashboardPaymentsLink = '/dashboard#uplate';

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(uplatnicaRef.current, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
      const link = document.createElement('a');
      link.download = `uplatnica-${paymentReference || 'download'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      window.print();
    }
  };

  const slipFields = (
    <dl>
      <CopyField label="Прималац" value={recipient.replace('\n', ', ')} />
      <CopyField label="Рачун примаоца" value={accountDisplay} copyValue={account18 || bankAccount} mono />
      <CopyField label="Износ (RSD)" value={formatAmount(amount)} copyValue={formatAmount(amount).replace(/\./g, '')} highlight />
      <CopyField label="Шифра плаћања" value={PAYMENT_CODE} mono />
      <CopyField label="Модел" value={PAYMENT_MODEL} mono />
      <CopyField label="Позив на број" value={paymentReference} mono highlight />
      <CopyField label="Сврха уплате" value={purposeText} />
    </dl>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <SEO title="УПЛАТНИЦА" description="Подаци за уплату и IPS QR код." noindex={true} />
      <Header />

      <main className="pt-6 pb-12 md:pt-12 md:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-brand transition-colors no-print"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            <span>Назад</span>
          </button>

          <header className="mb-6 md:mb-8 no-print">
            <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-1">Уплата</p>
            <h1 className="text-2xl sm:text-4xl font-bold text-ink">{purposeText}</h1>
            <p className="mt-2 text-gray-600">
              Износ: <span className="font-extrabold text-brand">{formatAmount(amount)} RSD</span>
              <span className="mx-2 text-gray-300">•</span>
              Позив на број: <span className="font-mono font-bold">{paymentReference}</span>
            </p>
          </header>

          {(paymentData.status && paymentData.status !== 'pending') || paymentData.confirmationUrl ? (
            <div className="mb-6 no-print">
              <StatusNotice status={paymentData.status} hasProof={!!paymentData.confirmationUrl} />
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-[3fr,1fr] gap-6 lg:gap-8">
            <div className="flex flex-col gap-6 min-w-0">
              {/* IPS QR — fastest way to pay */}
              <section
                aria-labelledby="ips-title"
                className="order-2 md:order-1 bg-white rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8 no-print"
              >
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
                  <div className="flex-shrink-0">
                    <IpsQrCode payload={ipsPayload} fileName={`ips-qr-${paymentReference || 'uplata'}`} size={220} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-2 bg-brand-50 text-brand rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                      <ScanLine className="w-4 h-4" aria-hidden="true" />
                      IPS QR · тренутна уплата
                    </div>
                    <h2 id="ips-title" className="text-xl sm:text-2xl font-bold text-ink mb-4">
                      Скенирај у апликацији банке
                    </h2>
                    <ol className="space-y-3 text-gray-700">
                      <li className="flex gap-3">
                        <span className="w-7 h-7 rounded-full bg-ink text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</span>
                        <span>Отвори мобилно банкарство било које банке у Србији.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-7 h-7 rounded-full bg-ink text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</span>
                        <span>Изабери „IPS скенирај“ (или „Плаћање QR кодом“) и скенирај код.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-7 h-7 rounded-full bg-ink text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
                        <span>Сви подаци се попуњавају сами — провери износ и потврди уплату.</span>
                      </li>
                    </ol>
                    <p className="mt-4 text-sm text-gray-500 flex items-start gap-2 md:hidden">
                      <Smartphone className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      Плаћаш са истог телефона? Сачувај QR код као слику и учитај га у апликацији банке из галерије, или копирај податке изнад.
                    </p>
                  </div>
                </div>
              </section>

              {/* Mobile: clear list of fields with copy buttons */}
              <section aria-labelledby="fields-title" className="order-1 md:hidden bg-white rounded-3xl shadow-xl border border-gray-100 p-5 no-print">
                <h2 id="fields-title" className="text-lg font-bold text-ink mb-1">Подаци за уплату</h2>
                <p className="text-sm text-gray-500 mb-2">Копирај сваки податак у апликацију своје банке.</p>
                {slipFields}
                <button
                  type="button"
                  onClick={() => setShowSlipMobile((v) => !v)}
                  aria-expanded={showSlipMobile}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 border-2 border-gray-200 rounded-xl py-3 hover:border-ink"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  {showSlipMobile ? 'Сакриј класичну уплатницу' : 'Прикажи класичну уплатницу'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSlipMobile ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </section>

              {/* Drawn slip — desktop, print and download */}
              <section
                aria-label="Налог за уплату"
                className={`order-3 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden ${showSlipMobile ? 'block' : 'hidden md:block'}`}
              >
                <div className="bg-gradient-to-r from-brand to-brand-700 text-white py-4 px-5 sm:px-6 flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider">Налог за уплату</h2>
                  <div className="flex gap-2 no-print">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                      <Printer size={16} aria-hidden="true" />
                      Штампај
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 bg-white text-brand hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                      <Download size={16} aria-hidden="true" />
                      Преузми
                    </button>
                  </div>
                </div>
                <div className="p-4 md:p-8 overflow-x-auto">
                  <DrawnPaymentSlip
                    ref={uplatnicaRef}
                    userName={userName}
                    purposeText={purposeText}
                    recipient={recipient}
                    paymentCode={PAYMENT_CODE}
                    formattedAmount={formattedAmount}
                    accountDisplay={accountDisplay}
                    model={PAYMENT_MODEL}
                    paymentReference={paymentReference}
                  />
                </div>
              </section>
            </div>

            {/* Sidebar — what happens next */}
            <aside className="space-y-4 no-print">
              <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-ink mb-4">Шта следи</h2>
                <ol className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                  <li className="pl-6 relative">
                    <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-gold flex items-center justify-center text-xs font-black">1</span>
                    <p className="font-bold text-ink">Уплати</p>
                    <p className="text-sm text-gray-600">QR кодом, е-банкарством или у банци/пошти.</p>
                  </li>
                  <li className="pl-6 relative">
                    <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-gold flex items-center justify-center text-xs font-black">2</span>
                    <p className="font-bold text-ink">Пошаљи доказ о уплати</p>
                    <p className="text-sm text-gray-600 mb-3">Слика или PDF потврде убрзава проверу.</p>
                    <Link
                      to={dashboardPaymentsLink}
                      className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" aria-hidden="true" />
                      Отвори мој панел
                    </Link>
                  </li>
                  <li className="pl-6 relative">
                    <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-gold flex items-center justify-center text-xs font-black">3</span>
                    <p className="font-bold text-ink">
                      {courseName ? 'Курс се откључава' : 'Часови се активирају'}
                    </p>
                    <p className="text-sm text-gray-600">Након провере уплате — обично у року од 24 часа.</p>
                  </li>
                </ol>
              </div>

              <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl shadow-lg p-5 sm:p-6 border border-brand/20">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-ink mb-1">Хитно ти треба приступ?</h3>
                    <p className="text-sm text-gray-600 mb-3">Проследи доказ о уплати на имејл:</p>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-bold text-brand hover:underline break-all">
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

    </div>
  );
}
