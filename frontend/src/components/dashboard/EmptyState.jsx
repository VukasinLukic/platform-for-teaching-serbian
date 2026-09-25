const POSES = {
  reading: '/mascot/alano-reading.webp',
  wave: '/mascot/alano-wave.webp',
  hero: '/mascot/alano-hero.webp',
  celebrating: '/mascot/alano-celebrating.webp',
};

/** Friendly empty state with the Alano mascot. */
export default function EmptyState({ pose = 'reading', title, text, action = null, compact = false }) {
  return (
    <div
      className={`flex flex-col ${compact ? 'sm:flex-row sm:text-left' : ''} items-center text-center gap-4 sm:gap-6 bg-gradient-to-br from-[#FFF8F0] to-white border border-gray-100 rounded-3xl ${
        compact ? 'p-5 sm:p-6' : 'p-6 sm:p-10'
      }`}
    >
      <img
        src={POSES[pose] || POSES.reading}
        alt=""
        width="120"
        height="120"
        loading="lazy"
        className={`${compact ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-28 h-28 sm:w-32 sm:h-32'} object-contain flex-shrink-0`}
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-1.5">{title}</h3>
        {text && <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto sm:mx-0">{text}</p>}
        {action && <div className={`mt-4 flex ${compact ? 'justify-center sm:justify-start' : 'justify-center'}`}>{action}</div>}
      </div>
    </div>
  );
}
