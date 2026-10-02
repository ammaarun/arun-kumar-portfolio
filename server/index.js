import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __rootDir = resolve(__dirname, '..');

// Load .env, then .env.local overrides (Neon DATABASE_URL lives in .env.local)
dotenv.config({ path: resolve(__rootDir, '.env') });
const localEnvPath = resolve(__rootDir, '.env.local');
if (existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath, override: true });
}

import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { dbEngine } from './data/dbEngine.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static frontend assets in production
const distPath = path.resolve(__dirname, '../dist');
const indexHtml = path.resolve(distPath, 'index.html');

app.use(express.static(distPath));

// SPA catch-all route for client-side routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(indexHtml, (err) => {
    if (err) next();
  });
});

async function startServer() {
  await dbEngine.init();
  app.listen(PORT, () => {
    console.log(`🚀 Portfolio CMS Server running at http://localhost:${PORT}`);
  });
}

startServer();
