import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbEngine, defaultDesignConfig, defaultMediaLibrary, defaultResumes, defaultSeo, defaultBranding } from '../data/dbEngine.js';
import { JWT_SECRET, verifyToken } from '../middleware/authMiddleware.js';
import { visualTemplates } from '../templates/visualTemplates.js';
import {
  generateObjectKey,
  uploadToStorage,
  deleteFromStorage,
  getPresignedGetUrl,
  validateFile,
  ALLOWED_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../utils/storageService.js';

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
  const { 
    name, email, role, profession, industry, profileImage, slug, presetId, templateId,
    location, phone, github, linkedin, twitter, eyebrow, specialization, sections
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Client name and email are required.' });
  }

  const db = dbEngine.get();
  const newClientId = `client-${Date.now()}`;
  const clientSlug = generateUniqueSlug(slug, name, db.clients);

  const activeRole = role || profession || 'Software Professional';

  let starterPortfolio = {
    personalInfo: {
      name,
      email,
      role: activeRole,
      profession: profession || activeRole,
      industry: industry || 'Technology',
      eyebrow: eyebrow || (profession ? profession.toUpperCase() : 'PROFESSIONAL'),
      specialization: specialization || `${activeRole} Specialist`,
      tagline: `Professional Portfolio of ${name}`,
      shortBio: `${activeRole} passionate about building impactful solutions.`,
      bio: `${name} is a dedicated ${activeRole}.`,
      location: location || 'Telangana, India',
      availability: 'Available for New Projects & Consultations',
      phone: phone || '',
      github: github || 'https://github.com',
      linkedin: linkedin || 'https://linkedin.com',
      twitter: twitter || 'https://twitter.com',
      resumeUrl: '#',
      heroVisualType: 'image'
    },
    skills: [],
    projects: [],
    experience: [],
    education: [],
    services: [],
    blogs: [],
    testimonials: [],
    settings: {
      siteTitle: `${name} — ${activeRole}`,
      metaDescription: `Portfolio website of ${name}`,
      accentColor: 'emerald',
      themePreference: 'dark'
    },
    designConfig: {
      ...defaultDesignConfig,
      template: templateId || 'modern-dark'
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
            role: activeRole,
            profession: profession || presetObj.personalInfo.profession || activeRole,
            industry: industry || presetObj.personalInfo.industry || 'Technology',
            location: location || presetObj.personalInfo.location,
            phone: phone || presetObj.personalInfo.phone,
            github: github || presetObj.personalInfo.github,
            linkedin: linkedin || presetObj.personalInfo.linkedin,
            twitter: twitter || presetObj.personalInfo.twitter
          },
          settings: {
            ...presetObj.settings,
            siteTitle: `${name} — ${activeRole}`
          },
          designConfig: {
            ...(presetObj.designConfig || defaultDesignConfig),
            template: templateId || presetObj.designConfig?.template || 'modern-dark'
          }
        };
      } catch (err) {
        console.error('Error seeding client from preset:', err);
      }
    }
  }

  // Override template if explicitly chosen
  if (templateId) {
    const targetTemplate = visualTemplates.find(t => t.id === templateId);
    if (targetTemplate && targetTemplate.designConfig) {
      starterPortfolio.designConfig = {
        ...starterPortfolio.designConfig,
        ...targetTemplate.designConfig,
        template: templateId
      };
    }
  }

  // Override sections if custom section configuration passed
  if (Array.isArray(sections) && sections.length > 0) {
    starterPortfolio.designConfig = starterPortfolio.designConfig || { ...defaultDesignConfig };
    starterPortfolio.designConfig.sections = sections;
  }

  const newClient = {
    id: newClientId,
    name,
    email,
    role: activeRole,
    profession: profession || activeRole,
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
    message: `Portfolio for ${name} created successfully.`,
    data: newClient
  });
});

