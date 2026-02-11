import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit } from 'lucide-react';

export default function QuizCard({ quiz }) {
    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl hover:border-[#D62828]/20 transition-all hover:-translate-y-1 h-full flex flex-col">
            <div className="bg-gradient-to-br from-[#D62828] to-[#B91F1F] p-4 rounded-2xl w-fit mb-4">
                <BrainCircuit className="w-8 h-8 text-white" />
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
                        Започни Квиз <ArrowRight className="w-4 h-4" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
