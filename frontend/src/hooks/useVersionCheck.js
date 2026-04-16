import { useState, useEffect, useCallback, useRef } from 'react';

const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 sata (jednom dnevno)
const CURRENT_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : null;

export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const intervalRef = useRef(null);
  const lastCheckRef = useRef(0);

  const checkVersion = useCallback(async () => {
    console.log('[VERSION CHECK] Starting check...', {
      isDev: import.meta.env.DEV,
      currentVersion: CURRENT_VERSION,
      timeSinceLastCheck: Date.now() - lastCheckRef.current,
    });

    if (import.meta.env.DEV) {
      console.log('[VERSION CHECK] Skipping - DEV mode');
      return;
    }
    if (!CURRENT_VERSION) {
      console.log('[VERSION CHECK] Skipping - No current version');
      return;
    }
    if (Date.now() - lastCheckRef.current < 30000) {
      console.log('[VERSION CHECK] Skipping - Too soon since last check');
      return;
    }
    lastCheckRef.current = Date.now();

    try {
      const response = await fetch('/version.json?_t=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) {
        console.log('[VERSION CHECK] Response not OK');
        return;
      }

      const data = await response.json();
      console.log('[VERSION CHECK] Fetched version:', data.version, 'Current:', CURRENT_VERSION);

      if (data.version && data.version !== CURRENT_VERSION) {
        console.warn('[VERSION CHECK] UPDATE AVAILABLE - Different version detected!');
        setUpdateAvailable(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        console.log('[VERSION CHECK] No update needed - versions match');
      }
    } catch (error) {
      console.error('[VERSION CHECK] Error:', error);
    }
  }, []);

  const silentReload = useCallback(() => {
    console.warn('[VERSION CHECK] RELOADING PAGE - Silent reload triggered!');
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload();
  }, []);

  // Provera na mount i periodično
  useEffect(() => {
    console.log('[VERSION CHECK] Setting up - First check in 10s, then every 24h');
    const timeout = setTimeout(checkVersion, 10000);
    intervalRef.current = setInterval(checkVersion, CHECK_INTERVAL);

    return () => {
      console.log('[VERSION CHECK] Cleaning up intervals');
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
