/**
 * mediaStorage.test.js
 * Tests for the Neon Object Storage Media Library integration.
 *
 * Strategy: mock the storageService module so tests run without real S3 credentials.
 * The route logic (auth, validation, metadata) is tested against a real Express app.
 */

import { describe, it, expect, beforeAll, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// ── Mock storageService before any route import ───────────────────────────────
vi.mock('../utils/storageService.js', () => ({
  generateObjectKey: vi.fn(
    (clientId, category, mime) => `clients/${clientId}/${category}/test-uuid.jpg`
  ),
  uploadToStorage: vi.fn(async () => ({ objectKey: 'clients/client-1/projects/test-uuid.jpg' })),
  deleteFromStorage: vi.fn(async () => {}),
  getPresignedGetUrl: vi.fn(async () => 'https://storage.neon.tech/presigned-test-url'),
  validateFile: vi.fn((mime, size) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(mime)) return { valid: false, error: `File type "${mime}" is not allowed.` };
    if (size > 10 * 1024 * 1024) return { valid: false, error: 'File too large.' };
    return { valid: true };
  }),
  ALLOWED_TYPES: {
    'image/jpeg': 'jpg', 'image/png': 'png',
    'image/webp': 'webp', 'image/gif': 'gif', 'application/pdf': 'pdf',
  },
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
}));

import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';

// ── Test app setup ────────────────────────────────────────────────────────────
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  return app;
};

const app = createApp();
let authToken = '';

// Obtain auth token once before all tests
beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin123' });
  authToken = res.body.token;
  expect(authToken).toBeTruthy();
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeJpegBuffer = () => Buffer.from('fake-jpeg-data');
const makePdfBuffer  = () => Buffer.from('%PDF-1.4 fake-pdf-content');

