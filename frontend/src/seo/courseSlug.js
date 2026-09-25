/**
 * Resolves a /kurs/:slug URL to a Firestore course id.
 * 1) course with matching `slug` field; 2) fallback: course whose slugified
 * title matches (for courses saved before the slug field existed).
 */
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { slugify } from './transliterate';

export async function resolveCourseIdBySlug(slug) {
  if (!slug) return null;
  const bySlug = await getDocs(query(collection(db, 'courses'), where('slug', '==', slug), limit(1)));
  if (!bySlug.empty) return bySlug.docs[0].id;
  const all = await getDocs(collection(db, 'courses'));
  const match = all.docs.find((d) => slugify(d.data().title) === slug);
  return match ? match.id : null;
}

/** Public URL path for a course object ({ id, slug?, type? }). */
export function coursePath(course) {
  if (course.type === 'live') return `/online-class/${course.id}`;
  return course.slug ? `/kurs/${course.slug}` : `/course/${course.id}`;
}
