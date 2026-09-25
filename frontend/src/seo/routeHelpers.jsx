import { lazy, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { IS_LATIN } from './script';

const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

/** /quizzes/:quizId -> /kvizovi/:quizId (old URLs). */
export function LegacyQuizRedirect() {
  const { quizId } = useParams();
  return <Navigate to={`/kvizovi/${encodeURIComponent(quizId || '')}`} replace />;
}

/**
 * A client-side navigation to /lat/... from the Cyrillic app (the router has no
 * basename there): do a full load so the app boots in Latin mode.
 * Inside the Latin app this path would be /lat/lat/... — show 404 instead.
 */
export function LatinMirrorReload() {
  useEffect(() => {
    if (!IS_LATIN) window.location.replace(window.location.href);
  }, []);
  return IS_LATIN ? <NotFoundPage /> : null;
}