router.post('/clients/:id/duplicate', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  const sourceClient = (db.clients || []).find(c => c.id === id);
  if (!sourceClient) {
    return res.status(404).json({ success: false, message: 'Source portfolio not found.' });
  }

  const newId = `client-${Date.now()}`;
  const copyName = `${sourceClient.name} (Copy)`;
  const copySlug = generateUniqueSlug(`${sourceClient.slug}-copy`, copyName, db.clients);

  const duplicatedPortfolioData = JSON.parse(JSON.stringify(sourceClient.portfolioData || {}));
  if (duplicatedPortfolioData.personalInfo) {
    duplicatedPortfolioData.personalInfo.name = copyName;
  }

  const duplicatedClient = {
    ...JSON.parse(JSON.stringify(sourceClient)),
    id: newId,
    name: copyName,
    slug: copySlug,
    status: 'DRAFT',
    isDefault: false,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    lastPublishedAt: null,
    portfolioData: duplicatedPortfolioData
  };

  db.clients = db.clients || [];
  db.clients.push(duplicatedClient);
  dbEngine.save(db);

  res.json({ success: true, message: `Portfolio duplicated as '${copyName}'.`, data: duplicatedClient });
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

  // Validate social URLs if non-empty
  const socialKeys = ['github', 'linkedin', 'twitter', 'youtube', 'instagram', 'website'];
  for (const key of socialKeys) {
    if (req.body[key] && typeof req.body[key] === 'string' && req.body[key].trim()) {
      const val = req.body[key].trim();
      try {
        const u = new URL(val);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          return res.status(400).json({ success: false, message: `Invalid URL for ${key}. Must start with http:// or https://` });
        }
      } catch (_) {
        return res.status(400).json({ success: false, message: `Invalid URL for ${key}. Must start with http:// or https://` });
      }
    }
  }

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
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Project title is required' });
  }
  if (!description || !description.trim()) {
    return res.status(400).json({ success: false, message: 'Project description is required' });
  }

  const db = dbEngine.get();
  const newProject = {
    id: `proj-${Date.now()}`,
    ...req.body,
    title: title.trim(),
    description: description.trim(),
    featured: req.body.featured ?? true
  };
  db.projects = db.projects || [];
  db.projects.unshift(newProject);

  // Sync with active client portfolioData
  if (db.clients && db.activeClientId) {
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      activeClient.portfolioData.projects = db.projects;
    }
  }

  dbEngine.save(db);
  dbEngine.logActivity('project', `Added project: ${newProject.title}`);
  res.json({ success: true, message: 'Project added successfully', data: newProject });
});

router.put('/projects/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.projects = db.projects || [];
  const idx = db.projects.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  db.projects[idx] = { ...db.projects[idx], ...req.body };

  // Sync with active client portfolioData
  if (db.clients && db.activeClientId) {
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      activeClient.portfolioData.projects = db.projects;
    }
  }

  dbEngine.save(db);
  dbEngine.logActivity('project', `Updated project: ${db.projects[idx].title}`);
  res.json({ success: true, message: 'Project updated successfully', data: db.projects[idx] });
});

router.delete('/projects/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.projects = db.projects || [];
  const projectToDelete = db.projects.find(p => p.id === id);
  db.projects = db.projects.filter(p => p.id !== id);

  // Sync with active client portfolioData
  if (db.clients && db.activeClientId) {
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      activeClient.portfolioData.projects = db.projects;
    }
  }

  dbEngine.save(db);
  dbEngine.logActivity('project', `Deleted project: ${projectToDelete ? projectToDelete.title : id}`);
  res.json({ success: true, message: 'Project deleted successfully' });
});

// --- Experience & Education CRUD ---
router.post('/experience', (req, res) => {
  const { company, role } = req.body;
  if (!company || !company.trim()) {
    return res.status(400).json({ success: false, message: 'Company name is required' });
  }
  if (!role || !role.trim()) {
    return res.status(400).json({ success: false, message: 'Role title is required' });
  }

  const db = dbEngine.get();
  const newExp = {
    id: `exp-${Date.now()}`,
    ...req.body,
    company: company.trim(),
    role: role.trim(),
    period: req.body.period?.trim() || '2024 - Present',
    location: req.body.location?.trim() || 'Telangana, India',
    achievements: Array.isArray(req.body.achievements) ? req.body.achievements : [],
    type: req.body.type || 'Full-time'
  };

  db.experience = db.experience || [];
  db.experience.unshift(newExp);

  // Sync with active client portfolioData
  if (db.clients && db.activeClientId) {
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      activeClient.portfolioData.experience = db.experience;
    }
  }

  dbEngine.save(db);
  dbEngine.logActivity('experience', `Added work role: ${newExp.role} at ${newExp.company}`);
  res.json({ success: true, message: 'Experience added successfully', data: newExp });
});

