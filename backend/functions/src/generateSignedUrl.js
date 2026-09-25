import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { defineString } from 'firebase-functions/params';
import { loadLessonWithAccessCheck, getMaterialStoragePath } from './lessonAccess.js';

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
export const getVideoUrl = onCall(async (request) => {
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
    const db = getFirestore();
    const { lesson } = await loadLessonWithAccessCheck(db, lessonId, userId);

    if (!lesson.videoPath) {
      throw new HttpsError('not-found', 'Lekcija nema video');
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

/**
 * Cloud Function to generate a short-lived download URL for a lesson material.
 * Materials are never exposed as public links in Firestore; access is checked here.
 */
export const getMaterialUrl = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Morate biti ulogovani');
  }

  const { lessonId, index } = request.data || {};

  if (!lessonId || !Number.isInteger(index) || index < 0) {
    throw new HttpsError('invalid-argument', 'lessonId i index su obavezni');
  }

  try {
    const db = getFirestore();
    const { lesson } = await loadLessonWithAccessCheck(db, lessonId, request.auth.uid);

    const material = (lesson.materials || [])[index];
    const path = getMaterialStoragePath(material);

    if (!path || !path.startsWith('course-materials/')) {
      throw new HttpsError('not-found', 'Materijal ne postoji');
    }

    const [url] = await getStorage().bucket().file(path).getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      responseDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(material.name || 'materijal')}`,
    });

    return { url, name: material.name || 'materijal' };
  } catch (error) {
    console.error('Error generating material URL:', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', 'Greška pri preuzimanju materijala');
  }
});
