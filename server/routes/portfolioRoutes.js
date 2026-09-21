import express from 'express';
import { dbEngine } from '../data/dbEngine.js';
import { sendInquiryNotification } from '../utils/emailService.js';

const router = express.Router();

// Get full public portfolio data
router.get('/', (req, res) => {
  const db = dbEngine.get();
  // Filter out admin details before returning to public client
  const { adminUser, ...publicData } = db;
  res.json({ success: true, data: publicData });
});

// Submit contact message / client inquiry
router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }

  const db = dbEngine.get();
  const newMessage = {
    id: `msg-${Date.now()}`,
    name,
    email,
    subject: subject || 'General Inquiry',
    message,
    createdAt: new Date().toISOString(),
    read: false
  };

  db.messages = db.messages || [];
  db.messages.unshift(newMessage);
  dbEngine.save(db);

  // Asynchronously trigger email notification alert
  sendInquiryNotification(newMessage).catch(err => {
    console.error('Error dispatching inquiry notification email:', err);
  });

  res.json({ success: true, message: 'Message sent successfully!', data: newMessage });
});

export default router;
