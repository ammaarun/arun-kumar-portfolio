import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import adminRoutes from '../routes/adminRoutes.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  return app;
};

const app = createTestApp();
let adminToken = '';
let createdClientId = '';

beforeAll(() => {
  adminToken = jwt.sign({ username: 'admin', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
});

describe('Multi-Client Platform REST API Integration Tests', () => {

  it('1. GET /api/admin/clients — should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/admin/clients');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. GET /api/admin/clients — should return client portfolios list and activeClientId', async () => {
    const res = await request(app)
      .get('/api/admin/clients')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.activeClientId).toBeDefined();
  });

  it('3. POST /api/admin/clients — should create a new client portfolio seeded with preset', async () => {
    const res = await request(app)
      .post('/api/admin/clients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'Senior React Developer',
        presetId: 'experienced'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Jane Doe');
    expect(res.body.data.status).toBe('DRAFT');
    createdClientId = res.body.data.id;
  });

  it('4. PUT /api/admin/clients/:id — should update client details', async () => {
    const res = await request(app)
      .put(`/api/admin/clients/${createdClientId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Jane Doe Smith',
        role: 'Staff Frontend Engineer'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Jane Doe Smith');
    expect(res.body.data.role).toBe('Staff Frontend Engineer');
  });

  it('5. PUT /api/admin/clients/:id/status — should update status to PUBLISHED', async () => {
    const res = await request(app)
      .put(`/api/admin/clients/${createdClientId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PUBLISHED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PUBLISHED');
    expect(res.body.data.lastPublishedAt).toBeDefined();
  });

  it('6. POST /api/admin/clients/:id/select — should switch active client context and root personalInfo data', async () => {
    const res = await request(app)
      .post(`/api/admin/clients/${createdClientId}/select`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.activeClientId).toBe(createdClientId);

    const { dbEngine } = await import('../data/dbEngine.js');
    const db = dbEngine.get();
    expect(db.activeClientId).toBe(createdClientId);
    expect(db.personalInfo.name).toBe('Jane Doe Smith');
  });

  it('7. DELETE /api/admin/clients/:id — should delete client when multiple exist', async () => {
    const res = await request(app)
      .delete(`/api/admin/clients/${createdClientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

});
