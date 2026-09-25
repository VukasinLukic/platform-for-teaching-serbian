import { Link } from 'react-router-dom';
import { PlayCircle, ArrowRight } from 'lucide-react';

/**
 * "Настави где си стао" — last opened lesson and course progress.
 * @param {{ course: object, lastLessonId: string, lastLessonTitle: string, percent: number|null }} props
 */
export default function ContinueLearningCard({ course, lastLessonId, lastLessonTitle, percent }) {
  const href = `/course/${course.id}${lastLessonId ? `?lekcija=${encodeURIComponent(lastLessonId)}` : ''}`;
  const hasPercent = typeof percent === 'number';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-800 text-white rounded-3xl p-5 sm:p-7 h-full">
      <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10" aria-hidden="true" />
      <p className="relative text-sm font-semibold uppercase tracking-wider text-white">Настави где си стао</p>
      <h2 className="relative mt-1 text-xl sm:text-2xl font-bold break-words">{course.title}</h2>
      {lastLessonTitle && (
        <p className="relative mt-1 text-white text-sm sm:text-base break-words">
          Последња лекција: <span className="font-semibold">{lastLessonTitle}</span>
        </p>
      )}

      {hasPercent && (
        <div className="relative mt-4">
          <div className="flex justify-between text-sm font-semibold mb-1.5">
            <span>Напредак</span>
            <span>{percent}%</span>
          </div>
          <div
            className="h-2.5 bg-white/25 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Напредак кроз курс"
          >
            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      <Link
        to={href}
        className="relative mt-5 inline-flex items-center gap-2 bg-white text-brand px-5 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
      >
        <PlayCircle className="w-5 h-5" aria-hidden="true" />
        Настави лекцију
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
