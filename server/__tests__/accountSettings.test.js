import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import { dbEngine } from '../data/dbEngine.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  return app;
};

const app = createTestApp();
let authToken = '';
let originalAdminUser = null;

describe('Admin Account Settings Backend API & Security Tests', () => {
  beforeAll(async () => {
    // Preserve initial adminUser state
    const db = dbEngine.get();
    originalAdminUser = { ...(db.adminUser || { username: 'admin', password: 'admin123' }) };

    // Reset adminUser to original state for clean test run
    db.adminUser = { ...originalAdminUser };
    dbEngine.save(db);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: originalAdminUser.username, password: originalAdminUser.password });

    authToken = loginRes.body.token;
  });

  afterAll(() => {
    // Restore pristine credentials so other test suites are never affected
    if (originalAdminUser) {
      const db = dbEngine.get();
      db.adminUser = { ...originalAdminUser };
      dbEngine.save(db);
    }
  });

  it('1. GET /api/admin/account — should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/admin/account');
    expect(res.status).toBe(401);
  });

  it('2. GET /api/admin/account — should return current username without exposing password or hash', async () => {
    const res = await request(app)
      .get('/api/admin/account')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.username).toBe(originalAdminUser.username);
    expect(res.body.data.role).toBe('ADMIN');
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.hash).toBeUndefined();
  });

  it('3. PUT /api/admin/account — should reject request if current password is missing', async () => {
    const res = await request(app)
      .put('/api/admin/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newUsername: 'newadmin' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/current password is required/i);
  });

  it('4. PUT /api/admin/account — should reject request if current password is incorrect', async () => {
    const res = await request(app)
      .put('/api/admin/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: 'wrong_password_999',
        newUsername: 'newadmin'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/current password verification failed/i);
  });

  it('5. PUT /api/admin/account — should validate username length and characters', async () => {
    // Too short (< 3 chars)
    const shortRes = await request(app)
      .put('/api/admin/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: originalAdminUser.password,
        newUsername: 'ab'
      });
    expect(shortRes.status).toBe(400);
    expect(shortRes.body.message).toMatch(/between 3 and 50 characters/i);

    // Invalid characters (spaces, special characters)
    const invalidCharRes = await request(app)
      .put('/api/admin/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: originalAdminUser.password,
        newUsername: 'bad user!@#'
      });
    expect(invalidCharRes.status).toBe(400);
    expect(invalidCharRes.body.message).toMatch(/letters, numbers, hyphens/i);
  });

  it('6. PUT /api/admin/account — should reject password change if confirmation does not match', async () => {
    const res = await request(app)
      .put('/api/admin/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: originalAdminUser.password,
        newPassword: 'ValidNewPassword123',
        confirmPassword: 'MismatchPassword456'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/do not match/i);
  });

  it('7. PUT /api/admin/account — should reject new password shorter than 6 characters', async () => {
    const res = await request(app)
      .put('/api/admin/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: originalAdminUser.password,
        newPassword: '12345',
        confirmPassword: '12345'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 6 characters/i);
  });

  it('8. PUT /api/admin/account — should reject new password if identical to current password', async () => {
    const res = await request(app)
      .put('/api/admin/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: originalAdminUser.password,
        newPassword: originalAdminUser.password,
        confirmPassword: originalAdminUser.password
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/different from current password/i);
  });

  it('9. PUT /api/admin/account — should reject request if no changes are submitted', async () => {
    const res = await request(app)
      .put('/api/admin/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: originalAdminUser.password,
        newUsername: originalAdminUser.username
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no changes detected/i);
  });

  it('10. PUT /api/admin/account — should successfully update username and return new JWT token', async () => {
    const res = await request(app)
      .put('/api/admin/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: originalAdminUser.password,
        newUsername: 'super_admin_2026'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('super_admin_2026');
    expect(res.body.token).toBeDefined();

    // Verify database reflection
    const db = dbEngine.get();
    expect(db.adminUser.username).toBe('super_admin_2026');

    // Update authToken for remaining tests
    authToken = res.body.token;
  });

  it('11. PUT /api/admin/account — should successfully update password, hash with bcrypt, and verify login', async () => {
    const newSecretPassword = 'SecureNewPassword_2026!';

    const res = await request(app)
      .put('/api/admin/account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: originalAdminUser.password,
        newPassword: newSecretPassword,
        confirmPassword: newSecretPassword
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.passwordChanged).toBe(true);

    // Verify in database: password must be stored as bcrypt hash and never plaintext!
    const db = dbEngine.get();
    expect(db.adminUser.password).not.toBe(newSecretPassword);
    expect(db.adminUser.password.startsWith('$2')).toBe(true);
    expect(bcrypt.compareSync(newSecretPassword, db.adminUser.password)).toBe(true);

    // Login test 1: Old password must fail
    const oldLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'super_admin_2026', password: originalAdminUser.password });
    expect(oldLoginRes.status).toBe(401);

    // Login test 2: New password must succeed
    const newLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'super_admin_2026', password: newSecretPassword });
    expect(newLoginRes.status).toBe(200);
    expect(newLoginRes.body.success).toBe(true);
    expect(newLoginRes.body.user.username).toBe('super_admin_2026');
    expect(newLoginRes.body.token).toBeDefined();
  });
});
