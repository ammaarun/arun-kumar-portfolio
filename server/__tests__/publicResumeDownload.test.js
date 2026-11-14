import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import portfolioRoutes from '../routes/portfolioRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import { dbEngine } from '../data/dbEngine.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

// Mock storageService presigned URL generator
vi.mock('../utils/storageService.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getPresignedGetUrl: vi.fn(async (objectKey, expiresIn, options = {}) => {
      const filename = options?.downloadFilename ? `&filename=${encodeURIComponent(options.downloadFilename)}` : '';
      return `https://neon-storage.example.com/download?key=${encodeURIComponent(objectKey)}${filename}`;
    })
  };
});

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/portfolio', portfolioRoutes);
  app.use('/api/admin', adminRoutes);
  return app;
};

const app = createTestApp();
let authToken = '';
let backupDb = null;

describe('Public Portfolio Resume Direct Download API Tests', () => {
  beforeAll(async () => {
    backupDb = JSON.parse(JSON.stringify(dbEngine.get()));

    // Generate auth token for admin operations
    authToken = jwt.sign({ username: 'admin', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(() => {
    if (backupDb) {
      dbEngine.save(backupDb);
    }
  });

  it('1. GET /api/portfolio/resume/download — downloads URL-based active resume with 302 and Content-Disposition', async () => {
    const db = dbEngine.get();
    db.resumes = [
      {
        id: 'res-url-1',
        name: 'Arun-Kumar-Direct-CV.pdf',
        url: 'https://example.com/files/arun-direct.pdf',
        isActive: true
      }
    ];
    if (!db.personalInfo) db.personalInfo = {};
    db.personalInfo.resumeUrl = 'https://example.com/files/arun-direct.pdf';
    dbEngine.save(db);

    const res = await request(app).get('/api/portfolio/resume/download');

    expect(res.status).toBe(302);
    expect(res.headers['content-disposition']).toMatch(/attachment;\s*filename="Arun-Kumar-Direct-CV\.pdf"/i);
    expect(res.headers.location).toBe('https://example.com/files/arun-direct.pdf');
  });

  it('2. GET /api/portfolio/resume/download — downloads Neon-stored active resume with fresh presigned URL', async () => {
    const db = dbEngine.get();
    const mediaId = 'media-resume-neon-123';
    const mediaRecord = {
      id: mediaId,
      name: 'Official-Arun-Resume-2026.pdf',
      objectKey: 'clients/client-1/resume/uuid-resume-2026.pdf',
      storageBackend: 'neon',
      mimeType: 'application/pdf'
    };

    db.mediaLibrary = db.mediaLibrary || [];
    db.mediaLibrary.unshift(mediaRecord);

    db.resumes = [
      {
        id: 'res-neon-1',
        name: 'Official-Arun-Resume-2026.pdf',
        url: `neon::${mediaId}`,
        isActive: true
      }
    ];
    db.personalInfo.resumeUrl = `neon::${mediaId}`;
    dbEngine.save(db);

    const res = await request(app).get('/api/portfolio/resume/download');

    expect(res.status).toBe(302);
    expect(res.headers['content-disposition']).toMatch(/attachment;\s*filename="Official-Arun-Resume-2026\.pdf"/i);
    expect(res.headers.location).toContain('https://neon-storage.example.com/download');
    expect(res.headers.location).toContain(encodeURIComponent('clients/client-1/resume/uuid-resume-2026.pdf'));
  });

  it('3. GET /api/portfolio/resume/download — downloads currently active version when multiple versions exist', async () => {
    const db = dbEngine.get();
    db.resumes = [
      {
        id: 'res-old',
        name: 'Older-Resume.pdf',
        url: 'https://example.com/old-resume.pdf',
        isActive: false
      },
      {
        id: 'res-active',
        name: 'Active-Principal-Resume.pdf',
        url: 'https://example.com/active-principal.pdf',
        isActive: true
      }
    ];
    db.personalInfo.resumeUrl = 'https://example.com/active-principal.pdf';
    dbEngine.save(db);

    const res = await request(app).get('/api/portfolio/resume/download');

    expect(res.status).toBe(302);
    expect(res.headers['content-disposition']).toMatch(/attachment;\s*filename="Active-Principal-Resume\.pdf"/i);
    expect(res.headers.location).toBe('https://example.com/active-principal.pdf');
  });

  it('4. GET /api/portfolio/resume/download/:slug — downloads client-specific resume respecting client isolation', async () => {
    const db = dbEngine.get();
    
    // Configure client-2 with a custom resume
    let client2 = (db.clients || []).find(c => c.id === 'client-test-custom' || c.slug === 'client-test-custom');
    if (!client2) {
      client2 = {
        id: 'client-test-custom',
        slug: 'priya-architect',
        name: 'Priya Reddy',
        status: 'PUBLISHED',
        portfolioData: {
          personalInfo: {
            name: 'Priya Reddy',
            resumeUrl: 'https://example.com/priya-architect-resume.pdf'
          },
          resumes: [
            {
              id: 'res-priya-1',
              name: 'Priya-Reddy-Cloud-Architect.pdf',
              url: 'https://example.com/priya-architect-resume.pdf',
              isActive: true
            }
          ]
        }
      };
      db.clients.push(client2);
    }
    dbEngine.save(db);

    const res = await request(app).get('/api/portfolio/resume/download/priya-architect');

    expect(res.status).toBe(302);
    expect(res.headers['content-disposition']).toMatch(/attachment;\s*filename="Priya-Reddy-Cloud-Architect\.pdf"/i);
    expect(res.headers.location).toBe('https://example.com/priya-architect-resume.pdf');
  });

  it('5. GET /api/portfolio/resume/download — returns 404 gracefully when no resume is uploaded', async () => {
    const db = dbEngine.get();
    db.resumes = [];
    if (db.personalInfo) {
      db.personalInfo.resumeUrl = '#';
    }
    dbEngine.save(db);

    const res = await request(app).get('/api/portfolio/resume/download');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no active resume found/i);
  });

  it('6. GET /api/portfolio/resume/download/:slug — returns 403 if target portfolio is in DRAFT status', async () => {
    const db = dbEngine.get();
    const draftClient = {
      id: 'client-draft-only',
      slug: 'draft-developer',
      name: 'Draft User',
      status: 'DRAFT',
      portfolioData: {
        personalInfo: {
          resumeUrl: 'https://example.com/draft-resume.pdf'
        },
        resumes: [
          {
            id: 'res-draft',
            name: 'Draft-Resume.pdf',
            url: 'https://example.com/draft-resume.pdf',
            isActive: true
          }
        ]
      }
    };
    db.clients.push(draftClient);
    dbEngine.save(db);

    const res = await request(app).get('/api/portfolio/resume/download/draft-developer');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not publicly available/i);
  });

  it('7. Admin Resume CRUD operations continue working normally', async () => {
    // Test uploading new resume in admin
    const newResume = {
      name: 'Admin-Uploaded-Resume.pdf',
      url: 'https://example.com/admin-resume.pdf',
      sizeKb: 380
    };

    const postRes = await request(app)
      .post('/api/admin/resumes')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newResume);

    expect(postRes.status).toBe(200);
    expect(postRes.body.success).toBe(true);
    expect(postRes.body.data.name).toBe('Admin-Uploaded-Resume.pdf');

    // Test that the newly activated admin resume is immediately the active public download
    const publicDownloadRes = await request(app).get('/api/portfolio/resume/download');
    expect(publicDownloadRes.status).toBe(302);
    expect(publicDownloadRes.headers['content-disposition']).toMatch(/attachment;\s*filename="Admin-Uploaded-Resume\.pdf"/i);
    expect(publicDownloadRes.headers.location).toBe('https://example.com/admin-resume.pdf');
  });
});
