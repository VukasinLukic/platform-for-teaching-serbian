/**
 * Learning progress stored in the user's own `progress/{uid}_*` documents
 * (firestore.rules: readable/writable only by the owner, id must start with "<uid>_").
 *
 *  progress/{uid}_course_{courseId}
 *    { userId, type: 'course', courseId, lastLessonId, lastLessonTitle, updatedAt,
 *      lessons: { [lessonId]: { percent, completed, updatedAt } } }
 *
 *  progress/{uid}_quizzes
 *    { userId, type: 'quizzes', updatedAt,
 *      results: { [quizId]: { lastScore, total, lastPercent, bestPercent, attempts,
 *                             history: [{ percent, at }], updatedAt } } }
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

const COMPLETED_AT_PERCENT = 90;
const QUIZ_HISTORY_LENGTH = 10;

export const courseProgressId = (uid, courseId) => `${uid}_course_${courseId}`;
export const quizProgressId = (uid) => `${uid}_quizzes`;

/**
 * Saves that the user opened/watched a lesson. `percent` is optional (0–100).
 * A lesson is marked completed once it reaches 90 % and never un-marked.
 */
export async function saveLessonProgress(uid, { courseId, lessonId, lessonTitle = '', percent = null }) {
  if (!uid || !courseId || !lessonId) return;
  const lesson = { updatedAt: serverTimestamp() };
  if (typeof percent === 'number' && Number.isFinite(percent)) {
    lesson.percent = Math.max(0, Math.min(100, Math.round(percent)));
    if (lesson.percent >= COMPLETED_AT_PERCENT) lesson.completed = true;
  }
  await setDoc(
    doc(db, 'progress', courseProgressId(uid, courseId)),
    {
      userId: uid,
      type: 'course',
      courseId,
      lastLessonId: lessonId,
      lastLessonTitle: lessonTitle || '',
      updatedAt: serverTimestamp(),
      lessons: { [lessonId]: lesson },
    },
    { merge: true }
  );
}

export async function getCourseProgress(uid, courseId) {
  if (!uid || !courseId) return null;
  const snap = await getDoc(doc(db, 'progress', courseProgressId(uid, courseId)));
  return snap.exists() ? snap.data() : null;
}

/** Number of completed lessons in a course progress doc. */
export function countCompletedLessons(progress) {
  if (!progress?.lessons) return 0;
  return Object.values(progress.lessons).filter((l) => l?.completed === true).length;
}

export async function saveQuizResult(uid, { quizId, score, total }) {
  if (!uid || !quizId || !total) return;
  const ref = doc(db, 'progress', quizProgressId(uid));
  const snap = await getDoc(ref);
  const previous = snap.exists() ? snap.data().results?.[quizId] : null;
  const percent = Math.round((score / total) * 100);
  const history = [...(previous?.history || []), { percent, at: new Date().toISOString() }].slice(
    -QUIZ_HISTORY_LENGTH
  );

  await setDoc(
    ref,
    {
      userId: uid,
      type: 'quizzes',
      updatedAt: serverTimestamp(),
      results: {
        [quizId]: {
          lastScore: score,
          total,
          lastPercent: percent,
          bestPercent: Math.max(percent, previous?.bestPercent ?? 0),
          attempts: (previous?.attempts || 0) + 1,
          history,
          updatedAt: serverTimestamp(),
        },
      },
    },
    { merge: true }
  );
}

export async function getQuizResults(uid) {
  if (!uid) return {};
  const snap = await getDoc(doc(db, 'progress', quizProgressId(uid)));
  return snap.exists() ? snap.data().results || {} : {};
}

/** Firestore Timestamp | Date | ISO string -> milliseconds (0 when unknown). */
export function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}
