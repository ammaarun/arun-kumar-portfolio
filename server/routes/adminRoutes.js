import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbEngine, defaultDesignConfig, defaultMediaLibrary, defaultResumes, defaultSeo, defaultBranding } from '../data/dbEngine.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { visualTemplates } from '../templates/visualTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRESETS_DIR = path.join(__dirname, '../presets');

const router = express.Router();

// Apply JWT verification to all admin routes
router.use(verifyToken);

// --- Multi-Client Management Endpoints ---
router.get('/clients', (req, res) => {
  const db = dbEngine.get();
  const search = (req.query.search || '').toLowerCase();
  
  let clients = (db.clients || []).map(client => {
    const p = client.portfolioData || {};
    const projectsCount = p.projects?.length || 0;
    const skillsCount = (p.skills || []).reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      role: client.role,
      profileImage: client.profileImage,
      slug: client.slug,
      status: client.status || 'DRAFT',
      createdDate: client.createdDate,
      lastUpdated: client.lastUpdated,
      lastPublishedAt: client.lastPublishedAt || null,
      isDefault: !!client.isDefault,
      isActive: client.id === db.activeClientId,
      projectsCount,
      skillsCount
    };
  });

  if (search) {
    clients = clients.filter(c => 
      c.name.toLowerCase().includes(search) || 
      c.email.toLowerCase().includes(search) ||
      c.role.toLowerCase().includes(search)
    );
  }

  res.json({
    success: true,
    activeClientId: db.activeClientId,
    data: clients
  });
});

router.get('/clients/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  const client = (db.clients || []).find(c => c.id === id);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found.' });
  }
  res.json({ success: true, data: client });
});

function generateUniqueSlug(requestedSlug, name, existingClients, currentClientId = null) {
  let base = (requestedSlug || name || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!base) base = 'client';

  let candidate = base;
  let counter = 1;
  while ((existingClients || []).some(c => c.slug === candidate && c.id !== currentClientId)) {
    candidate = `${base}-${counter}`;
    counter++;
  }
  return candidate;
}

router.post('/clients', (req, res) => {
  const { name, email, role, profileImage, slug, presetId } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Client name and email are required.' });
  }

  const db = dbEngine.get();
  const newClientId = `client-${Date.now()}`;
  const clientSlug = generateUniqueSlug(slug, name, db.clients);

  let starterPortfolio = {
    personalInfo: {
      name,
      email,
      role: role || 'Software Developer',
      tagline: `Professional Developer Portfolio of ${name}`,
      shortBio: `${role || 'Software Developer'} passionate about building web products.`,
      bio: `${name} is a dedicated ${role || 'Software Developer'}.`,
      location: 'Telangana, India',
      availability: 'Available for New Projects',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      resumeUrl: '#'
    },
    skills: [],
    projects: [],
    experience: [],
    education: [],
    services: [],
    blogs: [],
    testimonials: [],
    settings: {
      siteTitle: `${name} — ${role || 'Developer Portfolio'}`,
      metaDescription: `Portfolio website of ${name}`,
      accentColor: 'emerald',
      themePreference: 'dark'
    }
  };

  // If a preset is chosen, seed portfolioData from preset file
  if (presetId) {
    const presetPath = path.join(PRESETS_DIR, `${presetId}Preset.json`);
    if (fs.existsSync(presetPath)) {
      try {
        const presetObj = JSON.parse(fs.readFileSync(presetPath, 'utf-8'));
        starterPortfolio = {
          ...presetObj,
          personalInfo: {
            ...presetObj.personalInfo,
            name,
            email,
            role: role || presetObj.personalInfo.role
          },
          settings: {
            ...presetObj.settings,
            siteTitle: `${name} — ${role || presetObj.personalInfo.role}`
          }
        };
      } catch (err) {
        console.error('Error seeding client from preset:', err);
      }
    }
  }

  const newClient = {
    id: newClientId,
    name,
    email,
    role: role || 'Software Developer',
    profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    slug: clientSlug,
    status: 'DRAFT',
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    lastPublishedAt: null,
    isDefault: false,
    portfolioData: starterPortfolio
  };

  db.clients = db.clients || [];
  db.clients.push(newClient);
  dbEngine.save(db);

  res.json({
    success: true,
    message: `Client ${name} created successfully.`,
    data: newClient
  });
});

