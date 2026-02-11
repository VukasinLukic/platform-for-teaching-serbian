import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import Header from '../components/ui/Header';
import QuizCard from '../components/quiz/QuizCard';
import { getAvailableQuizzes } from '../services/quiz.service';
import { LayoutGrid, HelpCircle } from 'lucide-react';

export default function QuizListPage() {
    const { userProfile } = useAuthStore();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadQuizzes() {
            try {
                const data = await getAvailableQuizzes();
                setQuizzes(data);
            } catch (error) {
                console.error('Failed to load quizzes', error);
            } finally {
                setLoading(false);
            }
        }
        loadQuizzes();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D62828] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
            <Header />

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl font-bold mb-4 text-[#1A1A1A]">
                        Квизови знања
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl">
                        Тестирајте своје знање кроз наше интерактивне квизове.
                    </p>
                </div>

                {quizzes.length === 0 ? (
                    <div className="bg-gray-50 rounded-3xl p-16 text-center border border-gray-100 flex flex-col items-center">
                        <HelpCircle className="w-16 h-16 text-gray-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-3 text-[#1A1A1A]">Тренутно нема доступних квизова</h3>
                        <p className="text-gray-600 text-lg">Вратите се касније, ускоро додајемо нове изазове!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {quizzes.map((quiz) => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