router.put('/experience/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.experience = db.experience || [];
  const idx = db.experience.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Experience entry not found' });
  }

  const { company, role } = req.body;
  if (company !== undefined && !company.trim()) {
    return res.status(400).json({ success: false, message: 'Company name cannot be empty' });
  }
  if (role !== undefined && !role.trim()) {
    return res.status(400).json({ success: false, message: 'Role title cannot be empty' });
  }

  db.experience[idx] = {
    ...db.experience[idx],
    ...req.body,
    ...(company ? { company: company.trim() } : {}),
    ...(role ? { role: role.trim() } : {})
  };

  // Sync with active client portfolioData
  if (db.clients && db.activeClientId) {
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      activeClient.portfolioData.experience = db.experience;
    }
  }

  dbEngine.save(db);
  dbEngine.logActivity('experience', `Updated work role: ${db.experience[idx].role} at ${db.experience[idx].company}`);
  res.json({ success: true, message: 'Experience updated successfully', data: db.experience[idx] });
});

router.delete('/experience/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.experience = db.experience || [];
  const expToDelete = db.experience.find(e => e.id === id);
  db.experience = db.experience.filter(e => e.id !== id);

  // Sync with active client portfolioData
  if (db.clients && db.activeClientId) {
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      activeClient.portfolioData.experience = db.experience;
    }
  }

  dbEngine.save(db);
  dbEngine.logActivity('experience', `Deleted work role: ${expToDelete ? expToDelete.role : id}`);
  res.json({ success: true, message: 'Experience deleted successfully' });
});

// --- Education CRUD ---
router.post('/education', (req, res) => {
  const { institution, degree, fieldOfStudy } = req.body;
  if (!institution || !institution.trim()) {
    return res.status(400).json({ success: false, message: 'Institution name is required' });
  }
  if (!degree || !degree.trim()) {
    return res.status(400).json({ success: false, message: 'Degree / qualification is required' });
  }
  if (!fieldOfStudy || !fieldOfStudy.trim()) {
    return res.status(400).json({ success: false, message: 'Field of study is required' });
  }

  const db = dbEngine.get();
  const period = req.body.period?.trim() || (req.body.startDate && req.body.endDate 
    ? `${req.body.startDate.trim()} - ${req.body.endDate.trim()}`
    : (req.body.startDate ? `${req.body.startDate.trim()} - Present` : ''));

  const newEdu = {
    id: `edu-${Date.now()}`,
    institution: institution.trim(),
    degree: degree.trim(),
    fieldOfStudy: fieldOfStudy.trim(),
    period,
    startDate: req.body.startDate?.trim() || '',
    endDate: req.body.endDate?.trim() || '',
    location: req.body.location?.trim() || '',
    gradeGpa: req.body.gradeGpa?.trim() || '',
    description: req.body.description?.trim() || ''
  };

  db.education = db.education || [];
  db.education.unshift(newEdu);

  // Sync with active client portfolioData
  if (db.clients && db.activeClientId) {
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      activeClient.portfolioData.education = db.education;
    }
  }

  dbEngine.save(db);
  dbEngine.logActivity('education', `Added education: ${newEdu.degree} from ${newEdu.institution}`);
  res.json({ success: true, message: 'Education added successfully', data: newEdu });
});

