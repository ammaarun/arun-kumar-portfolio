import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { AdminLogin } from '../admin/AdminLogin';
import { api } from '../services/api';

describe('AdminLogin SaaS Redesign & Security Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. Renders SaaS layout elements, header, and labels', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminLogin />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('ADMINISTRATION PORTAL')).toBeInTheDocument();
    expect(screen.getByText('Portfolio CMS Admin')).toBeInTheDocument();
    expect(screen.getByText('Sign in to manage your portfolio platform.')).toBeInTheDocument();
    expect(screen.getByText('Admin Username', { selector: 'label' })).toBeInTheDocument();
    expect(screen.getByText('Password', { selector: 'label' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/Remember username/i)).toBeInTheDocument();
    expect(screen.getByText(/Encrypted Session • JWT Authorized/i)).toBeInTheDocument();
  });

  it('2. SECURITY: Default credentials are completely removed and never displayed', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminLogin />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText(/Default Credentials/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/admin123/i)).not.toBeInTheDocument();
  });

  it('3. Show/hide password toggle changes input type between password and text', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminLogin />
        </AuthProvider>
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByLabelText('Show password');
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Hide password'));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('4. Validates empty fields before submitting', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminLogin />
        </AuthProvider>
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText('admin');
    const form = usernameInput.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Please enter both your admin username and password.');
    });
  });

  it('5. Displays error message on invalid credentials', async () => {
    vi.spyOn(api, 'loginAdmin').mockResolvedValueOnce({
      success: false,
      message: 'Invalid admin credentials.'
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminLogin />
        </AuthProvider>
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText('admin');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const form = usernameInput.closest('form');

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid admin credentials.');
    });
  });

  it('6. Successfully logs in with valid credentials, handles remember username, and navigates', async () => {
    vi.spyOn(api, 'loginAdmin').mockResolvedValueOnce({
      success: true,
      token: 'mock-valid-jwt-token',
      user: { username: 'admin', role: 'ADMIN' }
    });

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<div data-testid="dashboard-view">DASHBOARD VIEW</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText('admin');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const rememberCheckbox = screen.getByRole('checkbox');
    const form = usernameInput.closest('form');

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(rememberCheckbox); // check remember username

    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
      expect(localStorage.getItem('ak_cms_token')).toBe('mock-valid-jwt-token');
      expect(localStorage.getItem('ak_cms_remembered_username')).toBe('admin');
    });
  });

  it('7. Pre-populates remembered username on mount when present in localStorage', () => {
    localStorage.setItem('ak_cms_remembered_username', 'saved-admin');

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminLogin />
        </AuthProvider>
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText('admin');
    expect(usernameInput.value).toBe('saved-admin');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
