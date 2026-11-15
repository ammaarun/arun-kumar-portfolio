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

describe('Experience and Education Backend API Integration Tests', () => {
  beforeAll(() => {
    backupDb = JSON.parse(JSON.stringify(dbEngine.get()));
    authToken = jwt.sign({ username: 'admin', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(() => {
    if (backupDb) {
      dbEngine.save(backupDb);
    }
  });

  // --- EXPERIENCE CRUD ---
  it('1. POST /api/admin/experience — rejects missing company or role with 400', async () => {
    const resNoComp = await request(app)
      .post('/api/admin/experience')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ role: 'Backend Lead' });

    expect(resNoComp.status).toBe(400);
    expect(resNoComp.body.success).toBe(false);
    expect(resNoComp.body.message).toMatch(/company name is required/i);

    const resNoRole = await request(app)
      .post('/api/admin/experience')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ company: 'Tech Inc' });

    expect(resNoRole.status).toBe(400);
    expect(resNoRole.body.success).toBe(false);
    expect(resNoRole.body.message).toMatch(/role title is required/i);
  });

  it('2. POST /api/admin/experience — creates experience and syncs active client', async () => {
    const newExp = {
      company: 'Test Stream Corp',
      role: 'Senior Distributed Engineer',
      period: '2024 - Present',
      location: 'Hyderabad, India',
      type: 'Full-time',
      achievements: ['Built high-throughput Kafka streaming', 'Reduced 99th percentile latency by 35%']
    };

    const res = await request(app)
      .post('/api/admin/experience')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newExp);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.company).toBe('Test Stream Corp');
    expect(res.body.data.role).toBe('Senior Distributed Engineer');

    // Verify in dbEngine
    const db = dbEngine.get();
    const created = db.experience.find(e => e.id === res.body.data.id);
    expect(created).toBeDefined();
    expect(created.achievements).toHaveLength(2);

    // Verify active client sync
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    const clientExp = activeClient.portfolioData.experience.find(e => e.id === res.body.data.id);
    expect(clientExp).toBeDefined();
    expect(clientExp.company).toBe('Test Stream Corp');
  });

  it('3. PUT /api/admin/experience/:id — updates experience record and syncs active client', async () => {
    // First create one
    const createRes = await request(app)
      .post('/api/admin/experience')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        company: 'Original Corp',
        role: 'Original Role',
        period: '2022 - 2023',
        location: 'Remote',
        achievements: ['Original achievement']
      });

    const expId = createRes.body.data.id;

    // Update it
    const updateRes = await request(app)
      .put(`/api/admin/experience/${expId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        company: 'Updated Corp',
        role: 'Principal Engineer',
        period: '2022 - 2024',
        location: 'Bengaluru, India',
        type: 'Contract',
        achievements: ['Updated achievement 1', 'Updated achievement 2']
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.company).toBe('Updated Corp');
    expect(updateRes.body.data.role).toBe('Principal Engineer');

    // Verify in db
    const db = dbEngine.get();
    const updated = db.experience.find(e => e.id === expId);
    expect(updated.company).toBe('Updated Corp');
    expect(updated.type).toBe('Contract');

    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    const clientExp = activeClient.portfolioData.experience.find(e => e.id === expId);
    expect(clientExp.company).toBe('Updated Corp');
  });

  it('4. DELETE /api/admin/experience/:id — removes experience record and syncs active client', async () => {
    const createRes = await request(app)
      .post('/api/admin/experience')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ company: 'Delete Me Corp', role: 'Temporary Role' });

    const expId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/admin/experience/${expId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    const db = dbEngine.get();
    expect(db.experience.find(e => e.id === expId)).toBeUndefined();
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    expect(activeClient.portfolioData.experience.find(e => e.id === expId)).toBeUndefined();
  });

  // --- EDUCATION CRUD ---
  it('5. POST /api/admin/education — rejects missing required fields with 400', async () => {
    const resNoInst = await request(app)
      .post('/api/admin/education')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ degree: 'B.Tech', fieldOfStudy: 'CS' });

    expect(resNoInst.status).toBe(400);
    expect(resNoInst.body.message).toMatch(/institution name is required/i);

    const resNoDeg = await request(app)
      .post('/api/admin/education')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ institution: 'University', fieldOfStudy: 'CS' });

    expect(resNoDeg.status).toBe(400);
    expect(resNoDeg.body.message).toMatch(/degree \/ qualification is required/i);

    const resNoField = await request(app)
      .post('/api/admin/education')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ institution: 'University', degree: 'B.Tech' });

    expect(resNoField.status).toBe(400);
    expect(resNoField.body.message).toMatch(/field of study is required/i);
  });

  it('6. POST /api/admin/education — successfully creates education and syncs active client', async () => {
    const newEdu = {
      institution: 'Carnegie Mellon University',
      degree: 'Master of Science',
      fieldOfStudy: 'Distributed Systems',
      startDate: '2021',
      endDate: '2023',
      period: '2021 - 2023',
      location: 'Pittsburgh, PA',
      gradeGpa: '3.95 / 4.0 GPA',
      description: 'Focused on fault-tolerant systems and consensus algorithms.'
    };

    const res = await request(app)
      .post('/api/admin/education')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newEdu);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.institution).toBe('Carnegie Mellon University');
    expect(res.body.data.gradeGpa).toBe('3.95 / 4.0 GPA');

    const db = dbEngine.get();
    const created = db.education.find(e => e.id === res.body.data.id);
    expect(created).toBeDefined();
    expect(created.fieldOfStudy).toBe('Distributed Systems');

    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    const clientEdu = activeClient.portfolioData.education.find(e => e.id === res.body.data.id);
    expect(clientEdu).toBeDefined();
    expect(clientEdu.institution).toBe('Carnegie Mellon University');
  });

  it('7. PUT /api/admin/education/:id — updates education record and syncs active client', async () => {
    const createRes = await request(app)
      .post('/api/admin/education')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        institution: 'Initial Univ',
        degree: 'B.S.',
        fieldOfStudy: 'Software Eng'
      });

    const eduId = createRes.body.data.id;

    const updateRes = await request(app)
      .put(`/api/admin/education/${eduId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        institution: 'Updated Univ',
        degree: 'B.S. with Honors',
        fieldOfStudy: 'Software Engineering',
        location: 'California, USA',
        gradeGpa: '3.9 GPA',
        description: 'Updated description'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.institution).toBe('Updated Univ');
    expect(updateRes.body.data.gradeGpa).toBe('3.9 GPA');

    const db = dbEngine.get();
    const updated = db.education.find(e => e.id === eduId);
    expect(updated.institution).toBe('Updated Univ');
    expect(updated.gradeGpa).toBe('3.9 GPA');

    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    const clientEdu = activeClient.portfolioData.education.find(e => e.id === eduId);
    expect(clientEdu.institution).toBe('Updated Univ');
  });

  it('8. DELETE /api/admin/education/:id — removes education record and syncs active client', async () => {
    const createRes = await request(app)
      .post('/api/admin/education')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        institution: 'Drop College',
        degree: 'Diploma',
        fieldOfStudy: 'IT'
      });

    const eduId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/admin/education/${eduId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    const db = dbEngine.get();
    expect(db.education.find(e => e.id === eduId)).toBeUndefined();
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    expect(activeClient.portfolioData.education.find(e => e.id === eduId)).toBeUndefined();
  });

  it('9. Unauthorized requests return 401', async () => {
    const resExp = await request(app).post('/api/admin/experience').send({});
    expect(resExp.status).toBe(401);

    const resEdu = await request(app).post('/api/admin/education').send({});
    expect(resEdu.status).toBe(401);
  });
});
