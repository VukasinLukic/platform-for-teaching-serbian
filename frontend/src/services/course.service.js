/**
 * Course Service
 * Handles course and lesson data operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get all active courses
 * @returns {Promise<Array>}
 */
export const getAllCourses = async () => {
  try {
    const q = query(
      collection(db, 'courses'),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

/**
 * Get course by ID
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export const getCourseById = async (courseId) => {
  try {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Kurs ne postoji');
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

/**
 * Get all lessons for a course
 * @param {string} courseId
 * @returns {Promise<Array>}
 */
export const getCourseLessons = async (courseId) => {
  try {
    const q = query(
      collection(db, 'lessons'),
      where('course_id', '==', courseId),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

/**
 * Check if user has access to a course
 * @param {string} userId
 * @param {string} courseId
 * @returns {Promise<boolean>}
 */
export const checkUserAccess = async (userId, courseId) => {
  try {
    const docRef = doc(db, 'user_courses', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const courses = docSnap.data().courses || {};
    return !!courses[courseId];
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
};

/**
 * Get user's purchased courses
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getUserCourses = async (userId) => {
  try {
    const docRef = doc(db, 'user_courses', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return [];
    }

    const coursesData = docSnap.data().courses || {};
    const courseIds = Object.keys(coursesData);

    // Fetch course details for each purchased course
    const coursesPromises = courseIds.map(async (courseId) => {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        return {
          id: courseDoc.id,
          ...courseDoc.data(),
          purchased_at: coursesData[courseId].purchased_at,
        };
      }
      return null;
    });

    const courses = await Promise.all(coursesPromises);
    return courses.filter(Boolean);
  } catch (error) {
    console.error('Error fetching user courses:', error);
    throw error;
  }
};

/**
 * Get course modules with their lessons
 * @param {string} courseId
 * @returns {Promise<Array>}
 */
export const getCourseModulesWithLessons = async (courseId) => {
  try {
    // Get modules for the course
    const modulesQuery = query(
      collection(db, 'modules'),
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    );
    const modulesSnapshot = await getDocs(modulesQuery);

    // For each module, get its lessons
    const modulesWithLessons = await Promise.all(
      modulesSnapshot.docs.map(async (moduleDoc) => {
        const moduleData = { id: moduleDoc.id, ...moduleDoc.data() };

        // Get lessons for this module
        const lessonsQuery = query(
          collection(db, 'lessons'),
          where('moduleId', '==', moduleDoc.id),
          orderBy('order', 'asc')
        );
        const lessonsSnapshot = await getDocs(lessonsQuery);

        const lessons = lessonsSnapshot.docs.map(lessonDoc => ({
          id: lessonDoc.id,
          ...lessonDoc.data()
        }));

        return {
          ...moduleData,
          lessons
        };
      })
    );

    return modulesWithLessons;
  } catch (error) {
    console.error('Error fetching course modules with lessons:', error);
    throw error;
  }
};