router.put('/education/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.education = db.education || [];
  const idx = db.education.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Education entry not found' });
  }

  const { institution, degree, fieldOfStudy } = req.body;
  if (institution !== undefined && !institution.trim()) {
    return res.status(400).json({ success: false, message: 'Institution name cannot be empty' });
  }
  if (degree !== undefined && !degree.trim()) {
    return res.status(400).json({ success: false, message: 'Degree cannot be empty' });
  }
  if (fieldOfStudy !== undefined && !fieldOfStudy.trim()) {
    return res.status(400).json({ success: false, message: 'Field of study cannot be empty' });
  }

  const existing = db.education[idx];
  const startDate = req.body.startDate !== undefined ? req.body.startDate.trim() : (existing.startDate || '');
  const endDate = req.body.endDate !== undefined ? req.body.endDate.trim() : (existing.endDate || '');
  const period = req.body.period !== undefined ? req.body.period.trim() : (
    startDate && endDate ? `${startDate} - ${endDate}` : (existing.period || '')
  );

  db.education[idx] = {
    ...existing,
    ...req.body,
    ...(institution ? { institution: institution.trim() } : {}),
    ...(degree ? { degree: degree.trim() } : {}),
    ...(fieldOfStudy ? { fieldOfStudy: fieldOfStudy.trim() } : {}),
    period,
    startDate,
    endDate,
    ...(req.body.location !== undefined ? { location: req.body.location.trim() } : {}),
    ...(req.body.gradeGpa !== undefined ? { gradeGpa: req.body.gradeGpa.trim() } : {}),
    ...(req.body.description !== undefined ? { description: req.body.description.trim() } : {})
  };

  // Sync with active client portfolioData
  if (db.clients && db.activeClientId) {
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      activeClient.portfolioData.education = db.education;
    }
  }

  dbEngine.save(db);
  dbEngine.logActivity('education', `Updated education: ${db.education[idx].degree} from ${db.education[idx].institution}`);
  res.json({ success: true, message: 'Education updated successfully', data: db.education[idx] });
});

router.delete('/education/:id', (req, res) => {
  const { id } = req.params;
  const db = dbEngine.get();
  db.education = db.education || [];
  const eduToDelete = db.education.find(e => e.id === id);
  db.education = db.education.filter(e => e.id !== id);

  // Sync with active client portfolioData
  if (db.clients && db.activeClientId) {
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      activeClient.portfolioData.education = db.education;
    }
  }

  dbEngine.save(db);
  dbEngine.logActivity('education', `Deleted education: ${eduToDelete ? eduToDelete.degree : id}`);
  res.json({ success: true, message: 'Education deleted successfully' });
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

// --- Contact Form Settings ---
router.get('/contact-settings', (req, res) => {
  const db = dbEngine.get();
  const requestedClientId = req.query.clientId;
  const targetClient = requestedClientId
    ? (db.clients || []).find(c => c.id === requestedClientId)
    : (db.clients || []).find(c => c.id === db.activeClientId) || (db.clients || [])[0];

  if (!targetClient) {
    return res.status(404).json({ success: false, message: 'Portfolio client not found.' });
  }

  const pData = targetClient.portfolioData || {};
  const contactSettings = pData.contactSettings || (targetClient.id === db.activeClientId ? db.contactSettings : null) || {
    enabled: true,
    recipientEmail: targetClient.email || pData.personalInfo?.email || ''
  };

  res.json({
    success: true,
    data: {
      enabled: contactSettings.enabled !== false,
      recipientEmail: contactSettings.recipientEmail || ''
    },
    clientId: targetClient.id,
    clientName: targetClient.name
  });
});

router.put('/contact-settings', (req, res) => {
  const { enabled, recipientEmail, clientId } = req.body;
  const db = dbEngine.get();
  const targetClientId = clientId || req.query.clientId || db.activeClientId;
  const targetClient = (db.clients || []).find(c => c.id === targetClientId) || (db.clients || [])[0];

  if (!targetClient) {
    return res.status(404).json({ success: false, message: 'Target client not found.' });
  }

  // Validate recipientEmail if provided and non-empty
  if (recipientEmail !== undefined && recipientEmail !== null && recipientEmail.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid recipient email address.' });
    }
  }

  const updatedSettings = {
    enabled: enabled !== false,
    recipientEmail: (recipientEmail || '').trim()
  };

  if (!targetClient.portfolioData) {
    targetClient.portfolioData = {};
  }
  targetClient.portfolioData.contactSettings = updatedSettings;
  targetClient.lastUpdated = new Date().toISOString();

  // If this client is active, also synchronize root db.contactSettings
  if (targetClient.id === db.activeClientId) {
    db.contactSettings = updatedSettings;
  }

  dbEngine.save(db);
  dbEngine.logActivity(
    'contact_settings_update',
    `Updated contact form settings (Enabled: ${updatedSettings.enabled ? 'YES' : 'NO'}, Recipient: ${updatedSettings.recipientEmail || 'None'})`,
    targetClient.name
  );

  res.json({
    success: true,
    message: 'Contact form settings saved successfully.',
    data: updatedSettings,
    clientId: targetClient.id,
    clientName: targetClient.name
  });
});

