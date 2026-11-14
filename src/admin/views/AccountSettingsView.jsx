import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, User, Lock, Eye, EyeOff, Save, CheckCircle2, 
  AlertCircle, KeyRound, Loader2, LogOut, ArrowRight, Shield 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const AccountSettingsView = ({ setActiveTab }) => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [currentUsername, setCurrentUsername] = useState(user?.username || 'admin');
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [reloginRequired, setReloginRequired] = useState(false);

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const res = await api.getAccount();
      if (res.success && res.data) {
        setCurrentUsername(res.data.username);
      }
    } catch (err) {
      console.error('Failed to fetch account info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const handleReset = () => {
    setNewUsername('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentPassword) {
      setError('Please enter your current password to authorize changes.');
      return;
    }

    if (!newUsername.trim() && !newPassword) {
      setError('Please provide a new username or a new password to update.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        currentPassword,
        newUsername: newUsername.trim() || undefined,
        newPassword: newPassword || undefined,
        confirmPassword: confirmPassword || undefined
      };

      const res = await api.updateAccount(payload);
      if (res.success) {
        setMessage(res.message || 'Account updated successfully.');
        if (res.user?.username) {
          setCurrentUsername(res.user.username);
        }
        handleReset();

        if (res.requireRelogin || res.passwordChanged) {
          setReloginRequired(true);
        } else if (res.token) {
          localStorage.setItem('ak_cms_token', res.token);
        }
      } else {
        setError(res.message || 'Failed to update account.');
      }
    } catch (err) {
      setError('Unable to update account settings. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleRelogin = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SUPER ADMIN SECURITY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your Super Admin authentication credentials, username, and password.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div 
          role="status"
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center space-x-2 animate-fadeIn"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div 
          role="alert"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center space-x-2 animate-fadeIn"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Relogin Required Modal / Banner */}
      {reloginRequired && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#121723] to-[#121723] border border-emerald-500/50 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Password Changed Successfully</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your password has been securely updated and hashed with bcrypt. For enhanced security, your previous session is now invalidated. Please sign in with your new password.
              </p>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleRelogin}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign In with New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Account Status Card */}
      <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Active Admin Profile</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            SUPER ADMIN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800 space-y-1">
            <span className="text-slate-400 font-mono text-[11px] block">CURRENT USERNAME</span>
            <span className="text-white font-bold text-sm tracking-wide block truncate" data-testid="current-admin-username">
              {loading ? 'Loading...' : currentUsername}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800 space-y-1">
            <span className="text-slate-400 font-mono text-[11px] block">ROLE PRIVILEGES</span>
            <span className="text-emerald-400 font-bold text-sm tracking-wide block">
              Super Administrator
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800 space-y-1">
            <span className="text-slate-400 font-mono text-[11px] block">SECURITY HASHING</span>
            <span className="text-teal-400 font-mono text-sm tracking-wide block">
              bcrypt (10 rounds)
            </span>
          </div>
        </div>
      </div>

      {/* Account Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Username Card */}
        <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Change Username</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Leave blank if you only want to change your password.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Current Username
              </label>
              <input
                type="text"
                disabled
                value={currentUsername}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14]/50 border border-slate-800 text-xs text-slate-400 cursor-not-allowed font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-username" className="text-xs font-semibold text-slate-300 block">
                New Username
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  id="new-username"
                  type="text"
                  placeholder="Enter new username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                3–50 alphanumeric characters (letters, numbers, '.', '_', '-')
              </p>
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Change Password</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Leave blank if you only want to change your username.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-xs font-semibold text-slate-300 block">
                New Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  className="absolute right-3.5 p-1 text-slate-500 hover:text-slate-300 focus:outline-none focus:text-emerald-400 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Minimum 6 characters
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-xs font-semibold text-slate-300 block">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3.5 p-1 text-slate-500 hover:text-slate-300 focus:outline-none focus:text-emerald-400 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Verification & Authorization Card */}
        <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Identity Verification</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your current password to authorize any changes to your username or password.
            </p>
          </div>

          <div className="max-w-md space-y-1.5">
            <label htmlFor="current-password" className="text-xs font-semibold text-slate-300 block">
              Current Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                required
                placeholder="Enter current password to authorize"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                className="absolute right-3.5 p-1 text-slate-500 hover:text-slate-300 focus:outline-none focus:text-emerald-400 transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Account Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
