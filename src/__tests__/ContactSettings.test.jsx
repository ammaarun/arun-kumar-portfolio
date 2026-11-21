import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { MessagesView } from '../admin/views/MessagesView';
import { Contact } from '../components/Contact';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';
import { portfolioData } from '../data/portfolioData';

describe('Contact Form Settings & Public Visibility Component Tests', () => {

  beforeEach(() => {
    localStorage.setItem('ak_cms_token', 'mock_jwt_token');
    vi.restoreAllMocks();
  });

  it('1. MessagesView renders contact form settings card with toggle and email input', async () => {
    vi.spyOn(api, 'getContactSettings').mockResolvedValue({
      success: true,
      data: {
        enabled: true,
        recipientEmail: 'owner@example.com'
      },
      clientName: 'Arun Kumar'
    });
    vi.spyOn(api, 'getMessages').mockResolvedValue({
      success: true,
      data: []
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <MessagesView />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Contact Form & Email Notifications/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('owner@example.com')).toBeInTheDocument();
      expect(screen.getByText(/Enabled \(Active\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Save Contact Settings/i)).toBeInTheDocument();
    });
  });

  it('2. MessagesView allows updating settings and calls api.updateContactSettings', async () => {
    vi.spyOn(api, 'getContactSettings').mockResolvedValue({
      success: true,
      data: {
        enabled: true,
        recipientEmail: 'owner@example.com'
      }
    });
    vi.spyOn(api, 'getMessages').mockResolvedValue({
      success: true,
      data: []
    });
    const updateSpy = vi.spyOn(api, 'updateContactSettings').mockResolvedValue({
      success: true,
      message: 'Contact form settings saved successfully.',
      data: {
        enabled: false,
        recipientEmail: 'new.owner@gmail.com'
      }
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <MessagesView />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('owner@example.com')).toBeInTheDocument();
    });

    // Toggle button to disabled
    const toggleBtn = screen.getByText(/Enabled \(Active\)/i);
    fireEvent.click(toggleBtn);

    // Change email
    const emailInput = screen.getByDisplayValue('owner@example.com');
    fireEvent.change(emailInput, { target: { value: 'new.owner@gmail.com' } });

    // Submit save
    const saveBtn = screen.getByText(/Save Contact Settings/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        enabled: false,
        recipientEmail: 'new.owner@gmail.com'
      });
      expect(screen.getByText(/Contact form settings saved successfully/i)).toBeInTheDocument();
    });
  });

  it('3. Public Contact component renders when contact form is enabled', () => {
    const mockData = {
      ...portfolioData,
      contactSettings: { enabled: true, recipientEmail: 'test@example.com' }
    };

    render(
      <MemoryRouter>
        <DataContext.Provider value={{ data: mockData }}>
          <Contact />
        </DataContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Let's Connect & Collaborate/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Send Message/i)).toBeInTheDocument();
  });

  it('4. Public Contact component renders null when contact form is disabled', () => {
    const mockData = {
      ...portfolioData,
      contactSettings: { enabled: false, recipientEmail: 'test@example.com' }
    };

    const { container } = render(
      <MemoryRouter>
        <DataContext.Provider value={{ data: mockData }}>
          <Contact />
        </DataContext.Provider>
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText(/Let's Connect & Collaborate/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Send Message/i)).not.toBeInTheDocument();
  });

  it('5. Public Navbar omits Contact link when contact form is disabled', () => {
    const mockData = {
      ...portfolioData,
      contactSettings: { enabled: false },
      designConfig: {
        sections: [
          { id: 'about', name: 'About', visible: true, order: 1 },
          { id: 'projects', name: 'Projects', visible: true, order: 2 },
          { id: 'contact', name: 'Contact', visible: true, order: 3 }
        ]
      }
    };

    render(
      <MemoryRouter>
        <ThemeProvider>
          <DataContext.Provider value={{ data: mockData }}>
            <Navbar onOpenCommand={() => {}} onOpenResume={() => {}} onOpenInquiry={() => {}} />
          </DataContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

    // About and Projects should be visible, but Contact must not be in nav links
    expect(screen.getByRole('link', { name: /About/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Projects/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Contact/i })).not.toBeInTheDocument();
  });

  it('6. MessagesView renders email delivery status badges for inbox messages', async () => {
    vi.spyOn(api, 'getContactSettings').mockResolvedValue({
      success: true,
      data: { enabled: true, recipientEmail: 'owner@example.com' }
    });
    vi.spyOn(api, 'getMessages').mockResolvedValue({
      success: true,
      data: [
        {
          id: 'msg-1',
          name: 'Delivered User',
          email: 'user1@example.com',
          subject: 'Delivered Message',
          message: 'This email was delivered.',
          createdAt: new Date().toISOString(),
          read: false,
          emailDelivery: { status: 'sent', recipient: 'owner@example.com' }
        },
        {
          id: 'msg-2',
          name: 'Failed User',
          email: 'user2@example.com',
          subject: 'Failed Message',
          message: 'This email delivery failed.',
          createdAt: new Date().toISOString(),
          read: true,
          emailDelivery: { status: 'failed', error: 'Authentication failed' }
        }
      ]
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <MessagesView />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Delivered User')).toBeInTheDocument();
      expect(screen.getByText('Failed User')).toBeInTheDocument();
      expect(screen.getByText('✓ Email: Sent')).toBeInTheDocument();
      expect(screen.getByText('✗ Email: Failed')).toBeInTheDocument();
    });
  });

});