// --- Contact Messages Inbox ---
router.get('/messages', (req, res) => {
  const db = dbEngine.get();
  const requestedClientId = req.query.clientId;
  const showAll = req.query.all === 'true';

  if (showAll) {
    return res.json({ success: true, data: db.messages || [] });
  }

  const targetClientId = requestedClientId || db.activeClientId;
  const filtered = (db.messages || []).filter(m => {
    // Legacy messages without clientId belong to active/default client
    if (!m.clientId) return true;
    return m.clientId === targetClientId;
  });

  res.json({ success: true, data: filtered, activeClientId: targetClientId });
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
  (db.clients || []).forEach(c => {
    if (c.portfolioData && Array.isArray(c.portfolioData.messages)) {
      c.portfolioData.messages = c.portfolioData.messages.filter(m => m.id !== id);
    }
  });
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

// multer: memory storage — file buffer never written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${file.mimetype}" is not allowed.`));
    }
  },
});

// GET /api/admin/media — list with optional category/search filters
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

// POST /api/admin/media/upload — binary file upload → Neon Object Storage
// Must be defined BEFORE /media/:id routes to avoid route conflict
//
// Custom middleware to call multer and intercept its errors (MIME rejection,
// file-too-large) so we return 400 instead of falling through to Express 500.
const uploadSingle = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      // MulterError codes: LIMIT_FILE_SIZE, LIMIT_UNEXPECTED_FILE, etc.
      const msg = err.message || 'File upload error.';
      return res.status(400).json({ success: false, message: msg });
    }
    next();
  });
};

router.post('/media/upload', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const { name, category } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Asset name is required.' });
    }

    // Validate MIME + size (multer fileFilter already checks MIME, but double-check here)
    const validation = validateFile(req.file.mimetype, req.file.size);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    // Determine portfolio context — admin context is always the active client
    const db = dbEngine.get();
    const portfolioId = db.activeClientId || 'client-1';

    const safeCategory = category || 'other';
    const objectKey = generateObjectKey(portfolioId, safeCategory, req.file.mimetype);

    // Upload binary to Neon Object Storage
    await uploadToStorage(req.file.buffer, objectKey, req.file.mimetype);

    // Build serve URL (admin preview goes through authenticated serve endpoint)
    const servePath = `/api/admin/media/serve/${encodeURIComponent(objectKey)}`;

    // Determine media type label
    const mediaType = req.file.mimetype === 'application/pdf' ? 'document' : 'image';

    // Persist metadata to db.mediaLibrary
    const newMedia = {
      id: `media-${Date.now()}`,
      name: name.trim(),
      url: servePath,              // Used for admin preview
      objectKey,                   // S3 key for deletion / serve
      portfolioId,
      type: mediaType,
      category: safeCategory,
      mimeType: req.file.mimetype,
      sizeKb: Math.round(req.file.size / 1024),
      dimensions: mediaType === 'document' ? 'PDF Document' : 'Uploaded',
      uploadDate: new Date().toISOString().split('T')[0],
      storageBackend: 'neon',
    };

    db.mediaLibrary = db.mediaLibrary || [];
    db.mediaLibrary.unshift(newMedia);

    try {
      // save() BEFORE logActivity() — see delete route comment for explanation
      dbEngine.save(db);
    } catch (dbErr) {
      // Metadata save failed — clean up the orphaned S3 object
      console.error('[Media Upload] Metadata save failed, attempting S3 cleanup:', dbErr.message);
      await deleteFromStorage(objectKey).catch(e =>
        console.error('[Media Upload] S3 cleanup also failed:', e.message)
      );
      return res.status(500).json({
        success: false,
        message: 'File stored but metadata save failed. File has been removed. Please retry.',
      });
    }

    dbEngine.logActivity('media', `Uploaded asset to Neon storage: ${name}`);
    res.json({ success: true, message: 'Media asset uploaded to Neon Object Storage.', data: newMedia });
  } catch (err) {
    console.error('[Media Upload] Error:', err.message);
    if (err.message && err.message.startsWith('File type')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
});

