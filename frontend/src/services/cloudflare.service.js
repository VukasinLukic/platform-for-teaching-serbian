/**
 * Cloudflare R2 Video Upload Service
 *
 * This service handles video uploads to Cloudflare R2 storage via Firebase Cloud Functions.
 * All uploads are processed through backend to keep credentials secure.
 */

import { httpsCallable } from 'firebase/functions';
import { functions as functionsInstance } from './firebase';

/**
 * Convert file to base64
 * @param {File} file - File to convert
 * @returns {Promise<string>} - Base64 encoded file
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data:video/mp4;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Upload video file to Cloudflare R2 using presigned URL (direct upload)
 *
 * @param {File} file - The video file to upload
 * @param {string} courseId - The course ID
 * @param {string} moduleId - The module ID
 * @param {function} onProgress - Progress callback (percent)
 * @returns {Promise<{url: string, path: string}>} - Public URL and storage path
 */
export const uploadVideoToR2 = async (file, courseId, moduleId, onProgress) => {
  console.log('🔵 [cloudflare.service] Starting video upload to Cloudflare R2...');
  console.log('🔵 [cloudflare.service] File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);

  try {
    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      throw new Error('Video fajl je prevelik (maksimalno 500MB)');
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Nepodržan format videa. Koristi MP4, WebM ili OGG.');
    }

    // Update progress - generating upload URL
    if (onProgress) {
      onProgress(10);
    }

    console.log('🔵 [cloudflare.service] Generating presigned upload URL...');

    // Call Cloud Function to get presigned URL
    const generateUploadUrlFunction = httpsCallable(functionsInstance, 'generateUploadUrl');
    const urlResult = await generateUploadUrlFunction({
      fileName: file.name,
      contentType: file.type,
      courseId,
      moduleId,
      fileSize: file.size,
    });

    const { uploadUrl, videoUrl, videoPath } = urlResult.data;

    // Update progress - uploading file
    if (onProgress) {
      onProgress(20);
    }

    console.log('🔵 [cloudflare.service] Uploading file directly to R2...');

    // Upload file directly to R2 using presigned URL with progress tracking
    const xhr = new XMLHttpRequest();

    const uploadPromise = new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          // Progress from 20% to 90%
          const percentComplete = 20 + Math.round((e.loaded / e.total) * 70);
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });

    await uploadPromise;

    console.log('✅ [cloudflare.service] Upload successful!');
    console.log('✅ [cloudflare.service] Video URL:', videoUrl);

    // Update progress - complete
    if (onProgress) {
      onProgress(100);
    }

    return {
      url: videoUrl,
      path: videoPath,
    };
  } catch (error) {
    console.error('❌ [cloudflare.service] Upload failed:', error);
    console.error('❌ [cloudflare.service] Error details:', error.message);

    // Extract error message from Firebase Functions error
    let errorMessage = error.message;
    if (error.code === 'functions/unauthenticated') {
      errorMessage = 'Morate biti ulogovani da biste upload-ovali video';
    } else if (error.code === 'functions/permission-denied') {
      errorMessage = 'Nemate dozvolu za upload videa';
    } else if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message;
    }

    throw new Error(`Грешка при upload-у видеа: ${errorMessage}`);
  }
};

/**
 * Delete video file from Cloudflare R2
 *
 * @param {string} filePath - The file path in R2
 * @returns {Promise<void>}
 */
export const deleteVideoFromR2 = async (filePath) => {
  console.log('🔵 [cloudflare.service] Deleting video from R2:', filePath);

  try {
    // Call Cloud Function
    const deleteVideoFromR2Function = httpsCallable(functionsInstance, 'deleteVideoFromR2');

    // Call Cloud Function
    await deleteVideoFromR2Function({ videoPath: filePath });

    console.log('✅ [cloudflare.service] Video deleted successfully');
  } catch (error) {
    console.error('❌ [cloudflare.service] Delete failed:', error);
    console.error('❌ [cloudflare.service] Error details:', error.message);
    // Don't throw error - deletion is not critical
  }
};
