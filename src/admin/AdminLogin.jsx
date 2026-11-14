import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLogin = () => {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('ak_cms_remembered_username') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUsername, setRememberUsername] = useState(() => {
    return !!localStorage.getItem('ak_cms_remembered_username');
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both your admin username and password.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const res = await login(username.trim(), password);
      if (res.success) {
        if (rememberUsername) {
          localStorage.setItem('ak_cms_remembered_username', username.trim());
        } else {
          localStorage.removeItem('ak_cms_remembered_username');
        }
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Unable to connect to authentication server. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#07090e] text-slate-100 font-sans relative overflow-hidden">
      {/* Background Ambient Lighting & Glow Effects */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] bg-gradient-to-b from-emerald-500/12 via-teal-500/6 to-transparent rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute -bottom-24 right-1/4 w-[340px] h-[340px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute -top-24 -left-24 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" 
      />

      {/* Subtle Grid Backdrop Overlay */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" 
      />

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-[#111622]/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl shadow-black/80 space-y-6 relative z-10 transition-all">
        
        {/* Header */}
        <div className="text-center space-y-3">
          {/* Administration Portal Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ADMINISTRATION PORTAL</span>
          </div>

          {/* Security Icon */}
          <div className="relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-emerald-500/10 to-teal-500/5 border border-emerald-500/30 flex items-center justify-center text-white shadow-lg shadow-emerald-500/15">
            <div className="absolute inset-0 rounded-2xl bg-emerald-400/10 blur-sm pointer-events-none" />
            <ShieldCheck className="w-7 h-7 text-emerald-400 relative z-10" />
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Portfolio CMS Admin
            </h1>
            <p className="text-xs text-slate-400">
              Sign in to manage your portfolio platform.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div 
            role="alert" 
            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5 text-rose-300 text-xs animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Username Field */}
          <div className="space-y-1.5">
            <label 
              htmlFor="admin-username" 
              className="text-xs font-semibold text-slate-300 block"
            >
              Admin Username
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                id="admin-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label 
              htmlFor="admin-password" 
              className="text-xs font-semibold text-slate-300 block"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 p-1 text-slate-500 hover:text-slate-300 focus:outline-none focus:text-emerald-400 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center space-x-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={rememberUsername}
                onChange={(e) => setRememberUsername(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-[#0a0d14] border border-slate-700 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 focus:ring-1 cursor-pointer accent-emerald-500"
              />
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                Remember username
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security & Encryption Indicator (replaces insecure credentials display) */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-center space-x-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Encrypted Session • JWT Authorized</span>
        </div>

      </div>
    </div>
  );
};
