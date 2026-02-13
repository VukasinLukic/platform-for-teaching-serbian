import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Cloud Function to generate signed URL for video access
 * Only authenticated users who purchased the course can access videos
 */
export const getVideoUrl = onCall({ region: 'europe-west1' }, async (request) => {
  // Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Morate biti ulogovani');
  }

  const { lessonId } = request.data;
  const userId = request.auth.uid;

  if (!lessonId) {
    throw new HttpsError('invalid-argument', 'lessonId je obavezan');
  }

  try {
    // Get lesson data
    const db = getFirestore();
    const lessonDoc = await db.collection('lessons').doc(lessonId).get();

    if (!lessonDoc.exists) {
      throw new HttpsError('not-found', 'Lekcija ne postoji');
    }

    const lesson = lessonDoc.data();

    // Check if this is a free preview lesson (first lesson of first module)
    let isFreePreview = false;
    if (lesson.moduleId && lesson.course_id) {
      const modulesQuery = db.collection('modules')
        .where('courseId', '==', lesson.course_id)
        .orderBy('order', 'asc')
        .limit(1);
      const modulesSnap = await modulesQuery.get();

      if (!modulesSnap.empty) {
        const firstModule = modulesSnap.docs[0];
        if (firstModule.id === lesson.moduleId) {
          const lessonsQuery = db.collection('lessons')
            .where('moduleId', '==', firstModule.id)
            .orderBy('order', 'asc')
            .limit(1);
          const lessonsSnap = await lessonsQuery.get();

          if (!lessonsSnap.empty && lessonsSnap.docs[0].id === lessonId) {
            isFreePreview = true;
          }
        }
      }
    }

    // Check if user has access to the course (skip for free preview lessons)
    if (!isFreePreview) {
      const userCoursesDoc = await db.collection('user_courses').doc(userId).get();
      const userCourses = userCoursesDoc.exists ? userCoursesDoc.data().courses : {};

      if (!userCourses[lesson.course_id]) {
        throw new HttpsError(
          'permission-denied',
          'Nemate pristup ovom kursu. Molimo kupite kurs da biste pristupili lekcijama.'
        );
      }
    }

    // Generate signed URL with 1 hour expiration
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: lesson.video_key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return {
      url: signedUrl,
      expiresIn: 3600,
      lessonTitle: lesson.title,
    };
  } catch (error) {
    console.error('Error generating signed URL:', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', 'Greška pri generisanju video linka');
  }
});
