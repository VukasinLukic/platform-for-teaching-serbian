import React, { useState, useMemo } from 'react';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import parse from 'html-react-parser';
import QuizResult from './QuizResult';

// Fisher-Yates shuffle
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function QuizRunner({ quiz, onExit }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

    // Shuffle answers for all questions once on mount
    const shuffledQuiz = useMemo(() => {
        return quiz.map(q => ({
            ...q,
            answers: shuffleArray(q.answers)
        }));
    }, [quiz]);

    const currentQuestion = shuffledQuiz[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === shuffledQuiz.length - 1;

    const handleAnswerSelect = (answer) => {
        if (isAnswerSubmitted) return;
        setSelectedAnswer(answer);
    };

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) return;

        setIsAnswerSubmitted(true);
        if (selectedAnswer === currentQuestion.correctAnswer) {
            setScore(score + 1);
        }
    };

    const handleNextQuestion = () => {
        if (isLastQuestion) {
            setShowResult(true);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswerSubmitted(false);
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
    };

    if (showResult) {
        return <QuizResult score={score} totalQuestions={shuffledQuiz.length} onRetry={handleRetry} />;
    }

    // Calculate progress percentage
    const progress = ((currentQuestionIndex + 1) / shuffledQuiz.length) * 100;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                    <span>{currentQuestionIndex + 1} / {shuffledQuiz.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#D62828] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
                <div className="text-xl font-normal text-[#1A1A1A] mb-8 whitespace-pre-line leading-relaxed">
                    {parse(currentQuestion.question)}
                </div>

                <div className="space-y-4">
                    {currentQuestion.answers.map((answer, index) => {
                        let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-lg ";

                        if (isAnswerSubmitted) {
                            if (answer === currentQuestion.correctAnswer) {
                                buttonClass += "border-green-500 bg-green-50 text-green-700";
                            } else if (answer === selectedAnswer) {
                                buttonClass += "border-red-500 bg-red-50 text-red-700";
                            } else {
                                buttonClass += "border-gray-100 text-gray-400";
                            }
                        } else {
                            if (selectedAnswer === answer) {
                                buttonClass += "border-[#D62828] bg-red-50 text-[#D62828]";
                            } else {
                                buttonClass += "border-gray-100 hover:border-gray-300 text-gray-700";
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(answer)}
                                className={buttonClass}
                                disabled={isAnswerSubmitted}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{answer}</span>
                                    {isAnswerSubmitted && answer === currentQuestion.correctAnswer && (
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    )}
                                    {isAnswerSubmitted && answer === selectedAnswer && answer !== currentQuestion.correctAnswer && (
                                        <XCircle className="w-6 h-6 text-red-500" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
                {!isAnswerSubmitted ? (
                    <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer}
                        className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${selectedAnswer
                                ? 'bg-[#D62828] text-white hover:bg-[#B91F1F] shadow-lg hover:shadow-xl'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Провери одговор
                    </button>
                ) : (
                    <button
                        onClick={handleNextQuestion}
                        className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 bg-[#D62828] text-white hover:bg-[#B91F1F] shadow-lg hover:shadow-xl transition-all"
                    >
                        {isLastQuestion ? 'Заврши квиз' : 'Следеће питање'} <ArrowRight className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