router.put('/clients/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  const client = (db.clients || []).find(c => c.id === id);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found.' });
  }

  const { name, email, role, profileImage, slug } = req.body;
  if (name) client.name = name;
  if (email) client.email = email;
  if (role) client.role = role;
  if (profileImage) client.profileImage = profileImage;
  client.slug = generateUniqueSlug(slug || client.slug, name || client.name, db.clients, client.id);
  client.lastUpdated = new Date().toISOString();

  // Also update portfolioData personalInfo if present
  if (client.portfolioData && client.portfolioData.personalInfo) {
    if (name) client.portfolioData.personalInfo.name = name;
    if (email) client.portfolioData.personalInfo.email = email;
    if (role) client.portfolioData.personalInfo.role = role;
  }

  dbEngine.save(db);
  res.json({ success: true, message: 'Client updated successfully', data: client });
});

router.put('/clients/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['DRAFT', 'PUBLISHED', 'UNPUBLISHED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status. Must be DRAFT, PUBLISHED, or UNPUBLISHED.' });
  }

  const db = dbEngine.get();
  const client = (db.clients || []).find(c => c.id === id);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found.' });
  }

  client.status = status;
  client.lastUpdated = new Date().toISOString();
  if (status === 'PUBLISHED') {
    client.lastPublishedAt = new Date().toISOString();
  }

  dbEngine.save(db);
  res.json({
    success: true,
    message: `Portfolio status set to ${status}.`,
    data: { status: client.status, lastPublishedAt: client.lastPublishedAt }
  });
});

router.post('/clients/:id/select', (req, res) => {
  const { id } = req.params;
  const client = dbEngine.switchActiveClient(id);
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client not found.' });
  }

  res.json({
    success: true,
    message: `Active portfolio context switched to ${client.name}.`,
    activeClientId: id,
    client
  });
});

router.delete('/clients/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();

  if (db.clients.length <= 1) {
    return res.status(400).json({ success: false, message: 'Cannot delete the only remaining portfolio client.' });
  }

  const idx = db.clients.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Client not found.' });
  }

  const deletedClient = db.clients[idx];
  db.clients.splice(idx, 1);

  // If deleted client was active, switch activeClientId to remaining client
  if (db.activeClientId === id) {
    dbEngine.switchActiveClient(db.clients[0].id);
  } else {
    dbEngine.save(db);
  }

  res.json({
    success: true,
    message: `Client ${deletedClient.name} deleted successfully.`,
    activeClientId: dbEngine.get().activeClientId
  });
});

// --- Design Configuration & Visual Templates Endpoints ---
router.get('/design', (req, res) => {
  const db = dbEngine.get();
  res.json({
    success: true,
    data: db.designConfig || defaultDesignConfig
  });
});

router.put('/design', (req, res) => {
  const db = dbEngine.get();
  db.designConfig = {
    ...db.designConfig,
    ...req.body
  };
  dbEngine.save(db);
  res.json({
    success: true,
    message: 'Design configuration updated successfully.',
    data: db.designConfig
  });
});

router.get('/templates', (req, res) => {
  const db = dbEngine.get();
  const activeTemplateId = db.designConfig?.template || 'modern-dark';
  
  const templatesList = visualTemplates.map(t => ({
    ...t,
    isActive: t.id === activeTemplateId
  }));

  res.json({
    success: true,
    data: templatesList,
    activeTemplateId
  });
});

router.get('/templates/:id', (req, res) => {
  const { id } = req.params;
  const template = visualTemplates.find(t => t.id === id);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Visual template not found.' });
  }
  res.json({ success: true, data: template });
});

