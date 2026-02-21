import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { defineString } from 'firebase-functions/params';

// Define environment parameters for Cloudflare R2
const cloudflareAccountId = defineString('CLOUDFLARE_ACCOUNT_ID');
const cloudflareAccessKeyId = defineString('CLOUDFLARE_R2_ACCESS_KEY_ID');
const cloudflareSecretAccessKey = defineString('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
const cloudflareBucketName = defineString('CLOUDFLARE_R2_BUCKET_NAME');

// Create R2 client (lazy initialization)
const createR2Client = () => {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${cloudflareAccountId.value()}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cloudflareAccessKeyId.value(),
      secretAccessKey: cloudflareSecretAccessKey.value(),
    },
  });
};

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
    console.log('Lesson data fields:', Object.keys(lesson), 'videoPath:', lesson.videoPath);

    // Support both field names: courseId (camelCase) and course_id (underscore)
    const lessonCourseId = lesson.courseId || lesson.course_id;

    // Check if this is a free preview lesson (first lesson of first module)
    let isFreePreview = false;
    if (lesson.moduleId && lessonCourseId) {
      const modulesQuery = db.collection('modules')
        .where('courseId', '==', lessonCourseId)
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

      if (!userCourses[lessonCourseId]) {
        throw new HttpsError(
          'permission-denied',
          'Nemate pristup ovom kursu. Molimo kupite kurs da biste pristupili lekcijama.'
        );
      }
    }

    // Generate signed URL with 1 hour expiration
    const s3Client = createR2Client();
    const command = new GetObjectCommand({
      Bucket: cloudflareBucketName.value(),
      Key: lesson.videoPath,
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
