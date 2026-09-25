import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Trophy,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';
import NotFoundPage from './NotFoundPage';
import { inicijalniTestovi } from '../data/inicijalniTestovi';

export default function InicijalniTestPage() {
  const { razred } = useParams();
  const navigate = useNavigate();

  const test = inicijalniTestovi[razred];

  const [faza, setFaza] = useState('uvod'); // 'uvod' | 'test' | 'rezultat'
  const [trenutno, setTrenutno] = useState(0);
  const [odabrano, setOdabrano] = useState(null);
  const [tacnih, setTacnih] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [faza]);

  if (!test) {
    return <NotFoundPage />;
  }

  const canonicalPath = `/inicijalni-test/${razred}`;
  const ukupno = test.pitanja.length;
  const pitanje = test.pitanja[trenutno];
  const progress = ((trenutno + 1) / ukupno) * 100;
  const jePoslednje = trenutno + 1 === ukupno;





  const handleOdabir = (idx) => {
    if (odabrano !== null) return;
    if (idx === pitanje.tacan) setTacnih((n) => n + 1);
    setOdabrano(idx);
  };

  const handleSledece = () => {
    if (!jePoslednje) {
      setTrenutno((n) => n + 1);
      setOdabrano(null);
    } else {
      setFaza('rezultat');
    }
  };

  const handleReset = () => {
    setTrenutno(0);
    setOdabrano(null);
    setTacnih(0);
    setFaza('test');
  };

  /* ------------------------------------------------------------------ UVOD */
  if (faza === 'uvod') {
    return (
      <div className="min-h-screen bg-paper font-sans text-ink">
        <SEO />
        <Header />

        <div className="max-w-3xl mx-auto px-6 py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-gray-500 mb-8 flex-wrap">
            <Link to="/" className="hover:text-brand transition-colors">
              Почетна
            </Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <Link to="/#inicijalni-testovi" className="hover:text-brand transition-colors">
              Иницијални тестови
            </Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-ink font-medium">{test.razred}. разред</span>
          </nav>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-brand to-brand-700 p-8 md:p-10 text-white">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-5">
                <span className="text-3xl font-black">{test.razred}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{test.naziv}</h1>
              <p className="text-white leading-relaxed">{test.kratakOpis}</p>
            </div>

            <div className="p-8 md:p-10">
              <p className="text-gray-600 leading-relaxed mb-6">{test.uvod}</p>

              <div className="flex flex-wrap gap-2 mb-8">
                {test.teme.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-brand"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8 text-center">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="text-2xl font-black text-ink">{ukupno}</div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 font-bold">
                    питања
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="text-2xl font-black text-ink">~5</div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 font-bold">
                    минута
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="text-2xl font-black text-ink">0 din</div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 font-bold">
                    бесплатно
                  </div>
                </div>
              </div>

              <button
                onClick={() => setFaza('test')}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-brand text-white font-bold text-lg hover:bg-brand-700 transition-all transform hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2"
              >
                Започни тест <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-6">
                <Link
                  to="/#inicijalni-testovi"
                  className="text-sm text-gray-500 hover:text-brand transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад на избор разреда
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  /* --------------------------------------------------------------- REZULTAT */
  if (faza === 'rezultat') {
    const procenat = Math.round((tacnih / ukupno) * 100);
    const poruka =
      procenat === 100
        ? 'Савршено! Честитамо!'
        : procenat >= 80
        ? 'Одлично знање!'
        : procenat >= 50
        ? 'Добар резултат!'
        : 'Потребно је још вежбања.';

    return (
      <div className="min-h-screen bg-paper font-sans text-ink">
        <SEO />
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl text-center">
            <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-ink mb-1">{poruka}</h2>
            <p className="text-gray-500 text-sm mb-4">
              {test.naziv} · твој резултат:
            </p>

            <div className="text-5xl md:text-6xl font-black text-brand mb-2">
              {tacnih} <span className="text-2xl text-gray-500 font-medium">/ {ukupno}</span>
            </div>
            <p className="text-sm text-gray-500 mb-8">Тачно {procenat}%</p>

            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Желиш да вежбаш још? На платформи те чекају видео лекције и стотине питања
              за све разреде — уз објашњења наставнице.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={() => navigate('/courses')}
                className="px-8 py-4 rounded-xl bg-brand text-white font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Погледај курсеве <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-4 rounded-xl border-2 border-gray-200 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Уради поново
              </button>
            </div>

            <Link
              to="/#inicijalni-testovi"
              className="text-sm text-gray-500 hover:text-brand transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Пробај тест за други разред
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ------------------------------------------------------------------- TEST */
  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <SEO />
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/#inicijalni-testovi')}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-brand font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Одустани
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-black flex-shrink-0">
            {test.razred}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-ink">{test.naziv}</h1>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
            <span>
              {trenutno + 1} / {ukupno}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
          {pitanje.citat && (
            <blockquote className="bg-amber-50 border-l-4 border-amber-300 rounded-r-xl p-4 mb-5">
              <p className="text-sm text-amber-900 italic leading-relaxed whitespace-pre-line">
                {pitanje.citat}
              </p>
            </blockquote>
          )}

          <p className="text-lg md:text-xl font-normal text-ink mb-8 leading-relaxed whitespace-pre-line">
            {pitanje.tekst}
          </p>

          <div className="space-y-3">
            {pitanje.odgovori.map((odg, idx) => {
              let cls =
                'w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-base ';

              if (odabrano !== null) {
                if (idx === pitanje.tacan) {
                  cls += 'border-green-500 bg-green-50 text-green-700';
                } else if (idx === odabrano) {
                  cls += 'border-red-500 bg-red-50 text-red-700';
                } else {
                  cls += 'border-gray-100 text-gray-500';
                }
              } else {
                cls += 'border-gray-100 hover:border-gray-300 text-gray-700';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOdabir(idx)}
                  className={cls}
                  disabled={odabrano !== null}
                >
                  <div className="flex justify-between items-start gap-3">
                    <span className="flex-1 whitespace-pre-line">{odg}</span>
                    {odabrano !== null && idx === pitanje.tacan && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                    {odabrano !== null && idx === odabrano && idx !== pitanje.tacan && (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {odabrano !== null && (
            <div
              className={`mt-6 p-4 rounded-xl border text-sm font-semibold ${
                odabrano === pitanje.tacan
                  ? 'bg-green-50 border-green-100 text-green-700'
                  : 'bg-red-50 border-red-100 text-red-700'
              }`}
            >
              {odabrano === pitanje.tacan ? (
                'Тачно! Браво.'
              ) : (
                <>
                  Нетачно. Тачан одговор је:{' '}
                  <span className="font-bold">{pitanje.odgovori[pitanje.tacan]}</span>
                </>
              )}
            </div>
          )}
        </div>

        {odabrano !== null && (
          <div className="flex justify-end">
            <button
              onClick={handleSledece}
              className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 bg-brand text-white hover:bg-brand-700 shadow-lg hover:shadow-xl transition-all"
            >
              {jePoslednje ? 'Заврши тест' : 'Следеће питање'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        <p className="mt-8 text-xs text-gray-500 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Питања и тачни одговори преузети из иницијалних тестова за {test.razred}. разред.
        </p>
      </div>

      <Footer />
    </div>
  );
}
