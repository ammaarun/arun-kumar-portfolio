import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import portfolioRoutes from '../routes/portfolioRoutes.js';
import { dbEngine } from '../data/dbEngine.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/portfolio', portfolioRoutes);
  return app;
};

const app = createTestApp();
let authToken = '';

describe('Contact Form Settings & Email Notifications API Integration Tests', () => {

  beforeAll(async () => {
    // Authenticate
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    
    authToken = loginRes.body.token;
  });

  afterAll(() => {
    // Clean up
  });

  it('1. GET /api/admin/contact-settings — should require authentication (401)', async () => {
    const res = await request(app).get('/api/admin/contact-settings');
    expect(res.status).toBe(401);
  });

  it('2. GET /api/admin/contact-settings — should return default/current settings with token', async () => {
    const res = await request(app)
      .get('/api/admin/contact-settings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.enabled).toBeDefined();
    expect(typeof res.body.data.enabled).toBe('boolean');
  });

  it('3. PUT /api/admin/contact-settings — should reject invalid email format with 400', async () => {
    const res = await request(app)
      .put('/api/admin/contact-settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        enabled: true,
        recipientEmail: 'not-an-email'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/valid recipient email/i);
  });

  it('4. PUT /api/admin/contact-settings — should successfully update contact form settings', async () => {
    const res = await request(app)
      .put('/api/admin/contact-settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        enabled: true,
        recipientEmail: 'portfolio.owner@example.com'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.enabled).toBe(true);
    expect(res.body.data.recipientEmail).toBe('portfolio.owner@example.com');

    // Verify settings persist on subsequent GET
    const getRes = await request(app)
      .get('/api/admin/contact-settings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.enabled).toBe(true);
    expect(getRes.body.data.recipientEmail).toBe('portfolio.owner@example.com');
  });

  it('5. Multi-Client Isolation — Updating client A settings does not overwrite client B', async () => {
    const db = dbEngine.get();
    const clients = db.clients || [];

    if (clients.length >= 2) {
      const clientA = clients[0];
      const clientB = clients[1];

      // Update Client A
      await request(app)
        .put('/api/admin/contact-settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientA.id,
          enabled: true,
          recipientEmail: 'clientA@example.com'
        });

      // Update Client B
      await request(app)
        .put('/api/admin/contact-settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientB.id,
          enabled: false,
          recipientEmail: 'clientB@example.com'
        });

      // Fetch Client A
      const resA = await request(app)
        .get(`/api/admin/contact-settings?clientId=${clientA.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Fetch Client B
      const resB = await request(app)
        .get(`/api/admin/contact-settings?clientId=${clientB.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(resA.body.data.enabled).toBe(true);
      expect(resA.body.data.recipientEmail).toBe('clientA@example.com');
      expect(resB.body.data.enabled).toBe(false);
      expect(resB.body.data.recipientEmail).toBe('clientB@example.com');
    }
  });

  it('6. POST /api/portfolio/contact — validates required fields with 400', async () => {
    // Missing name
    const res1 = await request(app)
      .post('/api/portfolio/contact')
      .send({ email: 'john@example.com', message: 'Hello' });
    expect(res1.status).toBe(400);
    expect(res1.body.message).toMatch(/name/i);

    // Missing email
    const res2 = await request(app)
      .post('/api/portfolio/contact')
      .send({ name: 'John', message: 'Hello' });
    expect(res2.status).toBe(400);
    expect(res2.body.message).toMatch(/email/i);

    // Missing message
    const res3 = await request(app)
      .post('/api/portfolio/contact')
      .send({ name: 'John', email: 'john@example.com' });
    expect(res3.status).toBe(400);
    expect(res3.body.message).toMatch(/message/i);
  });

  it('7. POST /api/portfolio/contact — validates email format with 400', async () => {
    const res = await request(app)
      .post('/api/portfolio/contact')
      .send({ name: 'John', email: 'invalid-email', message: 'Hello' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid email/i);
  });

  it('8. POST /api/portfolio/contact — accepts and saves message when contact form is enabled', async () => {
    // Ensure active client form is enabled
    await request(app)
      .put('/api/admin/contact-settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ enabled: true, recipientEmail: 'owner@example.com' });

    const messagePayload = {
      name: 'Alice Visitor',
      email: 'alice@company.com',
      subject: 'Collaboration Opportunity',
      message: 'We would love to discuss a full-stack project.'
    };

    const res = await request(app)
      .post('/api/portfolio/contact')
      .send(messagePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Alice Visitor');
    expect(res.body.data.email).toBe('alice@company.com');

    // Verify message appears in admin messages inbox
    const inboxRes = await request(app)
      .get('/api/admin/messages')
      .set('Authorization', `Bearer ${authToken}`);

    expect(inboxRes.status).toBe(200);
    const found = inboxRes.body.data.find(m => m.id === res.body.data.id);
    expect(found).toBeDefined();
    expect(found.subject).toBe('Collaboration Opportunity');
  });

  it('9. POST /api/portfolio/contact — rejects message submission with 403 when disabled', async () => {
    // Disable contact form
    await request(app)
      .put('/api/admin/contact-settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ enabled: false });

    const res = await request(app)
      .post('/api/portfolio/contact')
      .send({
        name: 'Bob Spam',
        email: 'bob@spam.com',
        message: 'This should be blocked.'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/disabled/i);

    // Re-enable for subsequent tests
    await request(app)
      .put('/api/admin/contact-settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ enabled: true });
  });

  it('10. POST /api/portfolio/contact — sanitizes HTML/script tags from inputs', async () => {
    const res = await request(app)
      .post('/api/portfolio/contact')
      .send({
        name: 'Dr. Script <script>alert("xss")</script>',
        email: 'clean@example.com',
        subject: 'Inquiry <b>Bold</b>',
        message: 'Hello <iframe src="evil.com"></iframe> there!'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).not.toContain('<script>');
    expect(res.body.data.message).not.toContain('<iframe>');
  });

  it('11. Public GET /api/portfolio includes contactSettings.enabled', async () => {
    const res = await request(app).get('/api/portfolio');
    expect(res.status).toBe(200);
    expect(res.body.data.contactSettings).toBeDefined();
    expect(res.body.data.contactSettings.enabled).toBe(true);
  });

  it('12. POST /api/portfolio/contact records emailDelivery metadata safely on message', async () => {
    const res = await request(app)
      .post('/api/portfolio/contact')
      .send({
        name: 'Delivery Audit',
        email: 'audit@example.com',
        subject: 'Audit Message',
        message: 'Checking emailDelivery status record.'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.emailDelivery).toBeDefined();
    expect(res.body.data.emailDelivery.status).toBeDefined();
    expect(['sent', 'not_configured', 'failed']).toContain(res.body.data.emailDelivery.status);
    expect(res.body.data.emailDelivery.attemptedAt).toBeDefined();
  });

  it('13. GET /api/admin/contact-settings/verify-smtp returns diagnostic connection status', async () => {
    const res = await request(app)
      .get('/api/admin/contact-settings/verify-smtp')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.configured).toBeDefined();
    expect(res.body.connected).toBeDefined();
    expect(res.body.message).toBeDefined();
  });

  it('14. POST /api/admin/contact-settings/test-email validates recipient email with 400', async () => {
    const res = await request(app)
      .post('/api/admin/contact-settings/test-email')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ recipientEmail: 'invalid-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/valid recipient email/i);
  });

});
