import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Gift, Save, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { showToast } from '../../utils/toast';

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState({
    probniPrijemni: {
      active: false,
      name: 'Пробни пријемни 2025/2026',
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const promoDoc = await getDoc(doc(db, 'settings', 'promotions'));
      if (promoDoc.exists()) {
        const data = promoDoc.data();
        setPromotions(prev => ({
          ...prev,
          ...data,
          probniPrijemni: {
            ...prev.probniPrijemni,
            ...data.probniPrijemni,
          }
        }));
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
      showToast.error('Грешка при учитавању промоција.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePromo = (promoId) => {
    setPromotions(prev => ({
      ...prev,
      [promoId]: {
        ...prev[promoId],
        active: !prev[promoId].active,
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'promotions'), {
        ...promotions,
        updatedAt: new Date().toISOString(),
      });
      showToast.success('Промоције су успешно сачуване.');
    } catch (error) {
      console.error('Error saving promotions:', error);
      showToast.error('Грешка при чувању промоција.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D62828] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Gift className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Управљање промоцијама</h3>
            <p className="text-sm text-gray-600">
              Активирајте или деактивирајте промоције. Активне промоције се приказују свим посетиоцима сајта као popup прозор.
            </p>
          </div>
        </div>
      </div>

      {/* Probni Prijemni Promotion */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D62828] rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">Пробни пријемни 2025/2026</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 mb-3">
                Бесплатни квиз од 20 питања за пробну малу матуру. Приказује се као popup свим посетиоцима
                при првој посети сајту. Након завршетка квиза, корисник добија код за попуст.
              </p>
              <div className="flex items-center gap-2 text-sm">
                {promotions.probniPrijemni.active ? (
                  <span className="flex items-center gap-1.5 text-green-600 font-bold">
                    <Eye className="w-4 h-4" />
                    Активна - видљива свим посетиоцима
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-gray-400 font-bold">
                    <EyeOff className="w-4 h-4" />
                    Неактивна - не приказује се
                  </span>
                )}
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer ml-6 flex-shrink-0">
              <input
                type="checkbox"
                checked={promotions.probniPrijemni.active}
                onChange={() => handleTogglePromo('probniPrijemni')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D62828]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D62828]"></div>
            </label>
          </div>

          {/* Quiz Stats Preview */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-[#1A1A1A]">20</div>
              <div className="text-xs text-gray-500 font-medium">Питања</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-[#1A1A1A]">4</div>
              <div className="text-xs text-gray-500 font-medium">Одговора по питању</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-[#D62828]">Бесплатно</div>
              <div className="text-xs text-gray-500 font-medium">За све посетиоце</div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 bg-[#D62828] text-white rounded-xl font-bold hover:bg-[#B91F1F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Save className="w-5 h-5" />
        {saving ? 'Чување...' : 'Сачувај промоције'}
      </button>
    </div>
  );
}