// GET /api/admin/media/serve/*objectKey — generate presigned URL for admin preview
// Returns JSON { success, presignedUrl } — do NOT redirect.
// An <img> tag cannot attach Authorization headers and cannot follow auth-required
// redirects. The frontend fetches this endpoint with the Bearer token and uses the
// returned presignedUrl as the <img src>.
router.get('/media/serve/*objectKey', async (req, res) => {
  try {
    const objectKey = decodeURIComponent(req.params.objectKey);

    // Verify the objectKey actually belongs to a record in this admin's media library
    const db = dbEngine.get();
    const record = (db.mediaLibrary || []).find(m => m.objectKey === objectKey);
    if (!record) {
      console.warn('[Media Serve] objectKey not found in media library:', objectKey);
      return res.status(404).json({ success: false, message: 'Media record not found.' });
    }

    // Generate a short-lived presigned GET URL — bucket stays private
    const presignedUrl = await getPresignedGetUrl(objectKey, 3600);

    // Return the URL as JSON — frontend uses it as <img src>
    res.json({ success: true, presignedUrl });
  } catch (err) {
    console.error('[Media Serve] Error generating presigned URL:', err.name, '-', err.message);
    res.status(500).json({ success: false, message: 'Could not generate access URL: ' + err.message });
  }
});

// POST /api/admin/media/:id/replace — upload a new file for a Neon-stored asset
// Safe replace: upload new → update metadata → delete old (only if both succeed)
router.post('/media/:id/replace', uploadSingle, async (req, res) => {
  try {
    const { id } = req.params;
    const db = dbEngine.get();
    const mediaIndex = (db.mediaLibrary || []).findIndex(m => m.id === id);

    if (mediaIndex === -1) {
      return res.status(404).json({ success: false, message: 'Media asset not found.' });
    }

    const existingRecord = db.mediaLibrary[mediaIndex];

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No replacement file provided.' });
    }

    const validation = validateFile(req.file.mimetype, req.file.size);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    const portfolioId = existingRecord.portfolioId || db.activeClientId || 'client-1';
    const oldObjectKey = existingRecord.objectKey;
    const newObjectKey = generateObjectKey(portfolioId, existingRecord.category, req.file.mimetype);

    // Step 1: Upload new object FIRST — if this fails, the old object is untouched
    await uploadToStorage(req.file.buffer, newObjectKey, req.file.mimetype);

    // Step 2: Update metadata — if this fails, attempt to delete the NEW object (orphan cleanup)
    const mediaType = req.file.mimetype === 'application/pdf' ? 'document' : 'image';
    const updatedRecord = {
      ...existingRecord,
      objectKey: newObjectKey,
      url: `/api/admin/media/serve/${encodeURIComponent(newObjectKey)}`,
      type: mediaType,
      mimeType: req.file.mimetype,
      sizeKb: Math.round(req.file.size / 1024),
      uploadDate: new Date().toISOString().split('T')[0],
    };
    db.mediaLibrary[mediaIndex] = updatedRecord;

    try {
      dbEngine.save(db);
    } catch (dbErr) {
      // Metadata update failed — clean up the newly uploaded object, keep old
      console.error('[Media Replace] Metadata save failed, cleaning up new object:', dbErr.message);
      await deleteFromStorage(newObjectKey).catch(e =>
        console.error('[Media Replace] New object cleanup failed:', e.message)
      );
      return res.status(500).json({
        success: false,
        message: 'Replacement upload succeeded but metadata update failed. Old asset preserved.',
      });
    }

    // Step 3: Only now delete the old object (metadata is committed)
    if (oldObjectKey && existingRecord.storageBackend === 'neon') {
      await deleteFromStorage(oldObjectKey).catch(e =>
        console.error('[Media Replace] Old object deletion failed (non-fatal):', e.message)
      );
    }

    dbEngine.logActivity('media', `Replaced Neon asset: ${updatedRecord.name}`);
    res.json({ success: true, message: 'Media asset replaced successfully.', data: updatedRecord });
  } catch (err) {
    console.error('[Media Replace] Error:', err.name, '-', err.message);
    res.status(500).json({ success: false, message: 'Replace failed: ' + err.message });
  }
});

