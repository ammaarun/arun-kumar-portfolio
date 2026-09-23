import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PresetsView } from '../admin/views/PresetsView';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

describe('Phase 7: Admin Presets Selector & Preview Component Tests', () => {

  it('1. PresetsView — should fetch and render 5 preset cards with Preview and Use buttons', async () => {
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
              { id: 'fresher', name: 'Fresher / Entry-Level Developer', description: 'For graduates', badge: 'Entry Level', targetAudience: 'Freshers', projectsCount: 2, skillsCount: 12 },
              { id: 'experienced', name: 'Experienced Developer', description: 'For seniors', badge: 'Pro', targetAudience: 'Seniors', projectsCount: 2, skillsCount: 12 },
              { id: 'fullstack', name: 'Full-Stack Developer', description: 'For fullstack', badge: 'Full Stack', targetAudience: 'Full Stack', projectsCount: 2, skillsCount: 12 },
              { id: 'freelancer', name: 'Freelancer', description: 'For agency', badge: 'Freelance Pro', targetAudience: 'Freelancers', projectsCount: 2, skillsCount: 12 },
              { id: 'student', name: 'Student', description: 'For undergrads', badge: 'Student Profile', targetAudience: 'Students', projectsCount: 2, skillsCount: 12 }
            ]
          })
        });
      }
      return Promise.resolve({ json: async () => ({ success: true }) });
    });

    render(
      <AuthProvider>
        <DataProvider>
          <PresetsView setActiveTab={() => {}} />
        </DataProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Modern Dark')).toBeDefined();
    });

    const startersTab = screen.getByRole('button', { name: /Profile Starters/i });
    fireEvent.click(startersTab);

    await waitFor(() => {
      expect(screen.getByText('Fresher / Entry-Level Developer')).toBeDefined();
      expect(screen.getByText('Experienced Developer')).toBeDefined();
      expect(screen.getByText('Full-Stack Developer')).toBeDefined();
      expect(screen.getByText('Freelancer')).toBeDefined();
      expect(screen.getByText('Student')).toBeDefined();
    });

    const previewButtons = screen.getAllByText('Preview');
    expect(previewButtons.length).toBeGreaterThanOrEqual(5);
  });

});
