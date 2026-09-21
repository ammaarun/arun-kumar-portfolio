import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClientInquiryModal } from '../components/ClientInquiryModal';
import { siteConfig } from '../config/siteConfig';

describe('Phase 6: Freelance Client Lead Generation & White-Label Config', () => {

  it('1. siteConfig — should contain valid freelance pricing tiers and brand settings', () => {
    expect(siteConfig).toHaveProperty('brandName');
    expect(siteConfig.freelanceOfferings).toHaveProperty('packages');
    expect(siteConfig.freelanceOfferings.packages.length).toBeGreaterThanOrEqual(3);
    
    const cmsPkg = siteConfig.freelanceOfferings.packages.find(p => p.id === 'cms');
    expect(cmsPkg).toBeDefined();
    expect(cmsPkg.price).toBe('$249');
  });

  it('2. ClientInquiryModal — should render package options and handle form submission', async () => {
    const handleClose = vi.fn();
    render(<ClientInquiryModal isOpen={true} onClose={handleClose} defaultPackageId="cms" />);

    expect(screen.getByText('Request Your Custom Developer Portfolio')).toBeDefined();
    expect(screen.getByText('Full Dynamic CMS Portfolio')).toBeDefined();
    expect(screen.getByText('Basic Developer Portfolio')).toBeDefined();

    // Fill form fields
    const nameInput = screen.getByPlaceholderText('e.g. Rahul Sharma');
    const emailInput = screen.getByPlaceholderText('name@example.com');

    fireEvent.change(nameInput, { target: { value: 'Jane Freelancer' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });

    // Mock fetch for contact submit
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, message: 'Message sent successfully!' })
    });

    const submitBtn = screen.getByText(/Submit Request/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Inquiry Received!')).toBeDefined();
      expect(screen.getByText('Jane Freelancer')).toBeDefined();
    });
  });

});
