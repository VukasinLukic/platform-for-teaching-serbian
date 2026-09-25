import { useState, useEffect } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import QuizCard from '../components/quiz/QuizCard';
import SEO from '../components/SEO';
import { getAvailableQuizzes } from '../services/quiz.service';
import { quizListIntro } from '../data/quizSeo';
import { HelpCircle } from 'lucide-react';

// Public, indexable list of quizzes (/kvizovi). Meta/JSON-LD come from src/seo/routes.js.
export default function QuizListPage() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAvailableQuizzes()
            .then(setQuizzes)
            .catch((error) => console.error('Failed to load quizzes', error))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-ink">
            <SEO />
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
                <div className="mb-8 md:mb-12 text-center md:text-left">
                    <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-ink">
                        Квизови из српског језика
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 max-w-3xl">{quizListIntro}</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="bg-gray-50 rounded-3xl p-8 md:p-16 text-center border border-gray-100 flex flex-col items-center">
                        <HelpCircle className="w-16 h-16 text-gray-500 mb-6" />
                        <h2 className="text-xl md:text-2xl font-bold mb-3 text-ink">Тренутно нема доступних квизова</h2>
                        <p className="text-gray-600 text-base md:text-lg">Вратите се касније, ускоро додајемо нове изазове!</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {quizzes.map((quiz) => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
