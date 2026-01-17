/**
 * Firebase Cloud Function for uploading videos to Cloudflare R2
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { defineString } from 'firebase-functions/params';

// Define environment parameters for Cloudflare R2
const cloudflareAccountId = defineString('CLOUDFLARE_ACCOUNT_ID');
const cloudflareAccessKeyId = defineString('CLOUDFLARE_R2_ACCESS_KEY_ID');
const cloudflareSecretAccessKey = defineString('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
const cloudflareBucketName = defineString('CLOUDFLARE_R2_BUCKET_NAME');
const cloudflarePublicUrl = defineString('CLOUDFLARE_R2_PUBLIC_URL');

// Get Cloudflare config
const getCloudflareConfig = () => {
  return {
    accountId: cloudflareAccountId.value(),
    accessKeyId: cloudflareAccessKeyId.value(),
    secretAccessKey: cloudflareSecretAccessKey.value(),
    bucketName: cloudflareBucketName.value(),
    publicUrl: cloudflarePublicUrl.value(),
  };
};

// Initialize R2 client factory
const createR2Client = () => {
  const config = getCloudflareConfig();
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

/**
 * Generate presigned upload URL for direct upload to R2
 * This avoids the 32MB limit of Cloud Functions
 *
 * @param {Object} data - Request data
 * @param {string} data.fileName - Original file name
 * @param {string} data.contentType - MIME type
 * @param {string} data.courseId - Course ID
 * @param {string} data.moduleId - Module ID
 * @param {number} data.fileSize - File size in bytes
 * @returns {Object} - Presigned URL and video path
 */
export const generateUploadUrl = onCall(
  {
    cors: true,
  },
  async (request) => {
    try {
      console.log('🔵 [generateUploadUrl] Generating presigned URL...');

      // Verify authentication
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Korisnik nije autentifikovan');
      }

      const { fileName, contentType, courseId, moduleId, fileSize } = request.data;

      // Validate required fields
      if (!fileName || !courseId || !moduleId || !fileSize) {
        throw new HttpsError('invalid-argument', 'Nedostaju obavezna polja');
      }

      // ✅ Verify user is admin using custom claims (FAST!)
      if (!request.auth.token.role || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Samo admin može upload-ovati videe');
      }

      // Check file size (max 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB in bytes
      if (fileSize > maxSize) {
        throw new HttpsError('invalid-argument', 'Video fajl je prevelik (maksimalno 500MB)');
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!allowedTypes.includes(contentType)) {
        throw new HttpsError('invalid-argument', 'Nepodržan format videa. Koristi MP4, WebM ili OGG.');
      }

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const videoPath = `videos/${courseId}/${moduleId}/${timestamp}_${sanitizedFileName}`;

      console.log(`🔵 [generateUploadUrl] Video path: ${videoPath}`);

      // Get config and create R2 client
      const config = getCloudflareConfig();
      const r2Client = createR2Client();

      // Create presigned URL for upload (valid for 1 hour)
      const uploadCommand = new PutObjectCommand({
        Bucket: config.bucketName,
        Key: videoPath,
        ContentType: contentType,
        Metadata: {
          'uploaded-by': request.auth.uid,
          'course-id': courseId,
          'module-id': moduleId,
          'original-filename': fileName,
        },
      });

      const uploadUrl = await getSignedUrl(r2Client, uploadCommand, { expiresIn: 3600 });
      const videoUrl = `${config.publicUrl}/${videoPath}`;

      console.log(`✅ [generateUploadUrl] Presigned URL generated successfully`);

      return {
        success: true,
        uploadUrl,
        videoUrl,
        videoPath,
      };

    } catch (error) {
      console.error('❌ [generateUploadUrl] Failed:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', `Greška pri generisanju upload URL-a: ${error.message}`);
    }
  }
);

