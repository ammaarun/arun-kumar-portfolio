import express from 'express';
import jwt from 'jsonwebtoken';
import { dbEngine } from '../data/dbEngine.js';
import { JWT_SECRET, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = dbEngine.get();

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const admin = db.adminUser || { username: 'admin', password: 'admin123' };

  if (username === admin.username && password === admin.password) {
    const token = jwt.sign(
      { username: admin.username, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({
      success: true,
      token,
      user: { username: admin.username, role: 'ADMIN' }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
});

// Verify Token
router.get('/verify', verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
