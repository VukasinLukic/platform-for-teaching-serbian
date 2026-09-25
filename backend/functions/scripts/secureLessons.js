/**
 * One-time migration: removes public links from lesson documents.
 *
 * For every document in `lessons`:
 *  - deletes `videoUrl` (videos are served only through getVideoUrl signed links)
 *  - replaces each material's `url` (Firebase download link with token) with `path`
 *  - rotates the download token of every material file, so links that already leaked stop working
 *
 * Run from backend/functions with application default credentials:
 *   gcloud auth application-default login
 *   node scripts/secureLessons.js            # dry run, prints what would change
 *   node scripts/secureLessons.js --apply    # writes the changes
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { randomUUID } from 'crypto';
import { getMaterialStoragePath } from '../src/lessonAccess.js';

const PROJECT_ID = 'naucisprski';
const BUCKET = 'naucisprski.firebasestorage.app';
const apply = process.argv.includes('--apply');

initializeApp({ projectId: PROJECT_ID, storageBucket: BUCKET });

const db = getFirestore();
const bucket = getStorage().bucket();

async function run() {
  const snapshot = await db.collection('lessons').get();
  let changedLessons = 0;
  let rotatedFiles = 0;

  for (const lessonDoc of snapshot.docs) {
    const lesson = lessonDoc.data();
    const update = {};

    if ('videoUrl' in lesson) {
      update.videoUrl = FieldValue.delete();
    }

    const materials = Array.isArray(lesson.materials) ? lesson.materials : [];
    let materialsChanged = false;
    const cleanedMaterials = [];

    for (const material of materials) {
      const path = getMaterialStoragePath(material);
      const { url, ...rest } = material;
      if (url !== undefined) materialsChanged = true;
      cleanedMaterials.push(path ? { ...rest, path } : rest);

      if (path) {
        console.log(`  rotate token: ${path}`);
        if (apply) {
          try {
            await bucket.file(path).setMetadata({
              metadata: { firebaseStorageDownloadTokens: randomUUID() },
            });
            rotatedFiles++;
          } catch (error) {
            console.error(`  ! could not rotate token for ${path}: ${error.message}`);
          }
        }
      }
    }

    if (materialsChanged) {
      update.materials = cleanedMaterials;
    }

    if (Object.keys(update).length > 0) {
      changedLessons++;
      console.log(`${apply ? 'UPDATE' : 'WOULD UPDATE'} lessons/${lessonDoc.id}: ${Object.keys(update).join(', ')}`);
      if (apply) {
        await lessonDoc.ref.update(update);
      }
    }
  }

  console.log(`\n${apply ? 'Updated' : 'Would update'} ${changedLessons} of ${snapshot.size} lessons.`);
  if (apply) console.log(`Rotated tokens for ${rotatedFiles} material files.`);
  if (!apply) console.log('Dry run only. Re-run with --apply to write changes.');
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
