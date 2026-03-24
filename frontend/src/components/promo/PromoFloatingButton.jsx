import { GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePromo } from '../../context/PromoContext';

export default function PromoFloatingButton() {
  const { isPromoActive, hasSeenPromo, showPromoQuiz } = usePromo();
  const navigate = useNavigate();

  // Only show if promo is active and user has already seen/dismissed it
  if (!isPromoActive('probniPrijemni') || !hasSeenPromo('probniPrijemni') || showPromoQuiz) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/probni-prijemni')}
      className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-[#D62828] to-[#B91F1F] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
      title="Пробни пријемни квиз"
    >
      <GraduationCap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      <span className="text-sm font-bold hidden sm:inline">Пробни тест</span>
    </button>
  );
}
