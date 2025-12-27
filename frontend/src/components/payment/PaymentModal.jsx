import { X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/helpers';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

export default function PaymentModal({
  course,
  packageData,
  type = 'course',
  paymentReference,
  onClose
}) {
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const bankAccount = import.meta.env.VITE_BANK_ACCOUNT || '160-00000000000-00';
  const companyName = import.meta.env.VITE_COMPANY_NAME || 'Nauči Srpski';
  const companyAddress = import.meta.env.VITE_COMPANY_ADDRESS || 'Beograd, Srbija';

  // Determine data based on type
  const itemData = type === 'course' ? course : packageData;
  const itemTitle = type === 'course'
    ? `Уплата за курс: ${course?.title}`
    : `Online настава: ${packageData?.name}`;
  const itemPrice = type === 'course' ? course?.price : packageData?.price;

  const handleConfirmPurchase = async () => {
    if (!user || !userProfile) {
      alert('Молимо вас да се пријавите');
      return;
    }

    if (type !== 'online_package') {
      return; // Only for online packages
    }

    if (isProcessing) {
      return; // Prevent double submission
    }

    setIsProcessing(true);

    try {
      // Check if there's already a pending transaction for this package
      const existingTxQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('packageId', '==', packageData.id),
        where('status', '==', 'pending')
      );
      const existingTxSnapshot = await getDocs(existingTxQuery);

      if (!existingTxSnapshot.empty) {
        // Navigate to existing transaction instead of creating new one
        const existingTxId = existingTxSnapshot.docs[0].id;
        onClose();
        navigate(`/dashboard`);
        // Scroll to transactions section after navigation
        setTimeout(() => {
          const transactionsSection = document.querySelector('h2:has-text("Трансакције")');
          if (transactionsSection) {
            transactionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        return;
      }

      // Create transaction
      const transactionRef = await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'online_package',
        packageId: packageData.id,
        packageName: packageData.name, // Store package name directly
        amount: packageData.price,
        status: 'pending',
        paymentReference: paymentReference,
        created_at: new Date(),
        user_email: userProfile.email,
        userName: userProfile.ime || '',
        userPhone: userProfile.telefon || ''
      });

      // Create pending enrollment
      await addDoc(collection(db, 'online_enrollments'), {
        userId: user.uid,
        packageId: packageData.id,
        transactionId: transactionRef.id,
        status: 'pending',
        remainingClasses: packageData.durationMonths * 4, // 4 classes per month
        usedClasses: 0,
        createdAt: new Date()
      });

      // Close modal and navigate to dashboard
      onClose();
      navigate(`/dashboard`);

      // Scroll to transactions section after navigation
      setTimeout(() => {
        const transactionsHeading = document.querySelector('h2');
        const allHeadings = Array.from(document.querySelectorAll('h2'));
        const transactionsSection = allHeadings.find(h => h.textContent.includes('Трансакције'));
        if (transactionsSection) {
          transactionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Грешка при креирању трансакције');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl relative animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">НАЛОГ ЗА УПЛАТУ</h2>
          </div>

          {/* Uplatnica - Compact Horizontal Layout */}
          <div className="border-4 border-[#1A1A1A] rounded-lg overflow-hidden mb-4">
            {/* Row 1 - Uplatalac */}
            <div className="border-b-2 border-[#1A1A1A] p-3 bg-white">
              <div className="border-2 border-[#1A1A1A] p-2 rounded">
                <label className="text-[10px] font-bold uppercase text-gray-500 block">уплатилац</label>
                <div className="h-6 bg-gray-50 rounded mt-1"></div>
              </div>
            </div>

            {/* Row 2 - Svrha & Primalac (side by side) */}
            <div className="border-b-2 border-[#1A1A1A] p-3 bg-white grid grid-cols-2 gap-3">
              <div className="border-2 border-[#1A1A1A] p-2 rounded">
                <label className="text-[10px] font-bold uppercase text-gray-500 block">сврха уплате</label>
                <div className="font-semibold text-[#1A1A1A] text-sm mt-1">
                  {itemTitle}
                </div>
              </div>
              <div className="border-2 border-[#1A1A1A] p-2 rounded">
                <label className="text-[10px] font-bold uppercase text-gray-500 block">прималац</label>
                <div className="font-semibold text-[#1A1A1A] text-sm mt-1">
                  {companyName}, {companyAddress}
                </div>
              </div>
            </div>

            {/* Row 3 - Payment Details (horizontal) */}
            <div className="border-b-2 border-[#1A1A1A] p-3 bg-white grid grid-cols-5 gap-3">
              <div className="border-2 border-[#1A1A1A] p-2 rounded">
                <label className="text-[10px] font-bold uppercase text-gray-500 block">шифра плаћања</label>
                <div className="font-bold text-[#1A1A1A] text-center mt-1">189</div>
              </div>
              <div className="border-2 border-[#1A1A1A] p-2 rounded">
                <label className="text-[10px] font-bold uppercase text-gray-500 block">валута</label>
                <div className="font-bold text-[#1A1A1A] text-center mt-1">RSD</div>
              </div>
              <div className="border-2 border-[#1A1A1A] p-2 rounded">
                <label className="text-[10px] font-bold uppercase text-gray-500 block">износ</label>
                <div className="font-bold text-[#D62828] text-center mt-1 text-sm">{formatPrice(itemPrice)}</div>
              </div>
              <div className="col-span-2 border-2 border-[#1A1A1A] p-2 rounded">
                <label className="text-[10px] font-bold uppercase text-gray-500 block">рачун примаоца</label>
                <div className="font-mono font-bold text-[#1A1A1A] mt-1 text-sm">
                  {bankAccount}
                </div>
              </div>
            </div>

            {/* Row 4 - Bottom (Poziv na broj, Pecat, Datum) */}
            <div className="bg-gray-50 p-3 grid grid-cols-3 gap-3">
              <div className="border-2 border-[#1A1A1A] p-2 rounded bg-white">
                <label className="text-[10px] font-bold uppercase text-gray-500 block">позив на број</label>
                <div className="font-mono font-bold text-[#D62828] text-center mt-1 text-sm">
                  {paymentReference || 'Генерисање...'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase">печат и потпис уплатиоца</div>
                <div className="h-8 border-b border-gray-300 mt-2"></div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase">датум уплате</div>
                <div className="h-8 border-b border-gray-300 mt-2"></div>
              </div>
            </div>
          </div>

          {/* Instructions - Larger */}
          <div className="bg-[#D62828]/10 border-2 border-[#D62828]/30 rounded-xl p-5">
            <h3 className="text-base font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <span>📋</span> Упутство за уплату:
            </h3>
            <ol className="space-y-2 text-sm text-[#1A1A1A]">
              <li className="flex items-start gap-3">
                <span className="font-bold text-[#D62828] flex-shrink-0 text-lg">1.</span>
                <span className="leading-relaxed">Попуните налог за уплату овим подацима и одите у банку или користите е-банкарство</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-[#D62828] flex-shrink-0 text-lg">2.</span>
                <span className="leading-relaxed"><strong>Направите фотографију или скенирајте потврду</strong> о извршеној уплати</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-[#D62828] flex-shrink-0 text-lg">3.</span>
                <span className="leading-relaxed">Одите на <strong>Ваш Панел → Трансакције</strong> и отпремите слику потврде</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-[#D62828] flex-shrink-0 text-lg">4.</span>
                <span className="leading-relaxed">Приступ курсу ће бити активиран у року од <strong>24 сата</strong> након верификације</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex gap-3 justify-center">
            {type === 'online_package' ? (
              <>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="bg-[#D62828] text-white px-8 py-3 rounded-full font-bold hover:bg-[#B91F1F] transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? 'Обрада...' : 'Потврђујем да желим да купим'}
                </button>
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="bg-gray-100 text-[#1A1A1A] px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Откажи
                </button>
              </>
            ) : (
              <>
                <Link to="/dashboard" onClick={onClose}>
                  <button className="bg-[#D62828] text-white px-10 py-3 rounded-full font-bold hover:bg-[#B91F1F] transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    Иди на Ваш Панел
                  </button>
                </Link>
                <button
                  onClick={onClose}
                  className="bg-gray-100 text-[#1A1A1A] px-10 py-3 rounded-full font-bold hover:bg-gray-200 transition-all"
                >
                  Разумем
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
