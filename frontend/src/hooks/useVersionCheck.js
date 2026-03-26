import { useState, useEffect, useCallback, useRef } from 'react';

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minuta
const CURRENT_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : null;

export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const intervalRef = useRef(null);
  const lastCheckRef = useRef(0);

  const checkVersion = useCallback(async () => {
    if (import.meta.env.DEV) return;
    if (!CURRENT_VERSION) return;
    if (Date.now() - lastCheckRef.current < 30000) return;
    lastCheckRef.current = Date.now();

    try {
      const response = await fetch('/version.json?_t=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) return;

      const data = await response.json();

      if (data.version && data.version !== CURRENT_VERSION) {
        setUpdateAvailable(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    } catch {
      // Tiho ignorisanje - network greske ne treba da utiču na UX
    }
  }, []);

  const silentReload = useCallback(() => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload();
  }, []);

  // Provera na mount i periodično
  useEffect(() => {
    const timeout = setTimeout(checkVersion, 10000);
    intervalRef.current = setInterval(checkVersion, CHECK_INTERVAL);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkVersion]);

  return {
    updateAvailable,
    checkVersion,
    silentReload,
  };
}
