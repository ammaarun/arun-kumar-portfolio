/**
 * mediaSelection.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Integration tests for the Neon media selection flow:
 *   Media Library → onSelectMedia → neon::<mediaId> stored in content
 *   → GET /api/portfolio/media/:mediaId → 302 presigned redirect
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

// ── Mock storageService BEFORE any route imports ──────────────────────────────
vi.mock('../utils/storageService.js', () => {
  let _keyCounter = 0;
  return {
    BUCKET: 'portfolio-assets',
    ALLOWED_TYPES: { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' },
    MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
    generateObjectKey: vi.fn(
      (clientId, category) => `clients/${clientId}/${category}/uuid-sel-${++_keyCounter}.jpg`
    ),
    validateFile: vi.fn((mime) => {
      const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
      if (!ok.includes(mime)) return { valid: false, error: `File type "${mime}" is not allowed.` };
      return { valid: true };
    }),
    uploadToStorage: vi.fn(async (_buf, objectKey) => ({ objectKey })),
    deleteFromStorage: vi.fn(async () => {}),
    getPresignedGetUrl: vi.fn(
      async (objectKey, expiresIn) =>
        `https://storage.neon.example/presigned?key=${encodeURIComponent(objectKey)}&expires=${expiresIn}`
    ),
  };
});

import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import portfolioRoutes from '../routes/portfolioRoutes.js';

// ── Minimal test Express app ──────────────────────────────────────────────────
const createApp = () => {
  const a = express();
  a.use(express.json());
  a.use('/api/auth', authRoutes);
  a.use('/api/admin', adminRoutes);
  a.use('/api/portfolio', portfolioRoutes);
  return a;
};

const app = createApp();
let authToken = '';

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin123' });
  authToken = res.body.token;
  expect(authToken, 'Auth token must be present').toBeTruthy();
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const uploadNeonAsset = async (name = 'Test Asset', category = 'projects') => {
  const res = await request(app)
    .post('/api/admin/media/upload')
    .set('Authorization', `Bearer ${authToken}`)
    .attach('file', Buffer.from('fake-jpeg'), { filename: 'test.jpg', contentType: 'image/jpeg' })
    .field('name', name)
    .field('category', category);
  expect(res.status, `upload failed: ${JSON.stringify(res.body)}`).toBe(200);
  return res.body.data;
};

const saveProfileImage = async (imageValue) => {
  const profileRes = await request(app).get('/api/portfolio');
  const existing = profileRes.body.data?.personalInfo || {};
  return request(app)
    .put('/api/admin/profile')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ ...existing, image: imageValue });
};

const saveProject = async (imageValue) => {
  return request(app)
    .post('/api/admin/projects')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      title: 'Test Project Sel',
      description: 'desc',
      category: 'Full Stack',
      image: imageValue,
      github: 'https://github.com',
      live: 'https://example.com',
      tech: ['React'],
      featured: false,
    });
};

const saveBlog = async (imageValue) => {
  return request(app)
    .post('/api/admin/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      title: `Blog Sel ${Date.now()}`,
      slug: `blog-sel-${Date.now()}`,
      excerpt: 'short',
      content: 'full content',
      tags: ['test'],
      coverImage: imageValue,
      status: 'Published',
    });
};

// ─────────────────────────────────────────────────────────────────────────────
describe('Neon Media Selection — End-to-End Flow Tests', () => {

  // 1. Media record shape has id, objectKey, storageBackend
  it('1. Neon asset record has id, objectKey, storageBackend="neon"', async () => {
    const asset = await uploadNeonAsset('Shape Test');
    expect(asset).toHaveProperty('id');
    expect(asset.id).toMatch(/^media-/);
    expect(asset).toHaveProperty('objectKey');
    expect(asset.objectKey).toContain('clients/');
    expect(asset).toHaveProperty('storageBackend', 'neon');
  });

  // 2. Neon selection → saves "neon::<mediaId>"
  it('2. Profile save stores "neon::<mediaId>" for Neon asset', async () => {
    const asset = await uploadNeonAsset('Profile Neon');
    const ref = `neon::${asset.id}`;

    const saveRes = await saveProfileImage(ref);
    expect(saveRes.status).toBe(200);

    const portfolioRes = await request(app).get('/api/portfolio');
    expect(portfolioRes.body.data.personalInfo.image).toBe(ref);
  });

  // 3. URL-paste continues to store plain URL
  it('3. Profile save stores plain URL for URL-paste selection', async () => {
    const plainUrl = 'https://images.unsplash.com/photo-url-paste-test';
    const saveRes = await saveProfileImage(plainUrl);
    expect(saveRes.status).toBe(200);

    const portfolioRes = await request(app).get('/api/portfolio');
    expect(portfolioRes.body.data.personalInfo.image).toBe(plainUrl);
    expect(portfolioRes.body.data.personalInfo.image).not.toMatch(/^neon::/);
  });

  // 4. Public endpoint: valid PUBLISHED portfolio Neon media → 302
  it('4. GET /api/portfolio/media/:mediaId returns 302 for valid Neon asset', async () => {
    const { getPresignedGetUrl } = await import('../utils/storageService.js');
    getPresignedGetUrl.mockClear();
    const asset = await uploadNeonAsset('Public 302 Test', 'profile');

    const res = await request(app)
      .get(`/api/portfolio/media/${asset.id}`)
      .redirects(0);

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('presigned');
    expect(res.headers.location).toContain(encodeURIComponent(asset.objectKey));
    expect(getPresignedGetUrl).toHaveBeenCalledWith(asset.objectKey, 60);
  });

  // 5. Nonexistent mediaId → 404
  it('5. GET /api/portfolio/media/nonexistent returns 404', async () => {
    const res = await request(app).get('/api/portfolio/media/nonexistent-xyz-9999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // 7. Raw objectKey (not mediaId) cannot be resolved → 404
  it('7. Raw objectKey as :mediaId is not resolvable — returns 404', async () => {
    const rawObjectKey = 'clients/client-1/profile/some-uuid.png';
    const res = await request(app)
      .get(`/api/portfolio/media/${encodeURIComponent(rawObjectKey)}`);
    expect(res.status).toBe(404);
  });

  // 8. URL-paste (non-Neon) media record via public endpoint → 400
  it('8. URL-paste media record via public endpoint returns 400', async () => {
    const urlRes = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'URL Paste Asset Sel',
        url: 'https://example.com/img.jpg',
        type: 'image',
        category: 'other',
      });
    expect(urlRes.status).toBe(200);
    const urlAsset = urlRes.body.data;

    const res = await request(app)
      .get(`/api/portfolio/media/${urlAsset.id}`);
    expect(res.status).toBe(400);
  });

  // 9. Public endpoint derives ownership from record (no client param)
  it('9. Public endpoint ownership is record-derived — no client-supplied context needed', async () => {
    const asset = await uploadNeonAsset('Ownership Test', 'other');

    const res = await request(app)
      .get(`/api/portfolio/media/${asset.id}`)
      .redirects(0);

    expect(res.status).toBe(302);
    // No storage credentials in response headers
    expect(res.headers['authorization']).toBeUndefined();
    expect(res.headers['x-amz-security-token']).toBeUndefined();
  });

  // 10. Deleted media → 404 cleanly
  it('10. Deleted media returns 404 from public endpoint, does not crash', async () => {
    const asset = await uploadNeonAsset('Delete Then Public');
    await request(app)
      .delete(`/api/admin/media/${asset.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    const res = await request(app).get(`/api/portfolio/media/${asset.id}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toBeTruthy();
  });

  // 11. Profile image: neon:: round-trips through API
  it('11. personalInfo.image neon:: ref round-trips through portfolio API', async () => {
    const asset = await uploadNeonAsset('Hero Neon Image');
    const ref = `neon::${asset.id}`;
    await saveProfileImage(ref);

    const portfolioRes = await request(app).get('/api/portfolio');
    expect(portfolioRes.body.data.personalInfo.image).toBe(ref);
    expect(portfolioRes.body.data.personalInfo.image).toMatch(/^neon::/);
  });

  // 12. Project image: neon:: round-trips
  it('12. project.image neon:: ref round-trips through portfolio API', async () => {
    const asset = await uploadNeonAsset('Project Neon Cover', 'projects');
    const ref = `neon::${asset.id}`;
    const res = await saveProject(ref);
    expect(res.status).toBe(200);

    const portfolioRes = await request(app).get('/api/portfolio');
    const projects = portfolioRes.body.data.projects || [];
    const saved = projects.find(p => p.image === ref);
    expect(saved).toBeDefined();
    expect(saved.image).toBe(ref);
  });

  // 13. Blog coverImage: neon:: round-trips
  it('13. blog.coverImage neon:: ref round-trips through portfolio API', async () => {
    const asset = await uploadNeonAsset('Blog Neon Cover', 'blogs');
    const ref = `neon::${asset.id}`;
    const res = await saveBlog(ref);
    expect(res.status).toBe(200);

    const portfolioRes = await request(app).get('/api/portfolio');
    const blogs = portfolioRes.body.data.blogs || [];
    const saved = blogs.find(b => b.coverImage === ref);
    expect(saved).toBeDefined();
    expect(saved.coverImage).toBe(ref);
  });

  // Backward compat: plain URL project image still round-trips unchanged
  it('BC. Plain-URL project image round-trips without neon:: prefix', async () => {
    const plainUrl = 'https://images.unsplash.com/photo-bc-test?auto=format';
    const res = await saveProject(plainUrl);
    expect(res.status).toBe(200);

    const portfolioRes = await request(app).get('/api/portfolio');
    const projects = portfolioRes.body.data.projects || [];
    const saved = projects.find(p => p.image === plainUrl);
    expect(saved).toBeDefined();
    expect(saved.image).toBe(plainUrl);
    expect(saved.image).not.toMatch(/^neon::/);
  });
});