// POST /api/admin/media — URL-paste mode (backward-compatible, still supported)
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
    uploadDate: new Date().toISOString().split('T')[0],
    storageBackend: 'url',  // Marks this as a URL-reference record
  };

  db.mediaLibrary = db.mediaLibrary || [ ...defaultMediaLibrary ];
  db.mediaLibrary.unshift(newMedia);
  // save() BEFORE logActivity() — see delete route comment for explanation
  dbEngine.save(db);
  dbEngine.logActivity('media', `Saved media URL reference: ${name}`);

  res.json({ success: true, message: 'Media asset saved successfully.', data: newMedia });
});

// PUT /api/admin/media/:id — update metadata
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
    // Prevent client from overwriting objectKey or storageBackend
    objectKey: db.mediaLibrary[mediaIndex].objectKey,
    storageBackend: db.mediaLibrary[mediaIndex].storageBackend,
    uploadDate: new Date().toISOString().split('T')[0]
  };
  db.mediaLibrary[mediaIndex] = updatedMedia;
  dbEngine.logActivity('media', `Updated media asset: ${updatedMedia.name}`);
  dbEngine.save(db);

  res.json({ success: true, message: 'Media asset updated successfully.', data: updatedMedia });
});

// DELETE /api/admin/media/:id — delete metadata + S3 object (if present)
router.delete('/media/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = dbEngine.get();
    const record = (db.mediaLibrary || []).find(m => m.id === id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Media asset not found.' });
    }

    // Delete the S3 object first if this is a Neon-stored asset
    if (record.objectKey && record.storageBackend === 'neon') {
      try {
        await deleteFromStorage(record.objectKey);
      } catch (s3Err) {
        console.error('[Media Delete] S3 deletion error (continuing):', s3Err.message);
        // Continue to remove metadata even if S3 deletion fails to avoid orphaned records
      }
    }

    // Remove metadata from array
    db.mediaLibrary = (db.mediaLibrary || []).filter(m => m.id !== id);
    // IMPORTANT: save() BEFORE logActivity() — logActivity calls dbEngine.get() internally
    // which runs ensureMultiClientStructure() and resets db.mediaLibrary from the active
    // client's portfolioData (which hasn't been updated yet). Saving first commits the change.
    dbEngine.save(db);
    dbEngine.logActivity('media', `Deleted media asset: ${record.name}`);

    res.json({ success: true, message: 'Media asset deleted successfully.' });
  } catch (err) {
    console.error('[Media Delete] Error:', err.message);
    res.status(500).json({ success: false, message: 'Delete failed: ' + err.message });
  }
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

  // Also sync with active client's portfolioData
  if (db.clients && db.activeClientId) {
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      activeClient.portfolioData.resumes = db.resumes;
      if (activeClient.portfolioData.personalInfo) {
        activeClient.portfolioData.personalInfo.resumeUrl = url;
      }
    }
  }

  dbEngine.save(db);
  dbEngine.logActivity('resume', `Uploaded resume version: ${name}`);

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

  // Also sync with active client's portfolioData
  if (db.clients && db.activeClientId) {
    const activeClient = db.clients.find(c => c.id === db.activeClientId);
    if (activeClient && activeClient.portfolioData) {
      activeClient.portfolioData.resumes = db.resumes;
      if (activeClient.portfolioData.personalInfo) {
        activeClient.portfolioData.personalInfo.resumeUrl = selected.url;
      }
    }
  }

  dbEngine.save(db);
  dbEngine.logActivity('resume', `Set active resume version to: ${selected.name}`);

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

