import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import EmptyState from './EmptyState';
import { toMillis } from './progressService';

const WEAK_THRESHOLD = 60; // % — last result below this is highlighted as a topic to practise

function barColor(percent) {
  if (percent >= 80) return 'bg-green-600';
  if (percent >= WEAK_THRESHOLD) return 'bg-[#F2C94C]';
  return 'bg-[#D62828]';
}

/**
 * Quiz results per topic (one quiz = one topic), weakest topics highlighted.
 * @param {{ results: Record<string, object>, quizTitles: Record<string, string>, quizBasePath: string }} props
 */
export default function QuizResultsCard({ results, quizTitles = {}, quizBasePath = '/quizzes' }) {
  const rows = Object.entries(results || {})
    .map(([quizId, r]) => ({
      quizId,
      title: quizTitles[quizId] || quizId,
      lastPercent: r.lastPercent ?? 0,
      bestPercent: r.bestPercent ?? r.lastPercent ?? 0,
      attempts: r.attempts || 1,
      history: r.history || [],
      updatedAt: toMillis(r.updatedAt),
    }))
    .sort((a, b) => a.lastPercent - b.lastPercent);

  if (rows.length === 0) {
    return (
      <EmptyState
        compact
        pose="reading"
        title="Још ниси урадио ниједан квиз"
        text="Уради први квиз и овде ћеш видети резултате по темама и шта треба још да вежбаш."
        action={
          <Link to={quizBasePath} className="inline-flex items-center gap-2 bg-[#D62828] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#B91F1F]">
            Почни квиз <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        }
      />
    );
  }

  const weakest = rows.filter((r) => r.lastPercent < WEAK_THRESHOLD).slice(0, 3);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-5 sm:p-7">
      {weakest.length > 0 && (
        <div className="mb-6 bg-[#FFF5F5] border border-[#D62828]/20 rounded-2xl p-4">
          <p className="flex items-center gap-2 font-bold text-[#1A1A1A] mb-2">
            <AlertTriangle className="w-5 h-5 text-[#D62828]" aria-hidden="true" />
            Теме за вежбање
          </p>
          <ul className="flex flex-wrap gap-2">
            {weakest.map((r) => (
              <li key={r.quizId}>
                <Link
                  to={`${quizBasePath}/${r.quizId}`}
                  className="inline-flex items-center gap-1.5 bg-white border border-[#D62828]/30 text-[#D62828] rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-[#D62828] hover:text-white transition-colors"
                >
                  {r.title} · {r.lastPercent}%
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="divide-y divide-gray-100">
        {rows.map((r) => {
          const prev = r.history.length > 1 ? r.history[r.history.length - 2].percent : null;
          const improved = prev !== null && r.lastPercent > prev;
          return (
            <li key={r.quizId} className="py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <Link to={`${quizBasePath}/${r.quizId}`} className="font-semibold text-[#1A1A1A] hover:text-[#D62828] min-w-0 truncate">
                  {r.title}
                </Link>
                <span className="flex items-center gap-2 flex-shrink-0 text-sm">
                  {improved && (
                    <span className="inline-flex items-center gap-1 text-green-700 font-semibold" title="Бољи резултат него прошли пут">
                      <TrendingUp className="w-4 h-4" aria-hidden="true" />
                      <span className="sr-only">Напредак</span>
                    </span>
                  )}
                  <span className="font-bold text-[#1A1A1A]">{r.lastPercent}%</span>
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden" aria-hidden="true">
                <div className={`h-full rounded-full ${barColor(r.lastPercent)}`} style={{ width: `${Math.max(r.lastPercent, 3)}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Најбољи резултат {r.bestPercent}% · покушаја: {r.attempts}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
