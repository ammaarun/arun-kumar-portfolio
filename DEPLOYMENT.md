# 🚀 Production Deployment Guide - Portfolio CMS

This guide details step-by-step instructions for deploying your **Personal Brand & Portfolio CMS** to popular free and cloud hosting platforms.

---

## 🌟 Quick Options Overview

| Platform | Difficulty | Cost | Database Persistence | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Render.com** (Recommended) | 🟢 Very Easy | 🆓 Free Tier | ✅ Yes (Disk / Environment) | 1-Click Full-Stack Hosting |
| **Railway.app** | 🟢 Very Easy | 🆓 Free Trial | ✅ Yes (Volume Mounts) | High Performance Node Apps |
| **Docker Container** | 🟡 Medium | 🆓 Free (Self-Hosted) | ✅ Yes (Mounted Volumes) | Any Cloud / VPS (DigitalOcean, AWS) |
| **Vercel** | 🟢 Very Easy | 🆓 Free Tier | ⚠️ Serverless | Static Frontend + Serverless API |

---

## 🔹 Option A: Render.com (1-Click Deployment - Recommended)

Render provides free hosting for web services with automatic Git continuous deployment.

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: production deployment configuration"
   git push origin main
   ```
2. **Sign up at [Render.com](https://render.com/)**.
3. Click **New +** → **Blueprint**.
4. Connect your GitHub repository (`portfolio`).
5. Render will automatically detect `render.yaml` and launch your service!
6. Your live site URL will be available at `https://your-portfolio.onrender.com`.

---

## 🔹 Option B: Docker Container Deployment

If you want to host on your own VPS (DigitalOcean, AWS EC2, Linode) or test production locally:

1. **Build the Docker Image**:
   ```bash
   docker build -t portfolio-cms:latest .
   ```
2. **Run with Docker Compose (Recommended)**:
   ```bash
   docker compose up -d --build
   ```
3. Open `http://localhost:5000` in your browser!
4. The database file `server/data/db.json` is mounted as a volume, so edits made via your Admin Dashboard persist even when restarting Docker!

---

## 🔹 Option C: Railway.app Deployment

1. Sign up at [Railway.app](https://railway.app/).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `portfolio` repository.
4. Set Build Command: `npm install && npm run build`.
5. Set Start Command: `node server/index.js`.
6. Railway will deploy your app and generate a public `.up.railway.app` URL.

---

## 🔒 Security Best Practices for Production

1. **Change Default Admin Password**:
   - Log into your Admin Dashboard at `/admin/login`.
   - Go to **Settings** and update your admin username and password.
2. **Set JWT Secret Environment Variable**:
   - In production platforms (Render/Railway), set an environment variable:
     `JWT_SECRET=your_super_secret_production_key_here`
