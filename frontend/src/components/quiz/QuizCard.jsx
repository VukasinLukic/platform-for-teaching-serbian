import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Mapiranje boja za svaki kviz
const quizColors = {
    'glasovne-promene': { from: '#3B82F6', to: '#2563EB' }, // plava
    'prva-provera-znanja': { from: '#10B981', to: '#059669' }, // zelena
    'tvorba-reci': { from: '#8B5CF6', to: '#7C3AED' }, // ljubičasta
    'fonetika': { from: '#F59E0B', to: '#D97706' }, // narandžasta
    'oblici-kazivanja': { from: '#EC4899', to: '#DB2777' }, // roze
    'stilske-figure': { from: '#14B8A6', to: '#0D9488' }, // tirkiz
    'padezi': { from: '#EAB308', to: '#CA8A04' }, // žuta
    'glagoli': { from: '#6366F1', to: '#4F46E5' }, // indigo
    'nepromenljive-reci': { from: '#A855F7', to: '#9333EA' }, // purpurna
    'imenicke-reci': { from: '#D97706', to: '#B45309' }, // bronza
};

export default function QuizCard({ quiz }) {
    // Dobijamo boju na osnovu ID-a kviza, ili default crvena
    const colors = quizColors[quiz.id] || { from: '#D62828', to: '#B91F1F' };

    // Dobijamo prvo slovo naziva
    const firstLetter = quiz.title.charAt(0).toUpperCase();

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl hover:border-[#D62828]/20 transition-all hover:-translate-y-1 h-full flex flex-col">
            <div
                className="p-4 rounded-2xl w-fit mb-4 flex items-center justify-center"
                style={{
                    background: `linear-gradient(to bottom right, ${colors.from}, ${colors.to})`,
                    width: '64px',
                    height: '64px'
                }}
            >
                <span className="text-white text-3xl font-bold">{firstLetter}</span>
            </div>

            <h3 className="text-xl font-bold mb-2 text-[#1A1A1A] group-hover:text-[#D62828] transition-colors">
                {quiz.title}
            </h3>

            <p className="text-gray-600 mb-6 flex-grow">
                {quiz.description}
            </p>

            <div className="mt-auto">
                <Link to={`/quizzes/${quiz.fileName.replace('.json', '')}`}>
                    <button className="w-full bg-[#D62828] text-white py-3 rounded-2xl font-bold hover:bg-[#B91F1F] transition-all hover:scale-105 transform flex items-center justify-center gap-2">
                        Започни квиз <ArrowRight className="w-4 h-4" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