// --- Admin Account Settings Endpoints (Super Admin Only) ---
router.get('/account', (req, res) => {
  const db = dbEngine.get();
  const admin = db.adminUser || { username: 'admin', password: 'admin123' };
  // Strictly return only non-sensitive account metadata
  res.json({
    success: true,
    data: {
      username: admin.username,
      role: 'ADMIN'
    }
  });
});

router.put('/account', async (req, res) => {
  const { currentPassword, newUsername, newPassword, confirmPassword } = req.body;
  const db = dbEngine.get();
  const admin = db.adminUser || { username: 'admin', password: 'admin123' };

  // 1. Current password is mandatory to authorize any credential changes
  if (!currentPassword || typeof currentPassword !== 'string' || !currentPassword.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Current password is required to verify identity.'
    });
  }

  // 2. Verify current password against stored credentials (bcrypt hash or legacy plaintext)
  let isCurrentMatch = false;
  if (admin.password && (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'))) {
    isCurrentMatch = await bcrypt.compare(currentPassword, admin.password);
  } else {
    isCurrentMatch = (admin.password === currentPassword);
  }

  if (!isCurrentMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password verification failed. Please check your password and try again.'
    });
  }

  let updatedUsername = admin.username;
  let updatedPassword = admin.password;
  let usernameChanged = false;
  let passwordChanged = false;

  // 3. Validate and apply Username Change if specified
  if (newUsername !== undefined && newUsername !== null) {
    const trimmedUser = String(newUsername).trim();
    if (trimmedUser.length < 3 || trimmedUser.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 50 characters long.'
      });
    }
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(trimmedUser)) {
      return res.status(400).json({
        success: false,
        message: 'Username can only contain letters, numbers, hyphens, underscores, and dots.'
      });
    }
    if (trimmedUser !== admin.username) {
      updatedUsername = trimmedUser;
      usernameChanged = true;
    }
  }

  // 4. Validate and apply Password Change if specified
  if (newPassword || confirmPassword) {
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both new password and confirm password are required.'
      });
    }
    if (typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password fields must be valid text.'
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation password do not match.'
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }
    if (newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot exceed 128 characters.'
      });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password.'
      });
    }

    // Hash new password using bcryptjs (10 salt rounds)
    updatedPassword = await bcrypt.hash(newPassword, 10);
    passwordChanged = true;
  }

  // 5. Ensure at least one credential modification occurred
  if (!usernameChanged && !passwordChanged) {
    return res.status(400).json({
      success: false,
      message: 'No changes detected. Please specify a new username or new password.'
    });
  }

  // 6. Persist updated adminUser to database
  db.adminUser = {
    username: updatedUsername,
    password: updatedPassword
  };
  dbEngine.save(db);

  dbEngine.logActivity(
    'account_update',
    `Super Admin credentials updated${usernameChanged ? ' (username changed)' : ''}${passwordChanged ? ' (password changed)' : ''}`,
    updatedUsername
  );

  // 7. Issue refreshed JWT token reflecting updated identity
  const newToken = jwt.sign(
    { username: updatedUsername, role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: passwordChanged
      ? 'Admin credentials successfully updated. For security, please sign in with your new password.'
      : 'Admin username successfully updated.',
    user: { username: updatedUsername, role: 'ADMIN' },
    token: newToken,
    usernameChanged,
    passwordChanged,
    requireRelogin: passwordChanged
  });
});

export default router;