/**
 * Upload video to Cloudflare R2
 *
 * @param {Object} data - Request data
 * @param {string} data.videoFile - Base64 encoded video file
 * @param {string} data.fileName - Original file name
 * @param {string} data.contentType - MIME type
 * @param {string} data.courseId - Course ID
 * @param {string} data.moduleId - Module ID
 * @returns {Object} - Upload result with video URL
 */
export const uploadVideoToR2 = onCall(
  {
    cors: true,
    maxInstances: 3,
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async (request) => {
    try {
      console.log('🔵 [uploadVideoToR2] Starting video upload...');

      // Verify authentication
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Korisnik nije autentifikovan');
      }

      const { videoFile, fileName, contentType, courseId, moduleId } = request.data;

      // Validate required fields
      if (!videoFile || !fileName || !courseId || !moduleId) {
        throw new HttpsError('invalid-argument', 'Nedostaju obavezna polja');
      }

      // ✅ Verify user is admin using custom claims (FAST!)
      if (!request.auth.token.role || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Samo admin može upload-ovati videe');
      }

      const db = getFirestore();

      // Check file size (max 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB in bytes
      const fileBuffer = Buffer.from(videoFile, 'base64');

      if (fileBuffer.length > maxSize) {
        throw new HttpsError('invalid-argument', 'Video fajl je prevelik (maksimalno 500MB)');
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!allowedTypes.includes(contentType)) {
        throw new HttpsError('invalid-argument', 'Nepodržan format videa. Koristi MP4, WebM ili OGG.');
      }

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const videoPath = `videos/${courseId}/${moduleId}/${timestamp}_${sanitizedFileName}`;

      console.log(`🔵 [uploadVideoToR2] Uploading to: ${videoPath}`);
      console.log(`🔵 [uploadVideoToR2] File size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);

      // Get config and create R2 client
      const config = getCloudflareConfig();
      const r2Client = createR2Client();

      // Upload to R2
      const uploadCommand = new PutObjectCommand({
        Bucket: config.bucketName,
        Key: videoPath,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: {
          'uploaded-by': request.auth.uid,
          'course-id': courseId,
          'module-id': moduleId,
          'original-filename': fileName,
        },
      });

      await r2Client.send(uploadCommand);

      const videoUrl = `${config.publicUrl}/${videoPath}`;

      console.log(`✅ [uploadVideoToR2] Upload successful: ${videoUrl}`);

      return {
        success: true,
        videoUrl,
        videoPath,
        size: fileBuffer.length,
      };

    } catch (error) {
      console.error('❌ [uploadVideoToR2] Upload failed:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', `Greška pri upload-u videa: ${error.message}`);
    }
  }
);

/**
 * Delete video from Cloudflare R2
 *
 * @param {Object} data - Request data
 * @param {string} data.videoPath - Path to video in R2 bucket
 * @returns {Object} - Deletion result
 */
export const deleteVideoFromR2 = onCall(
  {
    cors: true,
  },
  async (request) => {
    try {
      console.log('🔵 [deleteVideoFromR2] Starting video deletion...');

      // Verify authentication
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Korisnik nije autentifikovan');
      }

      const { videoPath } = request.data;

      if (!videoPath) {
        throw new HttpsError('invalid-argument', 'videoPath je obavezan');
      }

      // ✅ Verify user is admin using custom claims (FAST!)
      if (!request.auth.token.role || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Samo admin može brisati videe');
      }

      const db = getFirestore();

      console.log(`🔵 [deleteVideoFromR2] Deleting: ${videoPath}`);

      // Get config and create R2 client
      const config = getCloudflareConfig();
      const r2Client = createR2Client();

      // Delete from R2
      const deleteCommand = new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: videoPath,
      });

      await r2Client.send(deleteCommand);

      console.log(`✅ [deleteVideoFromR2] Deletion successful: ${videoPath}`);

      return {
        success: true,
        message: 'Video uspešno obrisan',
      };

    } catch (error) {
      console.error('❌ [deleteVideoFromR2] Deletion failed:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', `Greška pri brisanju videa: ${error.message}`);
    }
  }
);
