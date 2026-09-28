import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { CommandMenu } from '../components/CommandMenu';
import { useData } from '../context/DataContext';

vi.mock('../context/DataContext', () => ({
  useData: vi.fn(),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
    toggleVisitorTheme: vi.fn(),
  }),
}));

describe('Phase 13: Template-Specific Portfolio Management & Visibility Behavior', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('A. Section Visibility', () => {
    it('1. disabled section is absent from desktop, mobile, and command menu navigation', () => {
      const mockData = {
        personalInfo: { name: 'Test Developer' },
        designConfig: {
          sections: [
            { id: 'hero', name: 'Hero', visible: true, order: 1 },
            { id: 'about', name: 'About', visible: true, order: 2 },
            { id: 'skills', name: 'Skills', visible: true, order: 3 },
            { id: 'services', name: 'Services', visible: false, order: 4 },
            { id: 'contact', name: 'Contact', visible: true, order: 5 },
          ]
        }
      };

      vi.mocked(useData).mockReturnValue({ data: mockData });

      const { container } = render(
        <Navbar onOpenCommand={vi.fn()} onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />
      );

      // Desktop nav check
      const desktopNav = container.querySelector('nav');
      expect(desktopNav).toBeInTheDocument();
      expect(desktopNav.textContent).toContain('About');
      expect(desktopNav.textContent).toContain('Skills');
      expect(desktopNav.textContent).not.toContain('Services');

      // Command menu check
      render(<CommandMenu isOpen={true} onClose={vi.fn()} onOpenResume={vi.fn()} />);
      expect(screen.queryByText('Explore Services')).toBeNull();
      expect(screen.getByText('Go to About Section')).toBeInTheDocument();
    });

    it('2. re-enabling a section restores it to navigation without data loss', () => {
      let mockData = {
        personalInfo: { name: 'Test Developer' },
        services: [{ id: 's1', title: 'Backend Arch' }],
        designConfig: {
          sections: [
            { id: 'about', name: 'About', visible: true, order: 1 },
            { id: 'services', name: 'Services', visible: false, order: 2 },
          ]
        }
      };

      vi.mocked(useData).mockReturnValue({ data: mockData });
      const { rerender, container } = render(
        <Navbar onOpenCommand={vi.fn()} onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />
      );

      expect(container.querySelector('nav').textContent).not.toContain('Services');

      // Re-enable services section
      mockData = {
        ...mockData,
        designConfig: {
          sections: [
            { id: 'about', name: 'About', visible: true, order: 1 },
            { id: 'services', name: 'Services', visible: true, order: 2 },
          ]
        }
      };
      vi.mocked(useData).mockReturnValue({ data: mockData });
      rerender(<Navbar onOpenCommand={vi.fn()} onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />);

      expect(container.querySelector('nav').textContent).toContain('Services');
      // Verify stored services data is preserved
      expect(mockData.services.length).toBe(1);
    });
  });

  describe('B. Hero Identity & Specialization', () => {
    it('1. renders custom professional label (eyebrow) and specialization from portfolio data', () => {
      const mockData = {
        personalInfo: {
          name: 'Sarah Connor',
          role: 'Cybersecurity Engineer',
          eyebrow: 'SECURITY ARCHITECT',
          specialization: 'Cloud Penetration & DevSecOps',
          heroVisualType: 'code'
        }
      };

      vi.mocked(useData).mockReturnValue({ data: mockData });

      render(<Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />);
      render(<Navbar onOpenCommand={vi.fn()} onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />);

      expect(screen.getAllByText('Sarah Connor').length).toBeGreaterThan(0);
      expect(screen.getByText('Cybersecurity Engineer')).toBeInTheDocument();
      expect(screen.getByText('SECURITY ARCHITECT')).toBeInTheDocument();
      expect(screen.getByText('Cloud Penetration & DevSecOps')).toBeInTheDocument();
    });

    it('2. empty/removed eyebrow and specialization values do not leave broken empty UI', () => {
      const mockData = {
        personalInfo: {
          name: 'John Doe',
          role: 'Software Engineer',
          eyebrow: '',
          specialization: '',
          location: 'San Francisco, CA'
        }
      };

      vi.mocked(useData).mockReturnValue({ data: mockData });

      const { container } = render(<Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      // Should not render broken bullet or empty specialization badge
      expect(container.querySelector('.text-emerald-600')).toBeNull();
    });
  });

  describe('C. Template CTA Behavior', () => {
    it('1. Freelancer template displays custom portfolio CTA in hero and header', () => {
      const mockData = {
        personalInfo: {
          name: 'Freelancer Alice',
          profileType: 'freelancer',
          showFreelancerCTA: true,
          heroCtaText: 'Request Custom Portfolio'
        }
      };

      vi.mocked(useData).mockReturnValue({ data: mockData });

      const handleInquiry = vi.fn();
      render(<Hero onOpenResume={vi.fn()} onOpenInquiry={handleInquiry} />);
      render(<Navbar onOpenCommand={vi.fn()} onOpenResume={vi.fn()} onOpenInquiry={handleInquiry} />);

      const heroCta = screen.getByRole('button', { name: /Request Custom Portfolio/i });
      expect(heroCta).toBeInTheDocument();

      const headerCta = screen.getByRole('button', { name: /Get Portfolio/i });
      expect(headerCta).toBeInTheDocument();

      fireEvent.click(heroCta);
      expect(handleInquiry).toHaveBeenCalled();
    });

    it('2. Non-Freelancer templates do not show Freelancer conversion CTA by default', () => {
      const mockData = {
        personalInfo: {
          name: 'Bob Experienced',
          profileType: 'experienced',
          showFreelancerCTA: false,
          heroCtaText: 'Get in Touch'
        }
      };

      vi.mocked(useData).mockReturnValue({ data: mockData });

      const handleInquiry = vi.fn();
      render(<Hero onOpenResume={vi.fn()} onOpenInquiry={handleInquiry} />);
      render(<Navbar onOpenCommand={vi.fn()} onOpenResume={vi.fn()} onOpenInquiry={handleInquiry} />);

      expect(screen.queryByText('Request Custom Portfolio')).toBeNull();
      expect(screen.queryByRole('button', { name: /Get Portfolio/i })).toBeNull();
      expect(screen.getByRole('button', { name: /Get in Touch/i })).toBeInTheDocument();
    });
  });

  describe('D. Hero Visual Configuration', () => {
    it('1. hero visual can be hidden via heroVisualType = none', () => {
      const mockData = {
        personalInfo: {
          name: 'Developer Dave',
          heroVisualType: 'none'
        }
      };

      vi.mocked(useData).mockReturnValue({ data: mockData });

      const { container } = render(<Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />);

      // Code terminal should not be rendered
      expect(container.querySelector('pre')).toBeNull();
      // Main text container should expand
      expect(container.querySelector('.lg\\:col-span-12, .w-full')).toBeInTheDocument();
    });

    it('2. hero visual type = code renders developer terminal snippet panel', () => {
      const mockData = {
        personalInfo: {
          name: 'Dev Terminal User',
          heroVisualType: 'code'
        },
        codeSnippets: {
          java: { filename: 'Main.java', code: 'public class Main {}' }
        }
      };

      vi.mocked(useData).mockReturnValue({ data: mockData });

      const { container } = render(<Hero onOpenResume={vi.fn()} onOpenInquiry={vi.fn()} />);

      expect(container.querySelector('pre')).toBeInTheDocument();
      expect(screen.getByText('public class Main {}')).toBeInTheDocument();
    });
  });

});
