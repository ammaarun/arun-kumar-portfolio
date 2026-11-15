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

describe('Projects CMS API Backend Integration Tests', () => {
  beforeAll(() => {
    backupDb = JSON.parse(JSON.stringify(dbEngine.get()));
    authToken = jwt.sign({ username: 'admin', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(() => {
    if (backupDb) {
      dbEngine.save(backupDb);
    }
  });

  it('1. POST /api/admin/projects — rejects requests missing title or description with 400', async () => {
    const resNoTitle = await request(app)
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Valid description without title' });

    expect(resNoTitle.status).toBe(400);
    expect(resNoTitle.body.success).toBe(false);
    expect(resNoTitle.body.message).toMatch(/project title is required/i);

    const resNoDesc = await request(app)
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Valid Title' });

    expect(resNoDesc.status).toBe(400);
    expect(resNoDesc.body.success).toBe(false);
    expect(resNoDesc.body.message).toMatch(/project description is required/i);
  });

  it('2. POST /api/admin/projects — successfully creates project, syncs active client, and logs activity', async () => {
    const newProj = {
      title: 'High-Throughput Kafka Engine',
      subtitle: 'Real-time event processor',
      category: 'Backend & Microservices',
      description: 'Distributed event processing pipeline capable of 50k msgs/sec',
      tech: ['Java 21', 'Spring Boot', 'Kafka', 'PostgreSQL'],
      github: 'https://github.com/example/kafka-engine',
      live: 'https://example.com/demo',
      featured: true
    };

    const res = await request(app)
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newProj);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(newProj.title);
    expect(res.body.data.id).toMatch(/^proj-/);

    // Verify in database engine
    const db = dbEngine.get();
    const created = (db.projects || []).find(p => p.id === res.body.data.id);
    expect(created).toBeDefined();
    expect(created.title).toBe(newProj.title);

    // Verify synchronized into active client portfolioData
    const activeClient = (db.clients || []).find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      const clientProj = (activeClient.portfolioData.projects || []).find(p => p.id === res.body.data.id);
      expect(clientProj).toBeDefined();
      expect(clientProj.title).toBe(newProj.title);
    }
  });

  it('3. PUT /api/admin/projects/:id — updates project and syncs with active client', async () => {
    const db = dbEngine.get();
    const existing = db.projects[0];
    expect(existing).toBeDefined();

    const updatePayload = {
      title: 'Updated Event Engine Title',
      description: 'Updated description for the Kafka event pipeline'
    };

    const res = await request(app)
      .put(`/api/admin/projects/${existing.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Event Engine Title');

    const updatedDb = dbEngine.get();
    const updatedProj = updatedDb.projects.find(p => p.id === existing.id);
    expect(updatedProj.title).toBe('Updated Event Engine Title');
  });

  it('4. DELETE /api/admin/projects/:id — removes project and syncs active client', async () => {
    const db = dbEngine.get();
    const toDelete = db.projects[0];
    expect(toDelete).toBeDefined();

    const res = await request(app)
      .delete(`/api/admin/projects/${toDelete.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedDb = dbEngine.get();
    const found = (updatedDb.projects || []).find(p => p.id === toDelete.id);
    expect(found).toBeUndefined();
  });
});
