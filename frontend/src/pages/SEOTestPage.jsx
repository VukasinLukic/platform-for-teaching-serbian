import { useState } from 'react';
import { useParams, Navigate, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, ArrowRight, ChevronRight } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';
import NotFoundPage from './NotFoundPage';
import { seoTestovi } from '../data/seoTestovi';

export default function SEOTestPage() {
  const { kategorija, slug } = useParams();
  const navigate = useNavigate();

  const kljuc = `${kategorija}/${slug}`;
  const test = seoTestovi[kljuc];

  const [trenutno, setTrenutno] = useState(0);
  const [odabrano, setOdabrano] = useState(null);
  const [tacnih, setTacnih] = useState(0);
  const [faza, setFaza] = useState('test'); // 'test' | 'rezultat'

  if (!test) {
    return <NotFoundPage />;
  }

  const canonicalPath = `/srpski-jezik/${kljuc}`;



  const pitanje = test.pitanja[trenutno];
  const progress = ((trenutno + 1) / test.pitanja.length) * 100;

  const handleOdabir = (idx) => {
    if (odabrano !== null) return;
    const tacno = idx === pitanje.tacno;
    if (tacno) setTacnih((n) => n + 1);
    setOdabrano(idx);
  };

  const handleSledece = () => {
    if (trenutno + 1 < test.pitanja.length) {
      setTrenutno((n) => n + 1);
      setOdabrano(null);
    } else {
      setFaza('rezultat');
    }
  };

  if (faza === 'rezultat') {
    const ukupno = test.pitanja.length;
    const procenat = Math.round((tacnih / ukupno) * 100);

    return (
      <div className="min-h-screen bg-white font-sans text-ink">
        <SEO />
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>

            <h2 className="text-xl font-bold text-ink mb-1">
              {procenat === 100 ? 'Савршено! Честитамо!' :
               procenat >= 80 ? 'Одлично знање!' :
               procenat >= 50 ? 'Добар резултат!' :
               'Потребно је још вежбања.'}
            </h2>
            <p className="text-gray-500 text-sm mb-3">Ваш резултат:</p>

            <div className="text-4xl font-black text-brand mb-6">
              {tacnih} <span className="text-lg text-gray-500 font-medium">/ {ukupno}</span>
            </div>

            <p className="text-sm text-gray-500 mb-8">
              Желиш да вежбаш још? На платформи те чека <span className="font-bold text-ink">500+ питања</span> са видео лекцијама.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-xl bg-brand text-white font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Направи налог — бесплатно
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="px-8 py-4 rounded-xl border-2 border-gray-200 font-bold hover:bg-gray-50 transition-colors"
              >
                Погледај курсеве
              </button>
            </div>

            <button
              onClick={() => { setTrenutno(0); setOdabrano(null); setTacnih(0); setFaza('test'); }}
              className="text-sm text-gray-500 hover:text-brand transition-colors underline"
            >
              Покушај поново
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-ink">
      <SEO />
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-brand transition-colors">Почетна</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span>Српски језик</span>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span>{test.kategorijaNaslov}</span>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-ink font-medium">{test.naslov}</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-ink mb-3">{test.naslov}</h1>

        {trenutno === 0 && (
          <p className="text-gray-600 mb-8 leading-relaxed">{test.uvod}</p>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
            <span>{trenutno + 1} / {test.pitanja.length}</span>
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
          <p className="text-lg md:text-xl font-normal text-ink mb-8 leading-relaxed">
            {pitanje.pitanje}
          </p>

          <div className="space-y-3">
            {pitanje.odgovori.map((odg, idx) => {
              let cls =
                'w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-base ';

              if (odabrano !== null) {
                if (idx === pitanje.tacno) {
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
                    <span className="flex-1">{odg}</span>
                    {odabrano !== null && idx === pitanje.tacno && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                    {odabrano !== null && idx === odabrano && idx !== pitanje.tacno && (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation — shown immediately after answer */}
          {odabrano !== null && (
            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm font-bold text-blue-700 mb-1">Објашњење:</p>
              <p className="text-sm text-blue-800 leading-relaxed">{pitanje.objasnjenje}</p>
            </div>
          )}
        </div>

        {/* Next button */}
        {odabrano !== null && (
          <div className="flex justify-end">
            <button
              onClick={handleSledece}
              className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 bg-brand text-white hover:bg-brand-700 shadow-lg hover:shadow-xl transition-all"
            >
              {trenutno + 1 === test.pitanja.length ? 'Заврши тест' : 'Следеће питање'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
