import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Alano from '../mascot/Alano';
import Button from '../ui/Button';

export default function QuizResult({ score, totalQuestions, onRetry }) {
    const percentage = Math.round((score / totalQuestions) * 100);

    let message = '';
    if (percentage === 100) message = 'Савршено! Честитамо!';
    else if (percentage >= 80) message = 'Одлично знање!';
    else if (percentage >= 50) message = 'Добар резултат!';
    else message = 'Потребно је још вежбања.';

    return (
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl text-center max-w-2xl mx-auto">
            <Alano pose="celebrating" size={140} className="mx-auto mb-4" />

            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-ink">{message}</h2>
            <p className="text-gray-600 mb-8">Ваш резултат:</p>

            <div className="text-5xl md:text-6xl font-black text-brand mb-8">
                {score} <span className="text-2xl text-gray-500 font-medium">/ {totalQuestions}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button as={Link} to="/kvizovi" variant="subtle" size="lg" className="w-full md:w-auto">
                        <ArrowLeft className="w-5 h-5" />
                        Назад на квизове
                  </Button>
                <button
                    onClick={onRetry}
                    className="w-full md:w-auto px-8 py-4 rounded-xl bg-brand text-white font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Probaj ponovo
                </button>
            </div>
        </div>
    );
}
