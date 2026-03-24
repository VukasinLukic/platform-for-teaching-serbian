import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Trophy, Copy, Check, Gift } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { promoQuizQuestions, PROMO_QUIZ_INTRO_TEXT } from '../data/promoQuizData';

// Fisher-Yates shuffle
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateDiscountCode(score) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `POPUST-${score}-${year}${month}${day}`;
}

export default function PromoQuizPage() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Shuffle answers once on mount
  const shuffledQuestions = useMemo(() => {
    return promoQuizQuestions.map(q => ({
      ...q,
      answers: shuffleArray(q.answers)
    }));
  }, []);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

  const handleAnswerSelect = (answer) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setIsAnswerSubmitted(true);
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setShowResult(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
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
    setCopied(false);
  };

  const handleCopyCode = () => {
    const code = generateDiscountCode(score);
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const discountCode = generateDiscountCode(score);
  const percentage = Math.round((score / shuffledQuestions.length) * 100);

  // RESULT VIEW
  if (showResult) {
    return (
      <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>

            <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">
              {percentage === 100 ? 'Савршено! Честитамо!' :
               percentage >= 80 ? 'Одлично знање!' :
               percentage >= 50 ? 'Добар резултат!' :
               'Потребно је још вежбања.'}
            </h2>
            <p className="text-gray-500 text-sm mb-3">Ваш резултат:</p>

            <div className="text-4xl font-black text-[#D62828] mb-6">
              {score} <span className="text-lg text-gray-400 font-medium">/ {shuffledQuestions.length}</span>
            </div>

            {/* 20% Discount Highlight */}
            <div className="bg-gradient-to-r from-[#D62828] to-[#B91F1F] rounded-2xl p-5 mb-6 shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Gift className="w-7 h-7 text-[#F2C94C]" />
                <span className="text-2xl md:text-3xl font-black text-white">20% ПОПУСТ</span>
              </div>
              <p className="text-white/90 text-sm">
                Честитамо! Остварили сте попуст од 20% на било који курс.
              </p>
            </div>

            {/* Discount Code */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
              <p className="text-sm font-bold text-green-700 mb-3">
                Ваш код за попуст:
              </p>
              <div className="bg-white rounded-xl p-4 flex items-center justify-between gap-3 border border-green-200">
                <code className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-wider">
                  {discountCode}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg hover:bg-green-50 transition-colors flex-shrink-0"
                  title="Копирај код"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-sm md:text-base text-green-700 font-semibold mt-3 leading-relaxed">
                Упишите овај код у опис трансакције на уплатници приликом плаћања курса.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 rounded-xl border-2 border-gray-200 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Назад на почетну
              </button>
              <button
                onClick={handleRetry}
                className="px-8 py-4 rounded-xl bg-[#D62828] text-white font-bold hover:bg-[#B91F1F] transition-all flex items-center justify-center gap-2"
              >
                Покушај поново
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // QUIZ VIEW
  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-[#D62828] font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Одустани
        </button>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-8">
          Пробни пријемни 2025/2026
        </h1>

        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
              <span>{currentQuestionIndex + 1} / {shuffledQuestions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D62828] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Show intro text for first 5 questions (poem excerpt context) */}
          {currentQuestionIndex < 5 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-6 mb-6">
              <p className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wide">Одломак из песме „Три добра јунака"</p>
              <p className="text-sm text-amber-900 whitespace-pre-line leading-relaxed italic">
                {PROMO_QUIZ_INTRO_TEXT}
              </p>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
            <div className="text-lg md:text-xl font-normal text-[#1A1A1A] mb-8 whitespace-pre-line leading-relaxed">
              {currentQuestion.question}
            </div>

            <div className="space-y-4">
              {currentQuestion.answers.map((answer, index) => {
                let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-base md:text-lg ";

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
                    <div className="flex justify-between items-start gap-3">
                      <span className="flex-1">{answer}</span>
                      {isAnswerSubmitted && answer === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      )}
                      {isAnswerSubmitted && answer === selectedAnswer && answer !== currentQuestion.correctAnswer && (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
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
                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  selectedAnswer
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
      </div>
    </div>
  );
}