router.post('/templates/:id/apply', (req, res) => {
  const { id } = req.params;
  const template = visualTemplates.find(t => t.id === id);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Visual template not found.' });
  }

  const db = dbEngine.get();
  // Apply ONLY visual designConfig — keep all personalInfo, projects, skills, etc. intact!
  db.designConfig = {
    ...db.designConfig,
    ...template.designConfig
  };

  dbEngine.save(db);

  res.json({
    success: true,
    message: `Visual template ${template.name} applied successfully. Content remains unchanged.`,
    data: db.designConfig
  });
});

// --- Profile Starters / Portfolio Content Presets Endpoints ---
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

    // Preserve existing admin user credentials, contact messages, clients array, & activeClientId
    const adminUser = db.adminUser || { username: 'admin', password: 'admin123' };
    const existingMessages = db.messages || [];
    const existingClients = db.clients || [];
    const activeClientId = db.activeClientId || (existingClients[0]?.id || 'client-1');

    const updatedDb = {
      ...presetData,
      adminUser,
      messages: existingMessages,
      clients: existingClients,
      activeClientId,
      settings: {
        ...db.settings,
        ...presetData.settings,
        activePreset: presetData.id,
        profileType: presetData.name
      }
    };

    // Update active client metadata
    const activeClient = (updatedDb.clients || []).find(c => c.id === activeClientId);
    if (activeClient && presetData.personalInfo) {
      if (presetData.personalInfo.name) activeClient.name = presetData.personalInfo.name;
      if (presetData.personalInfo.role) activeClient.role = presetData.personalInfo.role;
    }

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

// --- Media Library Endpoints ---
router.get('/media', (req, res) => {
  const db = dbEngine.get();
  let media = db.mediaLibrary || defaultMediaLibrary;
  const { category, search } = req.query;

  if (category && category !== 'all') {
    media = media.filter(m => (m.category || 'other').toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    media = media.filter(m => m.name.toLowerCase().includes(q) || (m.type && m.type.toLowerCase().includes(q)));
  }

  res.json({ success: true, data: media });
});

router.post('/media', (req, res) => {
  const { name, url, type, category, sizeKb, dimensions } = req.body;
  if (!name || !url) {
    return res.status(400).json({ success: false, message: 'Media name and URL are required.' });
  }

  const db = dbEngine.get();
  const newMedia = {
    id: `media-${Date.now()}`,
    name,
    url,
    type: type || 'image',
    category: category || 'other',
    sizeKb: sizeKb || Math.floor(Math.random() * 500 + 100),
    dimensions: dimensions || (type === 'document' ? 'PDF Document' : '1200 x 800'),
    uploadDate: new Date().toISOString().split('T')[0]
  };

  db.mediaLibrary = db.mediaLibrary || [ ...defaultMediaLibrary ];
  db.mediaLibrary.unshift(newMedia);
  dbEngine.logActivity('media', `Uploaded media asset: ${name}`);
  dbEngine.save(db);

  res.json({ success: true, message: 'Media asset uploaded successfully.', data: newMedia });
});

router.put('/media/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  const mediaIndex = (db.mediaLibrary || []).findIndex(m => m.id === id);
  if (mediaIndex === -1) {
    return res.status(404).json({ success: false, message: 'Media asset not found.' });
  }

  const updatedMedia = {
    ...db.mediaLibrary[mediaIndex],
    ...req.body,
    uploadDate: new Date().toISOString().split('T')[0]
  };
  db.mediaLibrary[mediaIndex] = updatedMedia;
  dbEngine.logActivity('media', `Replaced media asset: ${updatedMedia.name}`);
  dbEngine.save(db);

  res.json({ success: true, message: 'Media asset updated successfully.', data: updatedMedia });
});

router.delete('/media/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.mediaLibrary = (db.mediaLibrary || []).filter(m => m.id !== id);
  dbEngine.save(db);
  res.json({ success: true, message: 'Media asset deleted successfully.' });
});

// --- Resume Management & Versioning Endpoints ---
router.get('/resumes', (req, res) => {
  const db = dbEngine.get();
  res.json({ success: true, data: db.resumes || defaultResumes });
});

