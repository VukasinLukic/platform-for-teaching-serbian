import { useEffect, useState } from 'react';

/**
 * Prati korisnikovo sistemsko podešavanje "smanjeno kretanje" (prefers-reduced-motion).
 * Koristi se da isključimo dekorativne animacije (disanje, mahanje, skok, srca)
 * i ostavimo samo neophodan crossfade pri promeni poze.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReduced(e.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  return reduced;
}

export default usePrefersReducedMotion;
