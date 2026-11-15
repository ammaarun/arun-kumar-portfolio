import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataContext } from '../context/DataContext';
import { Hero, resolveHeroCtas } from '../components/Hero';
import { Projects } from '../components/Projects';
import { ProfileView } from '../admin/views/ProfileView';
import { ProjectsView } from '../admin/views/ProjectsView';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    updateProfile: vi.fn(),
    addProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-jwt-token' })
}));

// Mock MediaPickerModal
vi.mock('../admin/components/MediaPickerModal', () => ({
  MediaPickerModal: () => <div data-testid="media-picker-mock" />
}));

describe('Hero Social Links, CTA Buttons and Featured Projects Frontend Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockContext = (overrides = {}) => ({
    data: {
      personalInfo: {
        name: 'Arun Kumar',
        role: 'Java Full Stack Developer',
        github: 'https://github.com/arunkumar',
        linkedin: 'https://linkedin.com/in/arunkumar',
        twitter: 'https://x.com/arunkumar',
        youtube: 'https://youtube.com/@arunkumardev',
        instagram: 'https://instagram.com/arunkumardev',
        website: 'https://arunkumar.dev',
        socialVisibility: {
          github: true,
          linkedin: true,
          twitter: false, // Explicitly disabled
          youtube: true,
          instagram: true,
          website: true
        },
        resumeUrl: 'https://example.com/resume.pdf',
        heroVisualType: 'none',
        ...(overrides.personalInfo || {})
      },
      resumes: [
        {
          id: 'res-1',
          name: 'Arun-Resume.pdf',
          url: 'https://example.com/resume.pdf',
          isActive: true
        }
      ],
      projects: overrides.projects || [
        {
          id: 'proj-1',
          title: 'Standard Non-Featured Project',
          category: 'Backend',
          description: 'Regular project description',
          tech: ['Java', 'Spring Boot'],
          featured: false
        },
        {
          id: 'proj-2',
          title: 'High Impact Cloud Engine',
          category: 'Cloud',
          description: 'Featured cloud platform',
          tech: ['Java', 'Kafka', 'Docker'],
          featured: true
        },
        {
          id: 'proj-3',
          title: 'Second Ordinary Service',
          category: 'Backend',
          description: 'Another regular project',
          tech: ['PostgreSQL'],
          featured: false
        }
      ],
      codeSnippets: {},
      designConfig: {
        sections: overrides.sections || [
          { id: 'hero', visible: true, order: 1 },
          { id: 'projects', visible: true, order: 2 },
          { id: 'contact', visible: true, order: 3 }
        ]
      },
      ...(overrides.root || {})
    },
    loading: false,
    error: null,
    refreshData: vi.fn()
  });

  // ─── 1. Social Media Links on Public Hero ──────────────────────────
  it('1. Renders enabled social links with valid URLs and safe target="_blank"', () => {
    const context = createMockContext();
    render(
      <DataContext.Provider value={context}>
        <Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />
      </DataContext.Provider>
    );

    // GitHub is enabled and valid
    const githubLink = screen.getByRole('link', { name: /GitHub/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/arunkumar');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    // LinkedIn is enabled and valid
    const linkedinLink = screen.getByRole('link', { name: /LinkedIn/i });
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/arunkumar');

    // YouTube is enabled and valid
    const youtubeLink = screen.getByRole('link', { name: /YouTube/i });
    expect(youtubeLink).toHaveAttribute('href', 'https://youtube.com/@arunkumardev');

    // Instagram is enabled and valid
    const instagramLink = screen.getByRole('link', { name: /Instagram/i });
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/arunkumardev');

    // Website is enabled and valid
    const websiteLink = screen.getByRole('link', { name: /Personal Website/i });
    expect(websiteLink).toHaveAttribute('href', 'https://arunkumar.dev');
  });

  it('2. Hides disabled social links, empty URLs, and invalid URLs on Hero', () => {
    const context = createMockContext({
      personalInfo: {
        twitter: 'https://x.com/arunkumar',
        socialVisibility: {
          twitter: false // Disabled
        },
        youtube: '', // Empty URL
        instagram: 'invalid-url-without-protocol', // Invalid URL
        website: 'ftp://unsupported.com' // Not http/https
      }
    });

    render(
      <DataContext.Provider value={context}>
        <Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />
      </DataContext.Provider>
    );

    expect(screen.queryByRole('link', { name: /Twitter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /YouTube/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Instagram/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Personal Website/i })).not.toBeInTheDocument();
  });

  // ─── 2. Hero CTA Buttons & Navigation Mapping ─────────────────────
  it('3. Renders Primary "View My Projects", Secondary "Download Resume", and Optional "Contact Me" buttons', () => {
    const context = createMockContext();
    render(
      <DataContext.Provider value={context}>
        <Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />
      </DataContext.Provider>
    );

    // Primary: View My Projects
    const projectsBtn = screen.getByRole('link', { name: /View My Projects/i });
    expect(projectsBtn).toBeInTheDocument();
    expect(projectsBtn).toHaveAttribute('href', '#projects');

    // Secondary: Download Resume
    const resumeBtn = screen.getByRole('button', { name: /Download Resume/i });
    expect(resumeBtn).toBeInTheDocument();

    // Optional: Contact Me
    const contactBtn = screen.getByRole('button', { name: /Contact Me/i });
    expect(contactBtn).toBeInTheDocument();

    // Ensure duplicate "View Featured Work" button is REMOVED
    expect(screen.queryByRole('link', { name: /View Featured Work/i })).not.toBeInTheDocument();
  });

  it('4. Hides Contact Me button when contact section is disabled in designConfig', () => {
    const context = createMockContext({
      sections: [
        { id: 'hero', visible: true },
        { id: 'projects', visible: true },
        { id: 'contact', visible: false } // Hidden contact section
      ]
    });

    render(
      <DataContext.Provider value={context}>
        <Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />
      </DataContext.Provider>
    );

    expect(screen.queryByRole('button', { name: /Contact Me/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View My Projects/i })).toBeInTheDocument();
  });

  it('5. Hides View My Projects button when projects section is disabled in designConfig', () => {
    const context = createMockContext({
      sections: [
        { id: 'hero', visible: true },
        { id: 'projects', visible: false }, // Hidden projects section
        { id: 'contact', visible: true }
      ]
    });

    render(
      <DataContext.Provider value={context}>
        <Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />
      </DataContext.Provider>
    );

    expect(screen.queryByRole('link', { name: /View My Projects/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Contact Me/i })).toBeInTheDocument();
  });

  it('6. Profession-Specific Labels: Correctly maps custom labels without altering navigation actions', () => {
    // Data Analyst with "View Data Projects" and Designer with "View My Designs"
    const dataAnalystContext = createMockContext({
      personalInfo: {
        heroCtas: [
          { id: 'projects', label: 'View Data Projects', action: 'projects', enabled: true, style: 'primary' },
          { id: 'contact', label: 'Contact Me', action: 'contact', enabled: true, style: 'secondary' },
          { id: 'resume', label: 'Download Resume', action: 'resume', enabled: true, style: 'outline' }
        ]
      }
    });

    render(
      <DataContext.Provider value={dataAnalystContext}>
        <Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />
      </DataContext.Provider>
    );

    const dataProjBtn = screen.getByRole('link', { name: /View Data Projects/i });
    expect(dataProjBtn).toBeInTheDocument();
    expect(dataProjBtn).toHaveAttribute('href', '#projects');

    const contactBtn = screen.getByRole('button', { name: /Contact Me/i });
    expect(contactBtn).toBeInTheDocument();
  });

  it('7. Fix Duplicate Buttons: Prevents "View My Projects" from rendering twice in legacy setups', () => {
    // Legacy setup where heroCtaText was mistakenly set to "View My Projects"
    const legacyContext = createMockContext({
      personalInfo: {
        heroCtaText: 'View My Projects', // Legacy field
        heroCtas: undefined // Not yet configured in new format
      }
    });

    render(
      <DataContext.Provider value={legacyContext}>
        <Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />
      </DataContext.Provider>
    );

    // There should ONLY be ONE "View My Projects" button (the projects action), NOT two!
    const allMatching = screen.getAllByText(/View My Projects/i);
    expect(allMatching.length).toBe(1);

    // The contact button defaults properly to "Contact Me" instead of duplicating "View My Projects"
    expect(screen.getByRole('button', { name: /Contact Me/i })).toBeInTheDocument();
  });

  // ─── 3. Featured Projects Ordering and Distinguishing ────────────
  it('8. Orders featured projects before ordinary projects without duplication', () => {
    const context = createMockContext();
    const onSelectProject = vi.fn();

    render(
      <DataContext.Provider value={context}>
        <Projects onSelectProject={onSelectProject} />
      </DataContext.Provider>
    );

    // In mock context: proj-1 is unfeatured, proj-2 is featured, proj-3 is unfeatured.
    // In sortedProjects, proj-2 (featured) MUST appear first!
    const headings = screen.getAllByRole('heading', { level: 3 });
    const titles = headings.map(h => h.textContent.trim());

    expect(titles[0]).toBe('High Impact Cloud Engine'); // Featured first
    expect(titles[1]).toBe('Standard Non-Featured Project');
    expect(titles[2]).toBe('Second Ordinary Service');
    expect(titles.length).toBe(3); // No duplicates

    // Featured badge is rendered on proj-2
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  // ─── 4. Admin Profile Social Management & Validation ──────────────
  it('9. Admin ProfileView allows toggling social platforms and blocks invalid URLs', async () => {
    const context = createMockContext();
    render(
      <DataContext.Provider value={context}>
        <ProfileView />
      </DataContext.Provider>
    );

    // Verify all 6 platforms are displayed
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Twitter / X')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Personal Website')).toBeInTheDocument();

    // Toggle YouTube off
    const youtubeToggle = screen.getByRole('switch', { name: /Toggle YouTube visibility/i });
    fireEvent.click(youtubeToggle);

    // Enter an invalid URL for Instagram
    const instaInput = screen.getByLabelText('Instagram');
    fireEvent.change(instaInput, { target: { value: 'not-a-valid-url' } });

    // Try to submit
    const saveBtn = screen.getByRole('button', { name: /Save Profile Changes/i });
    fireEvent.click(saveBtn);

    // Should display validation error and NOT call API
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Please enter a valid URL/i);
      expect(api.updateProfile).not.toHaveBeenCalled();
    });

    // Fix Instagram URL with valid URL
    fireEvent.change(instaInput, { target: { value: 'https://instagram.com/validprofile' } });
    api.updateProfile.mockResolvedValueOnce({ success: true, data: { ...context.data.personalInfo } });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
        instagram: 'https://instagram.com/validprofile',
        socialVisibility: expect.objectContaining({
          youtube: false
        })
      }));
    });
  });

  // ─── 5. Admin ProjectsView Featured Toggle ─────────────────────────
  it('10. Admin ProjectsView displays featured badges, toggles featured status, and includes checkbox in modal', async () => {
    const context = createMockContext();
    api.updateProject.mockResolvedValueOnce({ success: true });

    render(
      <DataContext.Provider value={context}>
        <ProjectsView />
      </DataContext.Provider>
    );

    // Displays Featured badge for proj-2
    expect(screen.getByText('Featured')).toBeInTheDocument();

    // Quick toggle featured button on proj-2
    const unmarkBtn = screen.getByRole('button', { name: /Unmark High Impact Cloud Engine as Featured/i });
    fireEvent.click(unmarkBtn);

    await waitFor(() => {
      expect(api.updateProject).toHaveBeenCalledWith('proj-2', expect.objectContaining({
        featured: false
      }));
    });

    // Opening "Add New Project" modal displays the featured checkbox
    const addBtn = screen.getByRole('button', { name: /Add New Project/i });
    fireEvent.click(addBtn);

    const featuredCheckbox = screen.getByLabelText(/Mark as Featured Project/i);
    expect(featuredCheckbox).toBeInTheDocument();
    expect(featuredCheckbox).toBeChecked();
  });
});
