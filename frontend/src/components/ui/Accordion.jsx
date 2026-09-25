import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function AccordionItem({ title, children, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 py-5 text-left group rounded-lg"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className={`text-base sm:text-lg font-semibold transition-colors ${isOpen ? 'text-brand' : 'text-ink group-hover:text-brand'}`}>
          {title}
        </span>
        <div className={`shrink-0 p-2 rounded-full transition-colors ${isOpen ? 'bg-brand-50' : 'bg-paper-100 group-hover:bg-brand-50'}`}>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-brand" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-ink-500 group-hover:text-brand" aria-hidden="true" />
          )}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[40rem] opacity-100 mb-5' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-ink-600 leading-relaxed pr-2 sm:pr-10">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="bg-white rounded-3xl shadow-card px-5 py-2 sm:px-8 sm:py-4 border border-ink-100">
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

