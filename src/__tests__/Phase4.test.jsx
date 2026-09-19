import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { AdminDashboardPlaceholder } from '../admin/AdminDashboard';
import { api } from '../services/api';
import { portfolioData } from '../data/portfolioData';

describe('Phase 4: Admin Dashboard SaaS UI Component Tests', () => {

  beforeEach(() => {
    localStorage.setItem('ak_cms_token', 'mock_jwt_token');
    vi.spyOn(api, 'verifyToken').mockResolvedValue({ success: true, user: { username: 'admin', role: 'ADMIN' } });
    vi.spyOn(api, 'getPortfolio').mockResolvedValue({ success: true, data: portfolioData });
  });

  it('1. Admin Dashboard — should render sidebar menu items and default Overview view', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <AdminDashboardPlaceholder />
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Console')).toBeInTheDocument();
      expect(screen.getAllByText('Overview')[0]).toBeInTheDocument();
      expect(screen.getByText('Profile & About')).toBeInTheDocument();
    });
  });

  it('2. Sidebar Navigation — should switch active view when sidebar tab is clicked', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <AdminDashboardPlaceholder />
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Console')).toBeInTheDocument();
    });

    const projectsTab = screen.getByRole('button', { name: 'Projects' });
    fireEvent.click(projectsTab);

    await waitFor(() => {
      expect(screen.getByText('Project Management CMS')).toBeInTheDocument();
    });
  });

});
