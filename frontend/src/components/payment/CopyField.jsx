import { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy approach */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * One payment field with a "Копирај" button (for paying from a mobile banking app).
 * `copyValue` lets the copied text differ from the displayed one (e.g. no dashes).
 */
export default function CopyField({ label, value, copyValue, mono = false, highlight = false }) {
  const [state, setState] = useState('idle'); // idle | copied | failed
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    const ok = await copyText(String(copyValue ?? value ?? ''));
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  };

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-gray-100 last:border-b-0">
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
        <dd
          className={`mt-0.5 break-words ${mono ? 'font-mono tracking-wide' : ''} ${
            highlight ? 'text-lg font-extrabold text-brand' : 'text-base font-semibold text-ink'
          }`}
        >
          {value}
        </dd>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Копирај: ${label}`}
        className={`flex-shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl text-sm font-bold border-2 transition-colors ${
          state === 'copied'
            ? 'bg-green-50 border-green-500 text-green-700'
            : state === 'failed'
              ? 'bg-red-50 border-red-300 text-red-700'
              : 'bg-white border-gray-200 text-ink hover:border-brand hover:text-brand'
        }`}
      >
        {state === 'copied' ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
        <span aria-live="polite">{state === 'copied' ? 'Копирано' : state === 'failed' ? 'Грешка' : 'Копирај'}</span>
      </button>
    </div>
  );
}
