import express from 'express';
import { dbEngine, defaultDesignConfig } from '../data/dbEngine.js';
import { sendInquiryNotification } from '../utils/emailService.js';
import { getPresignedGetUrl } from '../utils/storageService.js';

const router = express.Router();

// ── Public media resolver — serves Neon Object Storage assets to public portfolio visitors ──
// Security model:
//   1. Look up media record by mediaId (never trust client-supplied objectKey)
//   2. Find the owning client from the record's portfolioId
//   3. Verify that client is PUBLISHED — unpublished/invalid portfolios cannot serve media
//   4. Verify storageBackend === 'neon' (never proxy arbitrary keys)
//   5. Generate a short-lived presigned URL and 302 redirect
//   6. Never expose credentials, never make bucket public
router.get('/media/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const db = dbEngine.get();

    // 1. Find the media record across ALL clients' mediaLibraries
    let mediaRecord = null;
    let owningClient = null;

    for (const client of (db.clients || [])) {
      const clientMedia = (client.portfolioData?.mediaLibrary || []);
      const found = clientMedia.find(m => m.id === mediaId);
      if (found) {
        mediaRecord = found;
        owningClient = client;
        break;
      }
    }

    // Also check root db.mediaLibrary (active client context)
    if (!mediaRecord) {
      const rootFound = (db.mediaLibrary || []).find(m => m.id === mediaId);
      if (rootFound) {
        mediaRecord = rootFound;
        // Find the owning client by portfolioId stored on the record
        owningClient = (db.clients || []).find(c => c.id === rootFound.portfolioId);
      }
    }

    if (!mediaRecord) {
      return res.status(404).json({ success: false, message: 'Media asset not found.' });
    }

    // 2. Verify storageBackend — only serve Neon-stored assets through this endpoint
    if (mediaRecord.storageBackend !== 'neon' || !mediaRecord.objectKey) {
      return res.status(400).json({ success: false, message: 'Media asset is not a Neon storage asset.' });
    }

    // 3. Verify the owning portfolio is PUBLISHED
    if (!owningClient || (owningClient.status && owningClient.status !== 'PUBLISHED')) {
      return res.status(403).json({ success: false, message: 'Portfolio is not publicly available.' });
    }

    // 4. Generate a short-lived presigned GET URL (60s — enough for one page load)
    const presignedUrl = await getPresignedGetUrl(mediaRecord.objectKey, 60);

    // 5. 302 redirect — a public <img> tag CAN follow a 302 redirect (no auth header needed)
    res.redirect(302, presignedUrl);
  } catch (err) {
    console.error('[Public Media] Error resolving media:', err.name, '-', err.message);
    // Return 404 rather than 500 — failed media should not crash the portfolio
    res.status(404).json({ success: false, message: 'Media asset could not be loaded.' });
  }
});

// Get full public portfolio data
router.get('/', (req, res) => {
  const db = dbEngine.get();
  // Filter out admin details before returning to public client
  const { adminUser, ...publicData } = db;
  res.json({ success: true, data: publicData });
});

// Get public portfolio by slug or client ID
router.get('/slug/:slug', (req, res) => {
  const { slug } = req.params;
  const db = dbEngine.get();

  let client = (db.clients || []).find(c => c.id === slug || c.slug === slug);
  if (!client) {
    const candidates = (db.clients || []).filter(c => c.slug === slug || c.id === slug);
    if (candidates.length > 0) {
      client = candidates.find(c => c.id === db.activeClientId) ||
               candidates.find(c => c.status === 'PUBLISHED') ||
               candidates[0];
    }
  }

  if (!client) {
    return res.status(404).json({ success: false, message: `Portfolio with slug '${slug}' not found.` });
  }

  const pData = client.portfolioData || {};
  const designConfig = pData.designConfig || defaultDesignConfig;
  const sections = (designConfig.sections && designConfig.sections.length > 0)
    ? designConfig.sections
    : defaultDesignConfig.sections;

  res.json({
    success: true,
    data: {
      ...pData,
      designConfig: {
        ...designConfig,
        sections
      },
      status: client.status || 'PUBLISHED',
      slug: client.slug,
      clientName: client.name,
      clientRole: client.role
    }
  });
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
