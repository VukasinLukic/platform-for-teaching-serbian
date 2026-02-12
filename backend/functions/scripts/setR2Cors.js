/**
 * Script to set CORS configuration on Cloudflare R2 bucket
 * Run: node scripts/setR2Cors.js
 */

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const corsConfig = {
  Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedOrigins: [
          'http://localhost:3000',
          'http://localhost:5173',
          'https://naucisprski.web.app',
          'https://naucisprski.firebaseapp.com',
          'https://srpskiusrcu.com',
          'https://www.srpskiusrcu.com',
          'https://srpskiusrcu.rs',
          'https://www.srpskiusrcu.rs',
        ],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedHeaders: ['*'],
        ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
        MaxAgeSeconds: 3600,
      },
    ],
  },
};

try {
  const result = await client.send(new PutBucketCorsCommand(corsConfig));
  console.log('CORS configuration set successfully:', result.$metadata.httpStatusCode);
} catch (error) {
  console.error('Error setting CORS:', error.message);
  process.exit(1);
}
