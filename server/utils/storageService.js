/**
 * storageService.js
 * Server-side Neon Object Storage (S3-compatible) helper.
 * Credentials are read from environment variables — never exposed to the browser.
 *
 * Bucket: portfolio-assets
 * Object key structure: clients/{clientId}/{category}/{uuid}.{ext}
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import path from 'path';

// ── S3 Client (lazy singleton) ────────────────────────────────────────────────

let _s3Client = null;

function getS3Client() {
  if (_s3Client) return _s3Client;

  const endpoint  = process.env.AWS_ENDPOINT_URL_S3;
  const region    = process.env.AWS_REGION || 'ap-southeast-1';
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error(
      'Neon Object Storage credentials are not configured. ' +
      'Set AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.'
    );
  }

  _s3Client = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    forcePathStyle: true, // required for Neon S3-compatible storage
  });

  return _s3Client;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const BUCKET = process.env.NEON_STORAGE_BUCKET || 'portfolio-assets';

// Allowed MIME types and their canonical file extensions
export const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'application/pdf': 'pdf',
};

// 10 MB upload limit
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Allowed category values (must match the frontend categoriesList)
const ALLOWED_CATEGORIES = new Set([
  'profile', 'projects', 'blogs', 'certificates', 'resume', 'other',
]);

// ── Object Key Generation ─────────────────────────────────────────────────────

/**
 * Generate a safe, unique S3 object key.
 * Never use client-supplied filenames directly as the key.
 *
 * @param {string} clientId  - Internal portfolio/client ID (e.g. "client-1")
 * @param {string} category  - Asset category (e.g. "profile")
 * @param {string} mimeType  - Validated MIME type
 * @returns {string}
 */
export function generateObjectKey(clientId, category, mimeType) {
  const safeClientId = String(clientId).replace(/[^a-z0-9_-]/gi, '-').slice(0, 64);
  const safeCategory = ALLOWED_CATEGORIES.has(category) ? category : 'other';
  const ext = ALLOWED_TYPES[mimeType] || 'bin';
  const uuid = randomUUID();
  return `clients/${safeClientId}/${safeCategory}/${uuid}.${ext}`;
}

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Validate an uploaded file buffer.
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(mimeType, sizeBytes) {
  if (!ALLOWED_TYPES[mimeType]) {
    return {
      valid: false,
      error: `File type "${mimeType}" is not allowed. Allowed types: JPEG, PNG, WebP, GIF, PDF.`,
    };
  }
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size ${Math.round(sizeBytes / 1024)} KB exceeds the 10 MB limit.`,
    };
  }
  return { valid: true };
}

// ── Upload ────────────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Neon Object Storage.
 *
 * @param {Buffer} buffer      - File content
 * @param {string} objectKey   - Storage key (from generateObjectKey)
 * @param {string} mimeType    - Content-Type
 * @returns {Promise<{ objectKey: string }>}
 */
export async function uploadToStorage(buffer, objectKey, mimeType) {
  const s3 = getS3Client();
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
    Body: buffer,
    ContentType: mimeType,
    // Private by default — no ACL set
  }));
  return { objectKey };
}

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * Delete an object from Neon Object Storage.
 * Silently succeeds if the object does not exist (idempotent).
 *
 * @param {string} objectKey
 */
export async function deleteFromStorage(objectKey) {
  if (!objectKey) return;
  const s3 = getS3Client();
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: objectKey }));
}

// ── Presigned URL (admin preview / serve) ────────────────────────────────────

/**
 * Generate a presigned GET URL for private admin access.
 * Expires in 1 hour by default.
 *
 * @param {string} objectKey
 * @param {number} [expiresInSeconds=3600]
 * @returns {Promise<string>} presigned URL
 */
export async function getPresignedGetUrl(objectKey, expiresInSeconds = 3600) {
  const s3 = getS3Client();
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: objectKey });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
