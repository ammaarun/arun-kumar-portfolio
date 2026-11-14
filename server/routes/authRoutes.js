import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbEngine } from '../data/dbEngine.js';
import { JWT_SECRET, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = dbEngine.get();

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const admin = db.adminUser || { username: 'admin', password: 'admin123' };

  let isMatch = false;
  if (admin.password && (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'))) {
    isMatch = await bcrypt.compare(password, admin.password);
  } else {
    isMatch = (admin.password === password);
  }

  if (username === admin.username && isMatch) {
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
