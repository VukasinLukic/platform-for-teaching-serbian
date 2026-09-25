import { Link } from 'react-router-dom';
import { Check, Clock, X, Upload, FileText, Send } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils/helpers';

/**
 * Payment status per transaction:
 *   Чека уплату → Доказ послат → Одобрено / Одбијено
 */

function stepsFor(tx) {
  const hasProof = !!tx.confirmationUrl;
  const decided = tx.status === 'confirmed' || tx.status === 'rejected';
  return [
    { key: 'created', label: 'Чека уплату', state: 'done', icon: Clock },
    {
      key: 'proof',
      label: 'Доказ послат',
      state: hasProof ? 'done' : decided ? 'skipped' : 'current',
      icon: Send,
    },
    tx.status === 'rejected'
      ? { key: 'result', label: 'Одбијено', state: 'rejected', icon: X }
      : {
          key: 'result',
          label: 'Одобрено',
          state: tx.status === 'confirmed' ? 'done' : hasProof ? 'current' : 'todo',
          icon: Check,
        },
  ];
}

const DOT = {
  done: 'bg-green-600 text-white border-green-600',
  current: 'bg-white text-[#D62828] border-[#D62828] ring-4 ring-[#D62828]/10',
  todo: 'bg-white text-gray-300 border-gray-200',
  skipped: 'bg-gray-100 text-gray-400 border-gray-200',
  rejected: 'bg-red-600 text-white border-red-600',
};

const LABEL = {
  done: 'text-[#1A1A1A]',
  current: 'text-[#D62828]',
  todo: 'text-gray-400',
  skipped: 'text-gray-400',
  rejected: 'text-red-700',
};

function Timeline({ tx }) {
  const steps = stepsFor(tx);
  return (
    <ol className="grid grid-cols-3" aria-label="Статус уплате">
      {steps.map((step, index) => {
        const Icon = step.state === 'done' ? Check : step.icon;
        const next = steps[index + 1];
        const lineDone = next && (next.state === 'done' || next.state === 'rejected' || next.state === 'current');
        return (
          <li
            key={step.key}
            className="relative flex flex-col items-center text-center"
            aria-current={step.state === 'current' ? 'step' : undefined}
          >
            {next && (
              <span
                className={`absolute top-[17px] left-1/2 w-full h-0.5 ${lineDone ? 'bg-green-600' : 'bg-gray-200'}`}
                aria-hidden="true"
              />
            )}
            <span className={`relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center ${DOT[step.state]}`}>
              <Icon className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className={`mt-2 px-1 text-xs sm:text-sm font-semibold leading-tight ${LABEL[step.state]}`}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function statusText(tx) {
  if (tx.status === 'confirmed') return 'Уплата је одобрена и приступ је активиран.';
  if (tx.status === 'rejected') return 'Уплата није прихваћена. Пиши нам ако мислиш да је у питању грешка.';
  if (tx.confirmationUrl) return 'Проверавамо уплату — обично у року од 24 часа.';
  return 'Уплати по уплатници и пошаљи доказ — одобравамо обично у року од 24 часа.';
}

export default function PaymentStatusTimeline({ transactions, onUploadProof }) {
  const sorted = [...transactions].sort((a, b) => {
    const order = (t) => (t.status === 'pending' ? 0 : 1);
    return order(a) - order(b) || (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0);
  });

  return (
    <ul className="space-y-4">
      {sorted.map((tx) => {
        const name = tx.courseName || tx.packageName || tx.course?.title || 'Уплата';
        const isPending = tx.status === 'pending';
        const ref = tx.payment_ref || tx.paymentReference;
        return (
          <li key={tx.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-5">
              <div className="min-w-0">
                <h3 className="font-bold text-[#1A1A1A] text-base sm:text-lg break-words">{name}</h3>
                <p className="text-sm text-gray-500">
                  {tx.createdAt instanceof Date && !Number.isNaN(tx.createdAt.getTime()) ? formatDate(tx.createdAt) : ''}
                  {ref ? ` · позив на број ${ref}` : ''}
                </p>
              </div>
              <div className="text-xl font-extrabold text-[#D62828] whitespace-nowrap">{formatPrice(tx.amount || 0)}</div>
            </div>

            <Timeline tx={tx} />

            <p className="mt-5 text-sm text-gray-600">{statusText(tx)}</p>

            {isPending && (
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/uplatnica?tx=${encodeURIComponent(tx.id)}`}
                  className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-[#1A1A1A] px-4 py-2.5 rounded-xl font-bold text-sm hover:border-[#1A1A1A] transition-colors"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  Уплатница и QR код
                </Link>
                {!tx.confirmationUrl && onUploadProof && (
                  <button
                    type="button"
                    onClick={() => onUploadProof(tx)}
                    className="inline-flex items-center justify-center gap-2 bg-[#D62828] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#B91F1F] transition-colors"
                  >
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    Пошаљи доказ о уплати
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
