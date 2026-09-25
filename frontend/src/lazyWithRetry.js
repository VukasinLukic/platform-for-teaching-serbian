import { lazy } from 'react';

/**
 * After a new deploy the hashed chunk files of the previous build disappear from the
 * server. A tab that was opened before the deploy then fails to load the next lazy page
 * ("Failed to fetch dynamically imported module") and would show a white screen.
 *
 * lazyWithRetry() wraps React.lazy: on a chunk load error it reloads the page once,
 * so the browser fetches the new index.html and the new chunk names. A per-chunk
 * sessionStorage flag prevents reload loops; it is cleared when the chunk loads.
 */

const FLAG_PREFIX = 'srpskiusrcu_chunk_retry:';

const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading (CSS )?chunk [\w-]+ failed/i,
  /Unable to preload CSS/i,
  /ChunkLoadError/i,
  /is not a valid JavaScript MIME type/i,
];

export function isChunkLoadError(error) {
  if (!error) return false;
  const text = `${error.name || ''} ${error.message || error}`;
  return CHUNK_ERROR_PATTERNS.some((re) => re.test(text));
}

function storageGet(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function storageRemove(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Removes all retry flags (used by the "refresh page" button in ErrorBoundary). */
export function clearChunkRetryFlags() {
  try {
    const keys = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key && key.startsWith(FLAG_PREFIX)) keys.push(key);
    }
    keys.forEach(storageRemove);
  } catch {
    /* ignore */
  }
}

// Short, stable id per lazy factory. In production the factory source contains the
// hashed chunk file name, so every chunk gets its own flag.
function factoryKey(factory) {
  const src = String(factory);
  let hash = 0;
  for (let i = 0; i < src.length; i += 1) {
    hash = (hash * 31 + src.charCodeAt(i)) | 0;
  }
  return FLAG_PREFIX + (hash >>> 0).toString(36);
}

/**
 * Reloads the page once for the given key. Returns false when a reload was already
 * attempted (or storage is unavailable), so the caller should surface the error.
 */
export function reloadOnceForChunkError(key = `${FLAG_PREFIX}global`) {
  if (storageGet(key)) return false;
  if (!storageSet(key, String(Date.now()))) return false;
  window.location.reload();
  return true;
}

export function lazyWithRetry(factory) {
  const key = factoryKey(factory);
  return lazy(async () => {
    try {
      const module = await factory();
      storageRemove(key);
      return module;
    } catch (error) {
      if (isChunkLoadError(error) && reloadOnceForChunkError(key)) {
        // Keep Suspense fallback visible while the page reloads.
        return new Promise(() => {});
      }
      throw error;
    }
  });
}

/**
 * Vite fires `vite:preloadError` when a preloaded dependency (JS/CSS) of a dynamic
 * import fails. Handle it with the same one-time reload.
 */
export function installPreloadErrorHandler() {
  if (typeof window === 'undefined' || window.__srpskiPreloadHandler) return;
  window.__srpskiPreloadHandler = true;
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnceForChunkError(`${FLAG_PREFIX}preload`)) {
      event.preventDefault();
    }
  });
  // A successful full load means the current build is served; allow a future retry.
  window.addEventListener('load', () => {
    setTimeout(() => storageRemove(`${FLAG_PREFIX}preload`), 10000);
  });
}
