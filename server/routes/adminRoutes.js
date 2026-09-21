import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbEngine } from '../data/dbEngine.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRESETS_DIR = path.join(__dirname, '../presets');

const router = express.Router();

// Apply JWT verification to all admin routes
router.use(verifyToken);

// --- Portfolio Presets Endpoints ---
router.get('/presets', (req, res) => {
  try {
    if (!fs.existsSync(PRESETS_DIR)) {
      return res.json({ success: true, data: [] });
    }
    const files = fs.readdirSync(PRESETS_DIR).filter(f => f.endsWith('.json'));
    const presetsList = files.map(file => {
      const content = JSON.parse(fs.readFileSync(path.join(PRESETS_DIR, file), 'utf-8'));
      return {
        id: content.id,
        name: content.name,
        description: content.description,
        targetAudience: content.targetAudience,
        badge: content.badge,
        accentColor: content.accentColor,
        projectsCount: content.projects?.length || 0,
        skillsCount: content.skills?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0) || 0
      };
    });
    res.json({ success: true, data: presetsList });
  } catch (err) {
    console.error('Error listing presets:', err);
    res.status(500).json({ success: false, message: 'Failed to load presets.' });
  }
});

router.get('/presets/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(PRESETS_DIR, `${id}Preset.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Preset not found.' });
  }
  try {
    const presetData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json({ success: true, data: presetData });
  } catch (err) {
    console.error('Error reading preset preview:', err);
    res.status(500).json({ success: false, message: 'Failed to read preset preview.' });
  }
});

