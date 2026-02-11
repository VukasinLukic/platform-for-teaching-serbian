import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowLeft, RefreshCw } from 'lucide-react';

export default function QuizResult({ score, totalQuestions, onRetry }) {
    const percentage = Math.round((score / totalQuestions) * 100);

    let message = '';
    if (percentage === 100) message = 'Савршено! Честитамо!';
    else if (percentage >= 80) message = 'Одлично знање!';
    else if (percentage >= 50) message = 'Добар резултат!';
    else message = 'Потребно је још вежбања.';

    return (
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl text-center max-w-2xl mx-auto">
            <div className="bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-yellow-600" />
            </div>

            <h2 className="text-3xl font-bold mb-2 text-[#1A1A1A]">{message}</h2>
            <p className="text-gray-600 mb-8">Ваш резултат:</p>

            <div className="text-6xl font-black text-[#D62828] mb-8">
                {score} <span className="text-2xl text-gray-400 font-medium">/ {totalQuestions}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link to="/quizzes">
                    <button className="w-full md:w-auto px-8 py-4 rounded-xl border-2 border-gray-200 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        Nazad na kvizove
                    </button>
                </Link>
                <button
                    onClick={onRetry}
                    className="w-full md:w-auto px-8 py-4 rounded-xl bg-[#D62828] text-white font-bold hover:bg-[#B91F1F] transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Probaj ponovo
                </button>
            </div>
        </div>
    );
}
