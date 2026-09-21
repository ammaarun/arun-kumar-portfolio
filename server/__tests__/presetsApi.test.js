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

beforeAll(() => {
  adminToken = jwt.sign({ username: 'admin', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
});

describe('Phase 8 & 9: Preset REST API Endpoints & Security Integration Tests', () => {

  it('1. GET /api/admin/presets — should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/admin/presets');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. GET /api/admin/presets — should return list of 5 available starter presets for authenticated admin', async () => {
    const res = await request(app)
      .get('/api/admin/presets')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(5);

    const ids = res.body.data.map(p => p.id);
    expect(ids).toContain('fresher');
    expect(ids).toContain('experienced');
    expect(ids).toContain('fullstack');
    expect(ids).toContain('freelancer');
    expect(ids).toContain('student');
  });

  it('3. GET /api/admin/presets/:id — should return full preset data for non-mutating preview', async () => {
    const res = await request(app)
      .get('/api/admin/presets/fresher')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('fresher');
    expect(res.body.data.personalInfo.name).toBe('Alex Morgan');
    expect(res.body.data).toHaveProperty('skills');
    expect(res.body.data).toHaveProperty('projects');
  });

  it('4. POST /api/admin/presets/:id/apply — should safely apply selected preset starter data', async () => {
    const res = await request(app)
      .post('/api/admin/presets/freelancer/apply')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('created successfully');
    expect(res.body.data.personalInfo.name).toBe('Taylor Swiftly');
    expect(res.body.data.settings.activePreset).toBe('freelancer');
  });

  it('5. POST /api/admin/presets/invalid/apply — should return 404 for non-existent preset', async () => {
    const res = await request(app)
      .post('/api/admin/presets/invalid/apply')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

});
