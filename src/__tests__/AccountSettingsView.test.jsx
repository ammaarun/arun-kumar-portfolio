import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { AccountSettingsView } from '../admin/views/AccountSettingsView';
import { api } from '../services/api';

describe('AccountSettingsView Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('ak_cms_token', 'mock_jwt_token');
    vi.restoreAllMocks();
    vi.spyOn(api, 'verifyToken').mockResolvedValue({
      success: true,
      user: { username: 'admin', role: 'ADMIN' }
    });
    vi.spyOn(api, 'getAccount').mockResolvedValue({
      success: true,
      data: { username: 'admin', role: 'ADMIN' }
    });
  });

  it('1. Renders Account Settings view with header, current username, and input cards', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountSettingsView setActiveTab={vi.fn()} />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('SUPER ADMIN SECURITY')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Account Settings' })).toBeInTheDocument();
    expect(screen.getByText('Active Admin Profile')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('current-admin-username')).toHaveTextContent('admin');
    });

    expect(screen.getByLabelText(/New Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm New Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Account Changes/i })).toBeInTheDocument();
  });

  it('2. Toggles password visibility between text and password for current password', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountSettingsView setActiveTab={vi.fn()} />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-admin-username')).toHaveTextContent('admin');
    });

    const currentPassInput = screen.getByPlaceholderText('Enter current password to authorize');
    expect(currentPassInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByLabelText('Show current password');
    fireEvent.click(toggleBtn);
    expect(currentPassInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByLabelText('Hide current password'));
    expect(currentPassInput).toHaveAttribute('type', 'password');
  });

  it('3. Validates missing current password before submitting', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountSettingsView setActiveTab={vi.fn()} />
        </AuthProvider>
      </MemoryRouter>
    );

    const newUserInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.change(newUserInput, { target: { value: 'new_superadmin' } });

    const form = newUserInput.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Please enter your current password to authorize changes.');
    });
  });

  it('4. Validates mismatched new password and confirmation', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountSettingsView setActiveTab={vi.fn()} />
        </AuthProvider>
      </MemoryRouter>
    );

    const currentPassInput = screen.getByPlaceholderText('Enter current password to authorize');
    const newPassInput = screen.getByLabelText(/^New Password/i);
    const confirmPassInput = screen.getByLabelText(/^Confirm New Password/i);

    fireEvent.change(currentPassInput, { target: { value: 'admin123' } });
    fireEvent.change(newPassInput, { target: { value: 'NewSecret123' } });
    fireEvent.change(confirmPassInput, { target: { value: 'Mismatch321' } });

    const form = currentPassInput.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('New password and confirmation password do not match.');
    });
  });

  it('5. Successfully updates username and reflects the updated username in UI', async () => {
    vi.spyOn(api, 'updateAccount').mockResolvedValueOnce({
      success: true,
      message: 'Admin username successfully updated.',
      user: { username: 'arun_superadmin', role: 'ADMIN' },
      token: 'new_refreshed_jwt_token',
      usernameChanged: true,
      passwordChanged: false
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountSettingsView setActiveTab={vi.fn()} />
        </AuthProvider>
      </MemoryRouter>
    );

    const currentPassInput = screen.getByPlaceholderText('Enter current password to authorize');
    const newUserInput = screen.getByPlaceholderText('Enter new username');

    fireEvent.change(currentPassInput, { target: { value: 'admin123' } });
    fireEvent.change(newUserInput, { target: { value: 'arun_superadmin' } });

    const form = currentPassInput.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Admin username successfully updated.');
      expect(screen.getByTestId('current-admin-username')).toHaveTextContent('arun_superadmin');
      expect(localStorage.getItem('ak_cms_token')).toBe('new_refreshed_jwt_token');
    });
  });

  it('6. Successfully updates password and triggers the re-login flow', async () => {
    vi.spyOn(api, 'updateAccount').mockResolvedValueOnce({
      success: true,
      message: 'Admin credentials successfully updated.',
      user: { username: 'admin', role: 'ADMIN' },
      requireRelogin: true,
      passwordChanged: true
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/dashboard" element={<AccountSettingsView setActiveTab={vi.fn()} />} />
            <Route path="/admin/login" element={<div data-testid="login-view">LOGIN VIEW</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const currentPassInput = screen.getByPlaceholderText('Enter current password to authorize');
    const newPassInput = screen.getByLabelText(/^New Password/i);
    const confirmPassInput = screen.getByLabelText(/^Confirm New Password/i);

    fireEvent.change(currentPassInput, { target: { value: 'admin123' } });
    fireEvent.change(newPassInput, { target: { value: 'NewSuperSecretPass_2026' } });
    fireEvent.change(confirmPassInput, { target: { value: 'NewSuperSecretPass_2026' } });

    const form = currentPassInput.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Password Changed Successfully')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In with New Password/i })).toBeInTheDocument();
    });

    const reloginBtn = screen.getByRole('button', { name: /Sign In with New Password/i });
    fireEvent.click(reloginBtn);

    await waitFor(() => {
      expect(screen.getByTestId('login-view')).toBeInTheDocument();
      expect(localStorage.getItem('ak_cms_token')).toBeNull();
    });
  });
});
