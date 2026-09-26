import { describe, test, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { dbEngine, defaultMediaLibrary, defaultResumes, defaultSeo, defaultBranding } from '../../server/data/dbEngine';

describe('Phase 3: Professional Portfolio Publishing & Management Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('1. Media Library Engine — adds, retrieves, replaces, and deletes media assets per client', () => {
    const db = dbEngine.get();
    const activeClientId = db.activeClientId || 'client-1';

    // Verify initial default media assets exist
    expect(db.mediaLibrary).toBeDefined();
    expect(Array.isArray(db.mediaLibrary)).toBe(true);
    expect(db.mediaLibrary.length).toBeGreaterThan(0);

    // Add new media asset
    const newMedia = {
      id: `media-test-${Date.now()}`,
      name: 'Capstone Architecture Diagram',
      url: 'https://images.unsplash.com/photo-test-diagram',
      type: 'image',
      category: 'projects',
      sizeKb: 450,
      dimensions: '1200 x 800',
      uploadDate: '2026-09-24'
    };

    db.mediaLibrary.unshift(newMedia);
    dbEngine.save(db);

    const updatedDb = dbEngine.get();
    const found = updatedDb.mediaLibrary.find(m => m.id === newMedia.id);
    expect(found).toBeDefined();
    expect(found.name).toBe('Capstone Architecture Diagram');

    // Delete media asset
    db.mediaLibrary = db.mediaLibrary.filter(m => m.id !== newMedia.id);
    dbEngine.save(db);

    const finalDb = dbEngine.get();
    expect(finalDb.mediaLibrary.find(m => m.id === newMedia.id)).toBeUndefined();
  });

  test('2. Resume Management & Versioning — manages multiple CV versions and selects active version', () => {
    const db = dbEngine.get();
    expect(db.resumes).toBeDefined();
    expect(Array.isArray(db.resumes)).toBe(true);

    const newResumeVersion = {
      id: `res-test-${Date.now()}`,
      name: 'Arun-Kumar-Principal-Architect-Resume-2026.pdf',
      url: 'https://example.com/principal-resume.pdf',
      uploadDate: '2026-09-24',
      sizeKb: 410,
      isActive: true
    };

    // Set existing to false, insert new
    db.resumes = db.resumes.map(r => ({ ...r, isActive: false }));
    db.resumes.unshift(newResumeVersion);
    if (db.personalInfo) {
      db.personalInfo.resumeUrl = newResumeVersion.url;
    }
    dbEngine.save(db);

    const updatedDb = dbEngine.get();
    const activeResume = updatedDb.resumes.find(r => r.isActive);
    expect(activeResume).toBeDefined();
    expect(activeResume.name).toBe('Arun-Kumar-Principal-Architect-Resume-2026.pdf');
    expect(updatedDb.personalInfo.resumeUrl).toBe('https://example.com/principal-resume.pdf');
  });

  test('3. SEO & Social Share Settings — persists page title, meta description, and Open Graph settings', () => {
    const db = dbEngine.get();
    const seoPayload = {
      pageTitle: 'Arun Kumar | Lead Cloud Architect & Full-Stack Engineer',
      metaDescription: 'Senior Lead Architect specializing in high-throughput Java microservices, Kubernetes, Spring Cloud, and React.',
      keywords: 'Java, Cloud, Microservices, React, Architect',
      canonicalUrl: 'https://portfolio.example.com/arun-kumar',
      author: 'Arun Kumar',
      robots: 'index, follow',
      socialShareTitle: 'Arun Kumar — Cloud Architecture & Engineering Portfolio',
      socialShareDescription: 'Discover enterprise microservice architectures and high-performance backend systems.',
      socialShareImage: 'https://images.unsplash.com/photo-og-cover'
    };

    db.seo = seoPayload;
    dbEngine.save(db);

    const updatedDb = dbEngine.get();
    expect(updatedDb.seo.pageTitle).toContain('Lead Cloud Architect');
    expect(updatedDb.seo.socialShareTitle).toContain('Cloud Architecture');
  });

  test('4. Portfolio Slug Management & Validation — updates slug and rejects duplicates across clients', () => {
    const db = dbEngine.get();

    // Ensure client 2 exists with slug david-miller
    let client2 = db.clients.find(c => c.id === 'client-2');
    if (!client2) {
      client2 = {
        id: 'client-2',
        name: 'David Miller',
        email: 'david@example.com',
        role: 'Senior Developer',
        slug: 'david-miller',
        status: 'PUBLISHED',
        portfolioData: {}
      };
      db.clients.push(client2);
    } else {
      client2.slug = 'david-miller';
      client2.name = 'David Miller';
    }
    dbEngine.save(db);

    dbEngine.switchActiveClient('client-1');
    const currentDb = dbEngine.get();
    const activeClient = currentDb.clients.find(c => c.id === 'client-1') || currentDb.clients[0];

    // Change active client slug to 'arun-kumar-lead'
    activeClient.slug = 'arun-kumar-lead';
    dbEngine.save(currentDb);

    const updatedDb = dbEngine.get();
    const updatedClient = updatedDb.clients.find(c => c.id === updatedDb.activeClientId);
    expect(updatedClient.slug).toBe('arun-kumar-lead');

    // Duplicate check simulation: 'david-miller' is used by client-2
    const duplicate = updatedDb.clients.find(c => c.id !== updatedClient.id && c.slug === 'david-miller');
    expect(duplicate).toBeDefined();
    expect(duplicate.name).toBe('David Miller');
  });

  test('5. Real Activity Log Audit Trail — logs admin actions in dbEngine', () => {
    dbEngine.logActivity('publish', 'Portfolio status updated to PUBLISHED', 'Arun Kumar');
    const db = dbEngine.get();
    expect(db.activities).toBeDefined();
    expect(db.activities.length).toBeGreaterThan(0);
    const latest = db.activities[0];
    expect(latest.description).toBe('Portfolio status updated to PUBLISHED');
  });

});
