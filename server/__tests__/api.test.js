import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import portfolioRoutes from '../routes/portfolioRoutes.js';

// Setup test Express application instance
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/portfolio', portfolioRoutes);
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  return app;
};

const app = createTestApp();

describe('Phase 1: Backend REST API Integration Tests', () => {

  it('1. GET /api/health — should return 200 OK status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  it('2. GET /api/portfolio — should return public portfolio dataset', async () => {
    const res = await request(app).get('/api/portfolio');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('personalInfo');
    expect(res.body.data.personalInfo.name).toBeDefined();
    expect(res.body.data).toHaveProperty('skills');
    expect(res.body.data).toHaveProperty('projects');
  });

  it('3. POST /api/auth/login — should authenticate valid admin credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('role', 'ADMIN');
  });

  it('4. POST /api/auth/login — should reject invalid admin credentials with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' });
    
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid');
  });

  it('5. POST /api/portfolio/contact — should record contact submission in database', async () => {
    const messagePayload = {
      name: 'Test Client',
      email: 'client@example.com',
      subject: 'Freelance Inquiry',
      message: 'Hello Arun, I would like to discuss a Java project.'
    };

    const res = await request(app)
      .post('/api/portfolio/contact')
      .send(messagePayload);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Client');
  });

});
