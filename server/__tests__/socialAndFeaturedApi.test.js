import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import adminRoutes from '../routes/adminRoutes.js';
import portfolioRoutes from '../routes/portfolioRoutes.js';
import { dbEngine } from '../data/dbEngine.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  app.use('/api/portfolio', portfolioRoutes);
  return app;
};

const app = createTestApp();
let authToken = '';
let backupDb = null;

describe('Social Media and Featured Project Backend API Tests', () => {
  beforeAll(() => {
    backupDb = JSON.parse(JSON.stringify(dbEngine.get()));
    authToken = jwt.sign({ username: 'admin', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(() => {
    if (backupDb) {
      dbEngine.save(backupDb);
    }
  });

  it('1. PUT /api/admin/profile — rejects invalid URLs with 400', async () => {
    const res = await request(app)
      .put('/api/admin/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        youtube: 'not-a-valid-http-url'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid url for youtube/i);
  });

  it('2. PUT /api/admin/profile — successfully saves 6 social URLs and visibility settings, syncing to active client', async () => {
    const socialPayload = {
      github: 'https://github.com/developer-arun',
      linkedin: 'https://linkedin.com/in/developer-arun',
      twitter: 'https://x.com/developer_arun',
      youtube: 'https://youtube.com/@developerarun',
      instagram: 'https://instagram.com/developerarun',
      website: 'https://developerarun.com',
      socialVisibility: {
        github: true,
        linkedin: true,
        twitter: true,
        youtube: true,
        instagram: false,
        website: true
      }
    };

    const res = await request(app)
      .put('/api/admin/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send(socialPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.youtube).toBe('https://youtube.com/@developerarun');
    expect(res.body.data.socialVisibility.instagram).toBe(false);

    // Verify database and active client synchronization
    const db = dbEngine.get();
    expect(db.personalInfo.youtube).toBe('https://youtube.com/@developerarun');
    expect(db.personalInfo.socialVisibility.instagram).toBe(false);

    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    expect(activeClient.portfolioData.personalInfo.youtube).toBe('https://youtube.com/@developerarun');
    expect(activeClient.portfolioData.personalInfo.socialVisibility.instagram).toBe(false);
  });

  it('3. PUT /api/admin/projects/:id — successfully toggles featured flag and syncs active client', async () => {
    let db = dbEngine.get();
    if (!db.projects || db.projects.length === 0) {
      db.projects = [{
        id: 'proj-feature-test-1',
        title: 'Kafka Test Microservice',
        description: 'Test project description',
        category: 'Backend',
        featured: false
      }];
      dbEngine.save(db);
      db = dbEngine.get();
    }
    const targetProject = db.projects[0];
    expect(targetProject).toBeDefined();

    const originalFeatured = Boolean(targetProject.featured);
    const newFeatured = !originalFeatured;

    const res = await request(app)
      .put(`/api/admin/projects/${targetProject.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ featured: newFeatured });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.featured).toBe(newFeatured);

    const updatedDb = dbEngine.get();
    const updatedProj = updatedDb.projects.find(p => p.id === targetProject.id);
    expect(updatedProj.featured).toBe(newFeatured);

    const activeClient = updatedDb.clients.find(c => c.id === updatedDb.activeClientId);
    const clientProj = activeClient.portfolioData.projects.find(p => p.id === targetProject.id);
    expect(clientProj.featured).toBe(newFeatured);
  });

  it('4. Multi-Client Isolation — Client A social settings and featured flags do not overwrite Client B', async () => {
    const db = dbEngine.get();

    // Ensure at least two clients exist
    if (!db.clients || db.clients.length < 2) {
      // Create second client for isolation test
      const client2 = {
        id: 'client-isolation-test',
        name: 'Client Isolation Test User',
        slug: 'client-isolation-test',
        status: 'DRAFT',
        portfolioData: {
          personalInfo: {
            name: 'Client B User',
            github: 'https://github.com/clientb',
            socialVisibility: { github: true }
          },
          projects: [
            { id: 'proj-client-b', title: 'Client B Exclusive Project', featured: false }
          ]
        }
      };
      db.clients.push(client2);
      dbEngine.save(db);
    }

    const clientBBefore = JSON.parse(JSON.stringify(
      dbEngine.get().clients.find(c => c.id !== dbEngine.get().activeClientId)
    ));

    // Update active client's profile
    await request(app)
      .put('/api/admin/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        github: 'https://github.com/active-client-only',
        youtube: 'https://youtube.com/@activeonly'
      });

    const clientBAfter = dbEngine.get().clients.find(c => c.id === clientBBefore.id);

    // Client B's data must remain unchanged
    expect(clientBAfter.portfolioData.personalInfo.github).toBe(clientBBefore.portfolioData.personalInfo.github);
    expect(clientBAfter.portfolioData.personalInfo.youtube).toBeUndefined();
  });
});
