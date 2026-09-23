import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ClientsView } from '../admin/views/ClientsView';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { calculatePortfolioCompletion } from '../utils/portfolioUtils';

describe('Multi-Client Platform Frontend Component & Utilities Tests', () => {

  it('1. calculatePortfolioCompletion — should accurately compute completion percentage and checklist items', () => {
    const mockPortfolio = {
      personalInfo: {
        name: 'Arun Kumar',
        role: 'Full Stack Engineer',
        location: 'Hyderabad',
        bio: 'Comprehensive detailed bio description for testing completion logic.',
        email: 'arun@example.com',
        phone: '+91 9876543210',
        github: 'https://github.com/test',
        linkedin: 'https://linkedin.com/in/test',
        resumeUrl: 'https://example.com/resume.pdf',
        image: 'https://example.com/photo.jpg'
      },
      skills: [
        { category: 'Frontend', items: [{ name: 'React' }, { name: 'Tailwind' }, { name: 'TypeScript' }] }
      ],
      projects: [{ id: '1', title: 'Portfolio Platform' }],
      experience: [{ id: '1', role: 'Developer' }],
      education: [{ id: '1', degree: 'B.Tech' }],
      services: [{ id: '1', title: 'Web Development' }],
      testimonials: [{ id: '1', visible: true }]
    };

    const result = calculatePortfolioCompletion(mockPortfolio);
    expect(result.percentage).toBe(100);
    expect(result.completedCount).toBe(12);
    expect(result.items.length).toBe(12);
  });

  it('2. ClientsView — should fetch and render client portfolios list with Manage Portfolio button', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/admin/clients')) {
        return Promise.resolve({
          json: async () => ({
            success: true,
            activeClientId: 'client-1',
            data: [
              {
                id: 'client-1',
                name: 'Arun Kumar',
                email: 'arun@example.com',
                role: 'Full Stack Engineer',
                status: 'PUBLISHED',
                projectsCount: 4,
                skillsCount: 16,
                lastUpdated: new Date().toISOString()
              },
              {
                id: 'client-2',
                name: 'Priya Sharma',
                email: 'priya@example.com',
                role: 'Frontend Developer',
                status: 'DRAFT',
                projectsCount: 2,
                skillsCount: 8,
                lastUpdated: new Date().toISOString()
              }
            ]
          })
        });
      }
      if (url === '/api/admin/presets') {
        return Promise.resolve({
          json: async () => ({
            success: true,
            data: [
              { id: 'fresher', name: 'Fresher Preset' },
              { id: 'experienced', name: 'Experienced Preset' }
            ]
          })
        });
      }
      return Promise.resolve({ json: async () => ({ success: true }) });
    });

    render(
      <AuthProvider>
        <DataProvider>
          <ClientsView setActiveTab={() => {}} />
        </DataProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Arun Kumar')).toBeDefined();
      expect(screen.getByText('Priya Sharma')).toBeDefined();
      expect(screen.getByText('Managing Portfolio Context')).toBeDefined();
      expect(screen.getByText('Manage Portfolio')).toBeDefined();
    });
  });

});
