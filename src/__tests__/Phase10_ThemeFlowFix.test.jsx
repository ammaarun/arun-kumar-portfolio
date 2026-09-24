import { describe, test, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { generateThemeStyles, defaultDesignConfig } from '../utils/themeUtils';
import { dbEngine } from '../../server/data/dbEngine';
import { visualTemplates } from '../../server/templates/visualTemplates';

describe('Phase 10: Theme & Template Flow Fix Integration Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('1. generateThemeStyles — generates dynamic CSS custom properties from designConfig', () => {
    const customConfig = {
      template: 'minimal-light',
      themeMode: 'light',
      colors: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        accent: '#1d4ed8',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a'
      },
      fonts: {
        heading: 'Space Grotesk',
        body: 'Inter'
      },
      buttons: {
        style: 'pill'
      }
    };

    const styles = generateThemeStyles(customConfig);
    expect(styles['--primary-color']).toBe('#2563eb');
    expect(styles['--bg-color']).toBe('#ffffff');
    expect(styles['--btn-radius']).toBe('9999px');
    expect(styles['--font-heading']).toContain('Space Grotesk');
  });

  test('2. Visual Template applying updates ONLY designConfig while preserving client content', () => {
    const db = dbEngine.get();
    const activeClientId = db.activeClientId || 'client-1';
    const activeClient = db.clients.find(c => c.id === activeClientId);

    const originalName = activeClient.portfolioData.personalInfo.name;
    const originalProjectsCount = activeClient.portfolioData.projects.length;

    // Apply template 'minimal-light'
    const template = visualTemplates.find(t => t.id === 'minimal-light');
    expect(template).toBeDefined();

    db.designConfig = {
      ...db.designConfig,
      ...template.designConfig
    };
    dbEngine.save(db);

    const updatedDb = dbEngine.get();
    const updatedClient = updatedDb.clients.find(c => c.id === activeClientId);

    // Verify visual design updated
    expect(updatedClient.portfolioData.designConfig.template).toBe('minimal-light');
    expect(updatedClient.portfolioData.designConfig.colors.primary).toBe('#2563eb');

    // Verify client content remains 100% preserved
    expect(updatedClient.portfolioData.personalInfo.name).toBe(originalName);
    expect(updatedClient.portfolioData.projects.length).toBe(originalProjectsCount);
  });

  test('3. Client Isolation — Modifying Client A design does NOT modify Client B design', () => {
    const db = dbEngine.get();

    // Create Client B if not present or explicitly set primary color
    let c2 = db.clients.find(c => c.id === 'client-2');
    if (!c2) {
      c2 = {
        id: 'client-2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'UX Designer',
        portfolioData: {
          personalInfo: { name: 'Jane Doe', email: 'jane@example.com' },
          projects: [],
          skills: [],
          designConfig: { ...defaultDesignConfig, template: 'creative', colors: { ...defaultDesignConfig.colors, primary: '#ec4899' } }
        }
      };
      db.clients.push(c2);
    } else {
      if (!c2.portfolioData) c2.portfolioData = {};
      if (!c2.portfolioData.designConfig) c2.portfolioData.designConfig = { ...defaultDesignConfig };
      if (!c2.portfolioData.designConfig.colors) c2.portfolioData.designConfig.colors = { ...defaultDesignConfig.colors };
      c2.portfolioData.designConfig.colors.primary = '#ec4899';
    }
    dbEngine.save(db);

    // Switch to Client 1 and modify design to Ocean Blue
    dbEngine.switchActiveClient('client-1');
    const client1Db = dbEngine.get();
    client1Db.designConfig.colors.primary = '#2563eb';
    dbEngine.save(client1Db);

    // Switch to Client 2 and verify primary color remains unchanged (#ec4899)
    dbEngine.switchActiveClient('client-2');
    const client2Db = dbEngine.get();
    expect(client2Db.designConfig.colors.primary).toBe('#ec4899');
  });

});
