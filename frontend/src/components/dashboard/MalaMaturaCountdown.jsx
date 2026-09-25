import { CalendarDays } from 'lucide-react';

/**
 * Date of the first day of the mala matura (završni ispit) exam, local time.
 * TODO(content): set the official date once the Ministry of Education publishes the
 * 2027 calendar, e.g. '2027-06-16'. While it is null the countdown is not shown.
 */
export const MALA_MATURA_DATE = null;

function daysUntil(isoDate, now = new Date()) {
  const target = new Date(`${isoDate}T09:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((startOfTarget - startOfToday) / 86400000);
}

function daysLabel(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'дан';
  return 'дана';
}

export default function MalaMaturaCountdown({ date = MALA_MATURA_DATE }) {
  if (!date) return null;
  const days = daysUntil(date);
  if (days === null || days < 0) return null;

  const formatted = new Intl.DateTimeFormat('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(`${date}T09:00:00`)
  );

  return (
    <div className="bg-ink text-white rounded-3xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5 h-full">
      <div className="w-12 h-12 rounded-2xl bg-gold text-ink flex items-center justify-center flex-shrink-0">
        <CalendarDays className="w-6 h-6" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-white/70">До мале матуре</p>
        <p className="text-3xl sm:text-4xl font-extrabold leading-tight">
          {days === 0 ? 'Данас!' : (
            <>
              {days} <span className="text-lg font-bold text-white">{daysLabel(days)}</span>
            </>
          )}
        </p>
        <p className="text-xs text-white/60 mt-0.5">{formatted}</p>
      </div>
    </div>
  );
}
