import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../admin/ProtectedRoute';
import { AdminLogin } from '../admin/AdminLogin';

// Helper Component to display auth state for testing
const AuthTester = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'AUTHENTICATED' : 'ANONYMOUS'}</span>
      <span data-testid="user-name">{user?.username || ''}</span>
      <button onClick={() => login('admin', 'admin123')} data-testid="btn-login">Login</button>
      <button onClick={logout} data-testid="btn-logout">Logout</button>
    </div>
  );
};

describe('Phase 2: Authentication & Protected Routing Component Tests', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  it('1. AuthContext — should default to ANONYMOUS when no token exists', async () => {
    render(
      <AuthProvider>
        <AuthTester />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('ANONYMOUS');
    });
  });

  it('2. AdminLogin Component — should render login form with username and password fields', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminLogin />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('admin')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('3. ProtectedRoute — should redirect unauthenticated user to /admin/login', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/login" element={<div>LOGIN PAGE CONTENT</div>} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <div>DASHBOARD CONTENT</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('LOGIN PAGE CONTENT')).toBeInTheDocument();
      expect(screen.queryByText('DASHBOARD CONTENT')).not.toBeInTheDocument();
    });
  });

});
