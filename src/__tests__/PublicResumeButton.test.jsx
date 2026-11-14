import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataContext } from '../context/DataContext';
import { Hero } from '../components/Hero';

describe('Public Portfolio Resume Direct Download Button Component Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const createMockContext = (overrides = {}) => ({
    data: {
      personalInfo: {
        name: 'Arun Kumar',
        role: 'Java & Full Stack Developer',
        resumeUrl: 'https://example.com/arun-resume.pdf',
        ...(overrides.personalInfo || {})
      },
      resumes: overrides.resumes !== undefined ? overrides.resumes : [
        {
          id: 'res-active',
          name: 'Arun-Kumar-Resume-2026.pdf',
          url: 'https://example.com/arun-resume.pdf',
          isActive: true
        }
      ],
      codeSnippets: {},
      designConfig: {
        layout: { hero: 'centered' }
      },
      ...(overrides.root || {})
    },
    loading: false,
    error: null,
    refreshData: vi.fn()
  });

  it('1. Renders "Download Resume" button with Download icon and emerald styling', () => {
    const mockContext = createMockContext();

    render(
      <DataContext.Provider value={mockContext}>
        <Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />
      </DataContext.Provider>
    );

    const downloadBtn = screen.getByRole('button', { name: /Download Resume/i });
    expect(downloadBtn).toBeInTheDocument();
    expect(downloadBtn).toHaveTextContent('Download Resume');

    // Confirm old "View Resume" button is NOT rendered
    expect(screen.queryByRole('button', { name: /View Resume/i })).not.toBeInTheDocument();

    // Confirm preview modal controls "Print HTML" and "Original PDF" are NOT rendered
    expect(screen.queryByText(/Print HTML/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Original PDF/i)).not.toBeInTheDocument();
  });

  it('2. Clicking "Download Resume" triggers native download link without opening preview page', () => {
    const mockContext = createMockContext();
    const onOpenResumeMock = vi.fn();

    // Spy on document.createElement to verify anchor creation and click
    const originalCreateElement = document.createElement.bind(document);
    let createdAnchor = null;
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        createdAnchor = el;
        vi.spyOn(el, 'click').mockImplementation(() => {});
      }
      return el;
    });

    render(
      <DataContext.Provider value={mockContext}>
        <Hero onOpenResume={onOpenResumeMock} onOpenInquiry={vi.fn()} />
      </DataContext.Provider>
    );

    const downloadBtn = screen.getByRole('button', { name: /Download Resume/i });
    fireEvent.click(downloadBtn);

    // Verify direct download anchor was created pointing to /api/portfolio/resume/download
    expect(createdAnchor).not.toBeNull();
    expect(createdAnchor.href).toContain('/api/portfolio/resume/download');
    expect(createdAnchor.click).toHaveBeenCalled();

    // Verify the preview modal opening callback was NOT triggered
    expect(onOpenResumeMock).not.toHaveBeenCalled();
    expect(screen.queryByText(/Print HTML/i)).not.toBeInTheDocument();
  });

  it('3. Hides the Download Resume button when no active resume exists (# or empty)', () => {
    const mockContext = createMockContext({
      personalInfo: { resumeUrl: '#' },
      resumes: []
    });

    render(
      <DataContext.Provider value={mockContext}>
        <Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />
      </DataContext.Provider>
    );

    expect(screen.queryByRole('button', { name: /Download Resume/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /View Resume/i })).not.toBeInTheDocument();
  });
});
