import { useState } from 'react';
import { HelpCircle, X, RotateCcw } from 'lucide-react';
import { useOnboarding, PAGE_TUTORIALS } from '../../context/OnboardingContext';

export default function HelpButton({ pageKey }) {
  const { startTutorial, resetTutorial, hasSeenTutorial } = useOnboarding();
  const [isOpen, setIsOpen] = useState(false);

  const tutorial = PAGE_TUTORIALS[pageKey];
  if (!tutorial) return null;

  const handleStartTutorial = () => {
    setIsOpen(false);
    if (hasSeenTutorial(pageKey)) {
      resetTutorial(pageKey);
    }
    setTimeout(() => startTutorial(pageKey), 200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-[#1A1A1A]">{tutorial.pageName}</p>
            <p className="text-xs text-gray-500 mt-1">{tutorial.description}</p>
          </div>
          <button
            onClick={handleStartTutorial}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#D62828] hover:bg-red-50 transition-colors text-left"
          >
            <RotateCcw className="w-4 h-4" />
            {hasSeenTutorial(pageKey) ? 'Поново покрени водич' : 'Покрени водич'}
          </button>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
          isOpen
            ? 'bg-gray-200 text-gray-700'
            : 'bg-[#D62828] text-white hover:bg-[#B91F1F]'
        }`}
      >
        {isOpen ? <X className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}
