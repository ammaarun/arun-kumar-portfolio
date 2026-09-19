import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  return app;
};

const app = createTestApp();
let authToken = '';

describe('Phase 4: Protected Admin CRUD REST API Tests', () => {

  beforeAll(async () => {
    // Authenticate to obtain token for protected routes
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    
    authToken = loginRes.body.token;
  });

  it('1. GET /api/admin/messages — should deny request without token', async () => {
    const res = await request(app).get('/api/admin/messages');
    expect(res.status).toBe(401);
  });

  it('2. GET /api/admin/messages — should allow request with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/admin/messages')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('3. PUT /api/admin/profile — should update profile data', async () => {
    const res = await request(app)
      .put('/api/admin/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ role: 'Lead Java & Full Stack Developer' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('Lead Java & Full Stack Developer');
  });

  it('4. POST /api/admin/projects — should create a new project', async () => {
    const newProj = {
      title: 'Automated Test Project',
      subtitle: 'Vitest Microservice',
      category: 'Backend & Microservices',
      description: 'Project created during automated suite execution',
      tech: ['Java', 'Spring Boot', 'JUnit']
    };

    const res = await request(app)
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newProj);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Automated Test Project');
  });

});