// ── Test Suite ────────────────────────────────────────────────────────────────
describe('Neon Object Storage — Media Library Integration Tests', () => {

  // 1. Unauthenticated upload must fail
  it('1. POST /api/admin/media/upload — should return 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/admin/media/upload')
      .attach('file', makeJpegBuffer(), { filename: 'test.jpg', contentType: 'image/jpeg' })
      .field('name', 'Test Image');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 2. Authenticated upload of a valid JPEG should succeed
  it('2. POST /api/admin/media/upload — authenticated upload of JPEG should succeed', async () => {
    const { uploadToStorage, generateObjectKey } = await import('../utils/storageService.js');

    const res = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', makeJpegBuffer(), { filename: 'profile.jpg', contentType: 'image/jpeg' })
      .field('name', 'My Profile Photo')
      .field('category', 'profile');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: 'My Profile Photo',
      category: 'profile',
      type: 'image',
      storageBackend: 'neon',
    });
    expect(res.body.data.objectKey).toBeTruthy();
    expect(generateObjectKey).toHaveBeenCalled();
    expect(uploadToStorage).toHaveBeenCalled();
  });

  // 3. Upload without a name should fail with 400
  it('3. POST /api/admin/media/upload — should return 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', makeJpegBuffer(), { filename: 'photo.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/name/i);
  });

  // 4. Upload with no file should fail with 400
  it('4. POST /api/admin/media/upload — should return 400 when no file is provided', async () => {
    const res = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .field('name', 'Missing File Test')
      .field('category', 'projects');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no file/i);
  });

  // 5. Invalid MIME type must be rejected
  it('5. POST /api/admin/media/upload — should reject disallowed MIME type (text/plain)', async () => {
    const res = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('hello world'), { filename: 'notes.txt', contentType: 'text/plain' })
      .field('name', 'Text File');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not allowed/i);
  });

  // 6. PDF upload should succeed and be classified as 'document'
  it('6. POST /api/admin/media/upload — PDF upload should be classified as document type', async () => {
    const res = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', makePdfBuffer(), { filename: 'resume.pdf', contentType: 'application/pdf' })
      .field('name', 'My Resume 2026')
      .field('category', 'resume');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('document');
    expect(res.body.data.category).toBe('resume');
    expect(res.body.data.storageBackend).toBe('neon');
  });

  // 7. Uploaded metadata should be persisted and readable via GET /media
  it('7. GET /api/admin/media — uploaded Neon asset should appear in media list', async () => {
    // First upload
    await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', makeJpegBuffer(), { filename: 'project-thumb.jpg', contentType: 'image/jpeg' })
      .field('name', 'Project Thumbnail Test')
      .field('category', 'projects');

    // Then fetch list
    const listRes = await request(app)
      .get('/api/admin/media')
      .set('Authorization', `Bearer ${authToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    const found = listRes.body.data.find(m => m.name === 'Project Thumbnail Test');
    expect(found).toBeDefined();
    expect(found.storageBackend).toBe('neon');
    expect(found.objectKey).toBeTruthy();
  });

  // 8. GET /media/serve without auth should fail
  it('8. GET /api/admin/media/serve/:key — should return 401 without auth', async () => {
    const res = await request(app)
      .get('/api/admin/media/serve/clients%2Fclient-1%2Fprojects%2Ftest.jpg');
    expect(res.status).toBe(401);
  });

  // 9. GET /media/serve for a non-existent objectKey should return 404
  it('9. GET /api/admin/media/serve/:key — should return 404 for unknown objectKey', async () => {
    const res = await request(app)
      .get('/api/admin/media/serve/clients%2Fclient-1%2Funknown-key.jpg')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // 10. Authenticated serve of a known objectKey should generate presigned URL
  it('10. GET /api/admin/media/serve/:key — known key should redirect to presigned URL', async () => {
    // Upload first to get a known objectKey
    const uploadRes = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', makeJpegBuffer(), { filename: 'serve-test.jpg', contentType: 'image/jpeg' })
      .field('name', 'Serve Test Asset')
      .field('category', 'profile');

    expect(uploadRes.status).toBe(200);
    const { objectKey } = uploadRes.body.data;

    const serveRes = await request(app)
      .get(`/api/admin/media/serve/${encodeURIComponent(objectKey)}`)
      .set('Authorization', `Bearer ${authToken}`)
      .redirects(0); // don't follow the redirect

    expect(serveRes.status).toBe(302);
    expect(serveRes.headers.location).toContain('presigned-test-url');
  });

  // 11. URL-paste mode (POST /media) still works
  it('11. POST /api/admin/media — URL-paste mode should still work (backward compat)', async () => {
    const res = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Unsplash Photo',
        url: 'https://images.unsplash.com/photo-test',
        type: 'image',
        category: 'projects',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.storageBackend).toBe('url');
    expect(res.body.data.url).toBe('https://images.unsplash.com/photo-test');
  });

  // 12. URL-paste without auth must fail
  it('12. POST /api/admin/media — should return 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/admin/media')
      .send({ name: 'Hacker Image', url: 'https://evil.com/img.jpg' });
    expect(res.status).toBe(401);
  });

  // 13. DELETE a Neon asset should call deleteFromStorage
  it('13. DELETE /api/admin/media/:id — Neon asset should trigger S3 deletion', async () => {
    const { deleteFromStorage } = await import('../utils/storageService.js');
    deleteFromStorage.mockClear();

    // Upload a Neon asset
    const uploadRes = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', makeJpegBuffer(), { filename: 'delete-me.jpg', contentType: 'image/jpeg' })
      .field('name', 'Delete Test Asset')
      .field('category', 'other');

    expect(uploadRes.status).toBe(200);
    const { id } = uploadRes.body.data;

    const deleteRes = await request(app)
      .delete(`/api/admin/media/${id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteFromStorage).toHaveBeenCalledOnce();
  });

  // 14. DELETE a URL-paste asset should NOT call deleteFromStorage
  it('14. DELETE /api/admin/media/:id — URL asset should NOT trigger S3 deletion', async () => {
    const { deleteFromStorage } = await import('../utils/storageService.js');
    deleteFromStorage.mockClear();

    const createRes = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'URL Delete Test', url: 'https://example.com/img.jpg', type: 'image', category: 'other' });

    const { id } = createRes.body.data;

    const deleteRes = await request(app)
      .delete(`/api/admin/media/${id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    // deleteFromStorage should NOT have been called for a URL-paste asset
    expect(deleteFromStorage).not.toHaveBeenCalled();
  });

  // 15. DELETE without auth must fail
  it('15. DELETE /api/admin/media/:id — should return 401 without auth token', async () => {
    const res = await request(app).delete('/api/admin/media/media-999');
    expect(res.status).toBe(401);
  });

  // 16. GET /api/admin/media — unauthenticated must fail
  it('16. GET /api/admin/media — should return 401 without auth', async () => {
    const res = await request(app).get('/api/admin/media');
    expect(res.status).toBe(401);
  });

  // 17. objectKey and storageBackend must not be overridable via PUT
  it('17. PUT /api/admin/media/:id — should not allow client to overwrite objectKey', async () => {
    // Upload a Neon asset
    const uploadRes = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', makeJpegBuffer(), { filename: 'protect-me.jpg', contentType: 'image/jpeg' })
      .field('name', 'Protect Key Test')
      .field('category', 'profile');

    const { id, objectKey } = uploadRes.body.data;

    // Attempt to overwrite objectKey via PUT
    const putRes = await request(app)
      .put(`/api/admin/media/${id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Name', objectKey: 'clients/evil/path/hack.jpg', storageBackend: 'url' });

    expect(putRes.status).toBe(200);
    expect(putRes.body.data.objectKey).toBe(objectKey);        // unchanged
    expect(putRes.body.data.storageBackend).toBe('neon');      // unchanged
    expect(putRes.body.data.name).toBe('Updated Name');        // name was updated
  });

});
