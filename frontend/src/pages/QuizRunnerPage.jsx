import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';
import QuizRunner from '../components/quiz/QuizRunner';
import NotFoundPage from './NotFoundPage';
import { getAvailableQuizzes, loadQuiz } from '../services/quiz.service';
import { findQuiz, quizMeta } from '../seo/routes';
import { quizSeo } from '../data/quizSeo';
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';

// Public quiz page (/kvizovi/:quizId): anyone can take the quiz.
// Quiz results are not persisted anywhere today (QuizRunner keeps score in
// component state only), so guests and logged-in users get the same experience.
export default function QuizRunnerPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [entry, setEntry] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setStarted(false);
        (async () => {
            try {
                const manifest = await getAvailableQuizzes();
                const found = findQuiz(manifest, quizId);
                if (!found) {
                    if (!cancelled) setNotFound(true);
                    return;
                }
                const data = await loadQuiz(found.fileName ? found.fileName.replace(/\.json$/, '') : quizId);
                if (!cancelled) {
                    setEntry(found);
                    setQuizData(data);
                }
            } catch {
                if (!cancelled) setError('Неуспешно учитавање квиза. Покушајте поново.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [quizId]);

    const handleExitQuiz = () => navigate('/kvizovi');

    if (notFound) return <NotFoundPage />;

    const meta = entry ? quizMeta(entry) : null;
    const seo = meta ? (
        <SEO title={meta.title} description={meta.description} canonical={meta.path} jsonLd={meta.jsonLd} />
    ) : null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white font-sans text-ink">
                <SEO title="Квиз" noindex />
                <Header />
                <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
                    <div className="bg-red-100 p-6 rounded-full mb-6">
                        <AlertTriangle className="w-12 h-12 text-brand" />
                    </div>
                    <h1 className="text-2xl font-bold mb-4">{error}</h1>
                    <button
                        onClick={handleExitQuiz}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Назад на листу квизова
                    </button>
                </div>
            </div>
        );
    }

    const intro = quizSeo[entry.id]?.intro || entry.description;

    return (
        <div className="min-h-screen bg-white font-sans text-ink">
            {seo}
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                <nav aria-label="Путања" className="mb-6 text-sm text-gray-500">
                    <Link to="/kvizovi" className="inline-flex items-center gap-2 hover:text-brand font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Сви квизови
                    </Link>
                </nav>

                <header className="mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold mb-3">{entry.title}</h1>
                    {!started && (
                        <>
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-3">{intro}</p>
                            <p className="text-gray-500 text-sm mb-6">
                                {quizData.length} питања · после сваког одговора одмах видиш да ли је тачан.
                            </p>
                            <button
                                onClick={() => setStarted(true)}
                                className="px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2 bg-brand text-white hover:bg-brand-700 shadow-lg transition"
                            >
                                Започни квиз <ArrowRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </header>

                {started && <QuizRunner quiz={quizData} onExit={handleExitQuiz} />}
            </div>
            <Footer />
        </div>
    );
}
