import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Ako postoji hash (npr #kursevi), ne skroluj na vrh nego pusti browser da odradi svoje (ili ručno skroluj do elementa)
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      // Opciono: sačekaj malo da se stranica renderuje pa skroluj do elementa
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname, hash]);

  return null;
}