router.post('/presets/:id/apply', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(PRESETS_DIR, `${id}Preset.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Preset not found.' });
  }
  try {
    const presetData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const db = dbEngine.get();

    // Preserve existing admin user credentials & contact messages
    const adminUser = db.adminUser || { username: 'admin', password: 'admin123' };
    const existingMessages = db.messages || [];

    const updatedDb = {
      ...presetData,
      adminUser,
      messages: existingMessages,
      settings: {
        ...db.settings,
        ...presetData.settings,
        activePreset: presetData.id,
        profileType: presetData.name
      }
    };

    dbEngine.save(updatedDb);

    res.json({
      success: true,
      message: `${presetData.name} preset created successfully. You can now customize your portfolio.`,
      data: updatedDb
    });
  } catch (err) {
    console.error('Error applying preset:', err);
    res.status(500).json({ success: false, message: 'Failed to apply preset.' });
  }
});

// --- Profile & About ---
router.put('/profile', (req, res) => {
  const db = dbEngine.get();
  db.personalInfo = { ...db.personalInfo, ...req.body };
  dbEngine.save(db);
  res.json({ success: true, message: 'Profile updated successfully', data: db.personalInfo });
});

// --- Skills CRUD ---
router.post('/skills', (req, res) => {
  const db = dbEngine.get();
  const { category, name, level, popular, icon } = req.body;
  if (!category || !name) {
    return res.status(400).json({ success: false, message: 'Category and skill name are required' });
  }

  let catGroup = db.skills.find(s => s.category.toLowerCase() === category.toLowerCase());
  if (!catGroup) {
    catGroup = { category, icon: icon || 'Server', items: [] };
    db.skills.push(catGroup);
  }

  catGroup.items.push({ name, level: parseInt(level) || 80, popular: !!popular });
  dbEngine.save(db);
  res.json({ success: true, message: 'Skill added successfully', data: db.skills });
});

router.delete('/skills', (req, res) => {
  const { category, name } = req.body;
  const db = dbEngine.get();
  const catGroup = db.skills.find(s => s.category.toLowerCase() === category.toLowerCase());
  if (catGroup) {
    catGroup.items = catGroup.items.filter(item => item.name.toLowerCase() !== name.toLowerCase());
    dbEngine.save(db);
  }
  res.json({ success: true, message: 'Skill deleted successfully', data: db.skills });
});

// --- Projects CRUD ---
router.post('/projects', (req, res) => {
  const db = dbEngine.get();
  const newProject = {
    id: `proj-${Date.now()}`,
    ...req.body,
    featured: req.body.featured ?? true
  };
  db.projects = db.projects || [];
  db.projects.unshift(newProject);
  dbEngine.save(db);
  res.json({ success: true, message: 'Project added successfully', data: newProject });
});

router.put('/projects/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  const idx = db.projects.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  db.projects[idx] = { ...db.projects[idx], ...req.body };
  dbEngine.save(db);
  res.json({ success: true, message: 'Project updated successfully', data: db.projects[idx] });
});

router.delete('/projects/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.projects = db.projects.filter(p => p.id !== id);
  dbEngine.save(db);
  res.json({ success: true, message: 'Project deleted successfully' });
});

// --- Experience & Education CRUD ---
router.post('/experience', (req, res) => {
  const db = dbEngine.get();
  const newExp = { id: `exp-${Date.now()}`, ...req.body };
  db.experience = db.experience || [];
  db.experience.unshift(newExp);
  dbEngine.save(db);
  res.json({ success: true, message: 'Experience added', data: newExp });
});

router.delete('/experience/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.experience = db.experience.filter(e => e.id !== id);
  dbEngine.save(db);
  res.json({ success: true, message: 'Experience deleted' });
});

// --- Services CRUD ---
router.post('/services', (req, res) => {
  const db = dbEngine.get();
  const newService = { id: `srv-${Date.now()}`, ...req.body };
  db.services = db.services || [];
  db.services.push(newService);
  dbEngine.save(db);
  res.json({ success: true, message: 'Service added successfully', data: newService });
});

router.delete('/services/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.services = db.services.filter(s => s.id !== id);
  dbEngine.save(db);
  res.json({ success: true, message: 'Service deleted successfully' });
});

// --- Blogs CRUD ---
router.post('/blogs', (req, res) => {
  const db = dbEngine.get();
  const newBlog = {
    id: `post-${Date.now()}`,
    publishedDate: new Date().toISOString().split('T')[0],
    ...req.body
  };
  db.blogs = db.blogs || [];
  db.blogs.unshift(newBlog);
  dbEngine.save(db);
  res.json({ success: true, message: 'Article published successfully', data: newBlog });
});

router.delete('/blogs/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.blogs = db.blogs.filter(b => b.id !== id);
  dbEngine.save(db);
  res.json({ success: true, message: 'Article deleted successfully' });
});

// --- Testimonials CRUD ---
router.post('/testimonials', (req, res) => {
  const db = dbEngine.get();
  const newTestimonial = { id: `test-${Date.now()}`, visible: true, ...req.body };
  db.testimonials = db.testimonials || [];
  db.testimonials.push(newTestimonial);
  dbEngine.save(db);
  res.json({ success: true, message: 'Testimonial added successfully', data: newTestimonial });
});

router.delete('/testimonials/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.testimonials = db.testimonials.filter(t => t.id !== id);
  dbEngine.save(db);
  res.json({ success: true, message: 'Testimonial deleted successfully' });
});

// --- Contact Messages Inbox ---
router.get('/messages', (req, res) => {
  const db = dbEngine.get();
  res.json({ success: true, data: db.messages || [] });
});

router.put('/messages/:id/read', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  const msg = (db.messages || []).find(m => m.id === id);
  if (msg) {
    msg.read = true;
    dbEngine.save(db);
  }
  res.json({ success: true, message: 'Marked as read' });
});

router.delete('/messages/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.messages = (db.messages || []).filter(m => m.id !== id);
  dbEngine.save(db);
  res.json({ success: true, message: 'Message deleted' });
});

// --- Website Settings ---
router.put('/settings', (req, res) => {
  const db = dbEngine.get();
  db.settings = { ...db.settings, ...req.body };
  dbEngine.save(db);
  res.json({ success: true, message: 'Settings saved', data: db.settings });
});

export default router;
