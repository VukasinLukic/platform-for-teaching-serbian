import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/ui/Header';
import QuizRunner from '../components/quiz/QuizRunner';
import { loadQuiz } from '../services/quiz.service';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function QuizRunnerPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchQuiz() {
            try {
                const data = await loadQuiz(quizId);
                setQuizData(data);
            } catch (err) {
                setError('Неуспешно учитавање квиза. Покушајте поново.');
            } finally {
                setLoading(false);
            }
        }
        fetchQuiz();
    }, [quizId]);

    const handleExitQuiz = () => {
        // Confirm exit? For now just go back.
        navigate('/quizzes');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D62828] border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
                <Header />
                <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
                    <div className="bg-red-100 p-6 rounded-full mb-6">
                        <AlertTriangle className="w-12 h-12 text-[#D62828]" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">{error}</h2>
                    <button
                        onClick={() => navigate('/quizzes')}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Назад на листу квизова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
            <Header />

            <div className="max-w-4xl mx-auto px-6 py-12">
                <button
                    onClick={handleExitQuiz}
                    className="mb-8 flex items-center gap-2 text-gray-500 hover:text-[#D62828] font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Одустани
                </button>

                <QuizRunner quiz={quizData} onExit={handleExitQuiz} />
            </div>
        </div>
    );
}
