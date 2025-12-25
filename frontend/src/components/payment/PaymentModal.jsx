import { X, CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '../../utils/helpers';
import Button from '../ui/Button';

export default function PaymentModal({ course, onClose }) {
  const [copied, setCopied] = useState(false);
  const bankAccount = import.meta.env.VITE_BANK_ACCOUNT;
  const companyName = import.meta.env.VITE_COMPANY_NAME || 'СРПСКИ У СРЦУ';
  const companyAddress = import.meta.env.VITE_COMPANY_ADDRESS || 'Београд, Србија';

  const handleCopy = () => {
    navigator.clipboard.writeText(bankAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="text-center mb-8">
           <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">Упутство за уплату</h3>
           <p className="text-gray-500">За приступ курсу: <span className="font-bold text-[#D62828]">{course.title}</span></p>
        </div>

        <div className="space-y-6">
           <div className="bg-[#F7F7F7] p-6 rounded-3xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-gray-500 text-sm font-bold uppercase">Износ за уплату</span>
                 <span className="text-2xl font-black text-[#D62828]">{formatPrice(course.price)}</span>
              </div>
              <div className="h-px bg-gray-200 my-4"></div>
              <div className="space-y-3">
                 <div>
                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">Прималац</div>
                    <div className="font-bold text-[#1A1A1A]">{companyName}, {companyAddress}</div>
                 </div>
                 <div>
                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">Сврха уплате</div>
                    <div className="font-bold text-[#1A1A1A]">Уплата за курс: {course.title}</div>
                 </div>
                 <div className="relative">
                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">Рачун примаоца</div>
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
                       <code className="text-lg font-mono font-bold text-[#1A1A1A]">{bankAccount}</code>
                       <button
                         onClick={handleCopy}
                         className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                       >
                          {copied ? <CheckCircle size={18} className="text-[#D62828]" /> : <Copy size={18} className="text-gray-400" />}
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-[#D62828]/10 p-4 rounded-2xl flex gap-3 items-start border border-[#D62828]/20">
              <CheckCircle className="w-5 h-5 text-[#D62828] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#1A1A1A]">
                 Након уплате, пошаљите доказ о уплати кроз Ваш Панел како бисмо вам одмах активирали приступ.
              </p>
           </div>
        </div>

        <div className="mt-8">
           <Button onClick={onClose} variant="primary" className="w-full py-4 text-lg">
              Разумем
           </Button>
        </div>
      </div>
    </div>
  );
}

