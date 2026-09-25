/**
 * Lesson access checks shared by getVideoUrl and getMaterialUrl
 */

import { HttpsError } from 'firebase-functions/v2/https';

/**
 * Loads a lesson and verifies the user may open it: either it is the free preview
 * (first lesson of the first module) or the user owns the course.
 * @returns {Promise<{ lesson: object, lessonCourseId: string }>}
 */
export const loadLessonWithAccessCheck = async (db, lessonId, userId) => {
  const lessonDoc = await db.collection('lessons').doc(lessonId).get();

  if (!lessonDoc.exists) {
    throw new HttpsError('not-found', 'Lekcija ne postoji');
  }

  const lesson = lessonDoc.data();

  // Support both field names: courseId (camelCase) and course_id (underscore)
  const lessonCourseId = lesson.courseId || lesson.course_id;

  // Check if this is a free preview lesson (first lesson of first module)
  let isFreePreview = false;
  if (lesson.moduleId && lessonCourseId) {
    const modulesSnap = await db.collection('modules')
      .where('courseId', '==', lessonCourseId)
      .orderBy('order', 'asc')
      .limit(1)
      .get();

    if (!modulesSnap.empty) {
      const firstModule = modulesSnap.docs[0];
      if (firstModule.id === lesson.moduleId) {
        const lessonsSnap = await db.collection('lessons')
          .where('moduleId', '==', firstModule.id)
          .orderBy('order', 'asc')
          .limit(1)
          .get();

        if (!lessonsSnap.empty && lessonsSnap.docs[0].id === lessonId) {
          isFreePreview = true;
        }
      }
    }
  }

  if (!isFreePreview) {
    const userCoursesDoc = await db.collection('user_courses').doc(userId).get();
    const userCourses = userCoursesDoc.exists ? userCoursesDoc.data().courses || {} : {};

    if (!lessonCourseId || !userCourses[lessonCourseId]) {
      throw new HttpsError(
        'permission-denied',
        'Nemate pristup ovom kursu. Molimo kupite kurs da biste pristupili lekcijama.'
      );
    }
  }

  return { lesson, lessonCourseId };
};

/**
 * Returns the Storage object path of a lesson material. New materials store `path`;
 * older ones only have a Firebase download URL, from which the path is recovered.
 */
export const getMaterialStoragePath = (material) => {
  if (!material) return null;
  if (typeof material.path === 'string' && material.path) return material.path;
  if (typeof material.url === 'string') {
    const match = material.url.match(/\/o\/([^?]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
};
