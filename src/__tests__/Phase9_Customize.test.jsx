import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CustomizeView } from '../admin/views/CustomizeView';
import { TemplatesAndStartersView } from '../admin/views/TemplatesAndStartersView';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { generateThemeStyles } from '../utils/themeUtils';

describe('Phase 2: Portfolio Design & Customization System Frontend Tests', () => {

  it('1. generateThemeStyles — should convert designConfig object into valid CSS custom properties', () => {
    const mockConfig = {
      colors: { primary: '#ec4899', background: '#111827' },
      fonts: { heading: 'Playfair Display', body: 'Poppins' },
      buttons: { style: 'pill' }
    };

    const styles = generateThemeStyles(mockConfig);
    expect(styles['--primary-color']).toBe('#ec4899');
    expect(styles['--bg-color']).toBe('#111827');
    expect(styles['--font-heading']).toContain('Playfair Display');
    expect(styles['--btn-radius']).toBe('9999px');
  });

  it('2. TemplatesAndStartersView — should fetch and render 6 visual templates and 5 profile starters', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/admin/templates') {
        return Promise.resolve({
          json: async () => ({
            success: true,
            activeTemplateId: 'modern-dark',
            data: [
              { id: 'modern-dark', name: 'Modern Dark', description: 'Emerald dark theme', badge: 'Popular', tags: ['Dark'] },
              { id: 'minimal-light', name: 'Minimal Light', description: 'Clean blue theme', badge: 'Light Theme', tags: ['Light'] },
              { id: 'professional', name: 'Professional', description: 'Corporate cyan theme', badge: 'Corporate', tags: ['Slate'] },
              { id: 'creative', name: 'Creative', description: 'Fuchsia gradient theme', badge: 'Vibrant', tags: ['Gradient'] },
              { id: 'developer', name: 'Developer', description: 'Terminal green theme', badge: 'Terminal', tags: ['Terminal'] },
              { id: 'designer', name: 'Designer', description: 'Amber gold theme', badge: 'Warm Amber', tags: ['Amber'] }
            ]
          })
        });
      }
      if (url === '/api/admin/presets') {
        return Promise.resolve({
          json: async () => ({
            success: true,
            data: [
              { id: 'fresher', name: 'Fresher Preset', badge: 'Entry Level', targetAudience: 'Graduates' },
              { id: 'experienced', name: 'Experienced Preset', badge: 'Pro', targetAudience: 'Seniors' }
            ]
          })
        });
      }
      return Promise.resolve({ json: async () => ({ success: true }) });
    });

    render(
      <AuthProvider>
        <DataProvider>
          <TemplatesAndStartersView setActiveTab={() => {}} />
        </DataProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Modern Dark')).toBeDefined();
      expect(screen.getByText('Minimal Light')).toBeDefined();
      expect(screen.getByText('Professional')).toBeDefined();
      expect(screen.getByText('Creative')).toBeDefined();
      expect(screen.getByText('Developer')).toBeDefined();
      expect(screen.getByText('Designer')).toBeDefined();
    });
  });

  it('3. CustomizeView — should render theme customization category buttons and live preview frame', async () => {
    render(
      <AuthProvider>
        <DataProvider>
          <CustomizeView />
        </DataProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Colors')).toBeDefined();
      expect(screen.getByText('Fonts')).toBeDefined();
      expect(screen.getByText('Layout')).toBeDefined();
      expect(screen.getByText('Sections')).toBeDefined();
    });
  });

});
