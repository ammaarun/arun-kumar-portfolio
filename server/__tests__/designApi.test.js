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

describe('Phase 2: Portfolio Design & Customization REST API Integration Tests', () => {

  it('1. GET /api/admin/design — should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/admin/design');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. GET /api/admin/design — should return current client designConfig for authenticated admin', async () => {
    const res = await request(app)
      .get('/api/admin/design')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('colors');
    expect(res.body.data).toHaveProperty('fonts');
    expect(res.body.data).toHaveProperty('layout');
    expect(res.body.data).toHaveProperty('sections');
  });

  it('3. PUT /api/admin/design — should update colors, fonts, layout, and sections in designConfig', async () => {
    const res = await request(app)
      .put('/api/admin/design')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        colors: { primary: '#2563eb', secondary: '#3b82f6', background: '#0f172a' },
        fonts: { heading: 'Space Grotesk', body: 'Roboto' },
        layout: { hero: 'split', projects: 'cards' }
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.colors.primary).toBe('#2563eb');
    expect(res.body.data.fonts.heading).toBe('Space Grotesk');
    expect(res.body.data.layout.hero).toBe('split');
  });

  it('4. GET /api/admin/templates — should return list of 6 visual design templates', async () => {
    const res = await request(app)
      .get('/api/admin/templates')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(6);

    const ids = res.body.data.map(t => t.id);
    expect(ids).toContain('modern-dark');
    expect(ids).toContain('minimal-light');
    expect(ids).toContain('professional');
    expect(ids).toContain('creative');
    expect(ids).toContain('developer');
    expect(ids).toContain('designer');
  });

  it('5. POST /api/admin/templates/:id/apply — should apply visual design template without modifying client content', async () => {
    const res = await request(app)
      .post('/api/admin/templates/minimal-light/apply')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Minimal Light');
    expect(res.body.data.template).toBe('minimal-light');
    expect(res.body.data.themeMode).toBe('light');
  });

});
