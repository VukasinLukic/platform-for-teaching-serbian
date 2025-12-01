import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function AccordionItem({ title, children, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full flex items-center justify-between py-6 text-left focus:outline-none group"
        onClick={onClick}
      >
        <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-[#003366]' : 'text-gray-700 group-hover:text-[#003366]'}`}>
          {title}
        </span>
        <div className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-[#BFECC9]' : 'bg-gray-100 group-hover:bg-[#F5F3EF]'}`}>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-[#003366]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-[#003366]" />
          )}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-gray-600 leading-relaxed pr-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-lg p-8 md:p-10 border border-gray-100">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          isOpen={index === openIndex}
          onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}