router.post('/resumes', (req, res) => {
  const { name, url, sizeKb } = req.body;
  if (!name || !url) {
    return res.status(400).json({ success: false, message: 'Resume file name and URL are required.' });
  }

  const db = dbEngine.get();
  const newResume = {
    id: `res-${Date.now()}`,
    name,
    url,
    uploadDate: new Date().toISOString().split('T')[0],
    sizeKb: sizeKb || 350,
    isActive: true
  };

  // Set all existing resumes to inactive
  db.resumes = (db.resumes || []).map(r => ({ ...r, isActive: false }));
  db.resumes.unshift(newResume);

  // Sync with personalInfo.resumeUrl
  if (db.personalInfo) {
    db.personalInfo.resumeUrl = url;
  }

  dbEngine.logActivity('resume', `Uploaded resume version: ${name}`);
  dbEngine.save(db);

  res.json({ success: true, message: 'Resume uploaded and set as active version.', data: newResume });
});

router.put('/resumes/:id/select', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  let selected = null;

  db.resumes = (db.resumes || []).map(r => {
    if (r.id === id) {
      selected = r;
      return { ...r, isActive: true };
    }
    return { ...r, isActive: false };
  });

  if (!selected) {
    return res.status(404).json({ success: false, message: 'Resume version not found.' });
  }

  if (db.personalInfo) {
    db.personalInfo.resumeUrl = selected.url;
  }

  dbEngine.logActivity('resume', `Set active resume version to: ${selected.name}`);
  dbEngine.save(db);

  res.json({ success: true, message: `Active resume version set to ${selected.name}`, data: selected });
});

router.delete('/resumes/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.resumes = (db.resumes || []).filter(r => r.id !== id);

  // If deleted resume was active, set the first remaining as active
  if (db.resumes.length > 0 && !db.resumes.some(r => r.isActive)) {
    db.resumes[0].isActive = true;
    if (db.personalInfo) {
      db.personalInfo.resumeUrl = db.resumes[0].url;
    }
  }

  dbEngine.save(db);
  res.json({ success: true, message: 'Resume version deleted.' });
});

// --- SEO, Branding & Slug Endpoints ---
router.get('/seo', (req, res) => {
  const db = dbEngine.get();
  res.json({ success: true, data: db.seo || defaultSeo });
});

router.put('/seo', (req, res) => {
  const db = dbEngine.get();
  db.seo = { ...db.seo, ...req.body };
  dbEngine.logActivity('seo', 'Updated SEO & Social Sharing Settings');
  dbEngine.save(db);
  res.json({ success: true, message: 'SEO settings saved successfully.', data: db.seo });
});

router.get('/branding', (req, res) => {
  const db = dbEngine.get();
  res.json({ success: true, data: db.branding || defaultBranding });
});

router.put('/branding', (req, res) => {
  const db = dbEngine.get();
  db.branding = { ...db.branding, ...req.body };
  dbEngine.logActivity('branding', 'Updated Website Branding & Favicon Settings');
  dbEngine.save(db);
  res.json({ success: true, message: 'Branding settings saved successfully.', data: db.branding });
});

router.put('/slug', (req, res) => {
  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ success: false, message: 'Slug is required.' });
  }

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const db = dbEngine.get();
  const activeClientId = db.activeClientId;

  // Validate duplicate slug among other clients
  const duplicate = (db.clients || []).find(c => c.id !== activeClientId && c.slug === cleanSlug);
  if (duplicate) {
    return res.status(400).json({ success: false, message: `Slug '${cleanSlug}' is already in use by client ${duplicate.name}.` });
  }

  const activeClient = (db.clients || []).find(c => c.id === activeClientId);
  if (activeClient) {
    activeClient.slug = cleanSlug;
  }

  dbEngine.logActivity('slug', `Updated portfolio URL slug to: /portfolio/${cleanSlug}`);
  dbEngine.save(db);

  res.json({
    success: true,
    message: 'Portfolio slug updated successfully.',
    slug: cleanSlug,
    publicUrl: `/portfolio/${cleanSlug}`
  });
});

// --- Publishing Center & Activities Endpoints ---
router.get('/activities', (req, res) => {
  const db = dbEngine.get();
  res.json({ success: true, data: db.activities || [] });
});

export default router;
