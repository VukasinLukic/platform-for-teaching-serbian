import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Alano from './Alano';
import { useAssistantUiStore } from '../../store/assistantUiStore';

/**
 * Kontekstualni "pitaj Alana" trenutak, vezan za tačno mesto na strani.
 *
 * Desktop (xl:+, gde realno postoji bela margina van max-w-7xl kontejnera):
 * kad ovaj deo strane uđe u prikaz, sa desne ivice ekrana se pojavi veća
 * maskota sa oblačićem, mahne i vrati se na disanje dok je sekcija u prikazu,
 * nestane kad se skroluje dalje. Klik otvara chat.
 *
 * Mobilni/tablet (ispod xl:): ista ideja, ali kao obična ugrađena kartica u
 * toku sadržaja — nema plutajućih elemenata (QuickDock na dnu je već dovoljan).
 */
export default function MascotHint({ message, className = '' }) {
  const anchorRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [pose, setPose] = useState('idle');
  const setAssistantOpen = useAssistantUiStore((s) => s.setAssistantOpen);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Mahni jednom svaki put kad sekcija uđe u prikaz, pa se smiri na disanje.
  useEffect(() => {
    if (inView) setPose('wave');
  }, [inView]);

  const openChat = () => setAssistantOpen(true);

  return (
    <div ref={anchorRef} className={className}>
      {/* Desktop cameo — fiksiran uz desnu ivicu, vidljiv samo dok je sekcija u prikazu */}
      <div
        aria-hidden={!inView}
        className={`hidden xl:flex fixed right-6 top-1/2 z-30 -translate-y-1/2 flex-col items-center gap-2 transition-all duration-500 ease-out ${
          inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
        }`}
      >
        <div className="max-w-[168px] rounded-2xl bg-white px-4 py-2.5 text-center text-sm font-bold text-[#1A1A1A] shadow-lg border border-gray-100">
          {message}
        </div>
        <button
          type="button"
          onClick={openChat}
          tabIndex={inView ? 0 : -1}
          className="rounded-full transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D62828]/25"
          aria-label="Отвори помоћника Алана"
        >
          <Alano pose={pose} size={116} onPoseEnd={() => setPose('idle')} />
        </button>
      </div>

      {/* Mobilni/tablet — ugrađena kartica u toku sadržaja */}
      <button
        type="button"
        onClick={openChat}
        className="xl:hidden flex w-full items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <Alano pose="idle" size={56} className="flex-shrink-0" />
        <span className="flex-1 font-bold text-[#1A1A1A]">{message}</span>
        <ArrowRight className="h-5 w-5 flex-shrink-0 text-[#D62828]" />
      </button>
    </div>
  );
}
