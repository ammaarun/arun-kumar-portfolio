import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Globe, ExternalLink, Copy, CheckCircle2, AlertTriangle, 
  XCircle, Clock, Eye, Edit3, Lock, Rocket, Check, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const PublishingView = ({ setActiveTab }) => {
  const { token } = useAuth();
  const { data, refreshData, refetchData } = useData();

  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slugModalOpen, setSlugModalOpen] = useState(false);

  const [newSlug, setNewSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchClientInfo = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        const activeId = resData.activeClientId;
        const currentClient = (resData.data || []).find(c => c.id === activeId);
        setClientData(currentClient);
        setNewSlug(currentClient?.slug || '');
      }
    } catch (err) {
      console.error('Error fetching client info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientInfo();
  }, [token]);

  if (loading || !clientData) {
    return (
      <div className="py-20 text-center text-xs font-mono text-slate-500">
        Loading publishing center...
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/portfolio/${clientData.slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateStatus = async (targetStatus) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/clients/${clientData.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });
      const resData = await res.json();
      if (resData.success) {
        if (refreshData) await refreshData();
        if (refetchData) await refetchData();
        fetchClientInfo();
        setMessage(`Portfolio publication status updated to ${targetStatus}.`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(resData.message || 'Failed to update publication status.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Network error updating status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSlug = async (e) => {
    e.preventDefault();
    if (!newSlug) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/slug', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ slug: newSlug })
      });
      const resData = await res.json();
      if (resData.success) {
        setSlugModalOpen(false);
        if (refreshData) await refreshData();
        fetchClientInfo();
        setMessage(resData.message);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(resData.message || 'Failed to update slug.');
      }
    } catch (err) {
      console.error('Error updating slug:', err);
      setError('Network error updating slug.');
    } finally {
      setSubmitting(false);
    }
  };

  // Health Readiness Checklist evaluation
  const personalInfo = data?.personalInfo || {};
  const projects = data?.projects || [];
  const skills = data?.skills || [];
  const experience = data?.experience || [];
  const resumes = data?.resumes || [];
  const seo = data?.seo || {};

  const totalSkillItems = (skills || []).reduce((acc, cat) => acc + (cat.items?.length || 0), 0);

  const healthItems = [
    {
      id: 'profile',
      name: 'Profile & Personal Information',
      status: personalInfo.name && personalInfo.role ? 'complete' : 'missing',
      detail: personalInfo.name ? `${personalInfo.name} (${personalInfo.role})` : 'Missing name or role',
      tab: 'profile'
    },
    {
      id: 'about',
      name: 'About Section & Short Bio',
      status: personalInfo.shortBio ? 'complete' : 'warning',
      detail: personalInfo.shortBio ? 'Configured' : 'Short bio recommended',
      tab: 'profile'
    },
    {
      id: 'skills',
      name: 'Technical Skills Showcase',
      status: totalSkillItems >= 5 ? 'complete' : (totalSkillItems > 0 ? 'warning' : 'missing'),
      detail: `${totalSkillItems} technical skills listed`,
      tab: 'skills'
    },
    {
      id: 'projects',
      name: 'Featured Projects & Systems',
      status: projects.length >= 2 ? 'complete' : (projects.length === 1 ? 'warning' : 'missing'),
      detail: `${projects.length} projects published`,
      tab: 'projects'
    },
    {
      id: 'experience',
      name: 'Work Experience & History',
      status: experience.length >= 1 ? 'complete' : 'warning',
      detail: `${experience.length} career entries`,
      tab: 'experience'
    },
    {
      id: 'resume',
      name: 'Active Resume Document',
      status: (resumes.some(r => r.isActive) || personalInfo.resumeUrl) ? 'complete' : 'warning',
      detail: (resumes.some(r => r.isActive) || personalInfo.resumeUrl) ? 'Active CV attached' : 'No active resume uploaded',
      tab: 'resume'
    },
    {
      id: 'seo',
      name: 'SEO & Social Share Meta',
      status: seo.metaDescription ? 'complete' : 'warning',
      detail: seo.metaDescription ? 'Meta title & description configured' : 'Add meta description for better SEO',
      tab: 'settings'
    },
    {
      id: 'contact',
      name: 'Contact & Inquiries Details',
      status: personalInfo.email ? 'complete' : 'missing',
      detail: personalInfo.email || 'Missing email',
      tab: 'profile'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PUBLISHED</span>
          </span>
        );
      case 'UNPUBLISHED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
            <span>UNPUBLISHED</span>
          </span>
        );
      case 'PRIVATE':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold">
            <Lock className="w-3 h-3" />
            <span>PRIVATE</span>
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold">
            <span>DRAFT STATE</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-2">
            <Rocket className="w-3.5 h-3.5" />
            <span>PUBLISHING & DOMAIN CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Publishing Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage portfolio publication status, custom URL slugs, pre-publish health checks, and public sharing.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center space-x-2">
          {clientData.status !== 'PUBLISHED' ? (
            <button
              onClick={() => handleUpdateStatus('PUBLISHED')}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
            >
              <Rocket className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish Portfolio'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleUpdateStatus('UNPUBLISHED')}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center space-x-2 transition-all"
            >
              <span>{submitting ? 'Updating...' : 'Unpublish Site'}</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Main Publishing Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Status Banner & URL Card */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Status Banner Card */}
          <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Current Status</span>
              {getStatusBadge(clientData.status)}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{clientData.name} Portfolio</h3>
              <p className="text-xs text-slate-400 mt-1">
                {clientData.status === 'PUBLISHED'
                  ? 'Your portfolio is currently live and publicly accessible on the web.'
                  : 'Your portfolio is currently in draft mode. Only logged-in admins can view changes.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Last Updated: {new Date(clientData.lastUpdated).toLocaleDateString()}</span>
              </div>

              {clientData.lastPublishedAt && (
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Last Published: {new Date(clientData.lastPublishedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio URL & Slug Card */}
          <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Public Portfolio URL & Slug</span>
              </h3>

              <button
                onClick={() => setSlugModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center space-x-1"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit Slug</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0d14] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="font-mono text-xs text-emerald-400 truncate">
                {publicUrl}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center space-x-1 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied!' : 'Copy URL'}</span>
                </button>

                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center space-x-1 shadow-md shadow-emerald-500/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Portfolio</span>
                </a>
              </div>
            </div>
          </div>

          {/* Visibility Controls Selector */}
          <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Portfolio Visibility Mode</h3>
            <p className="text-xs text-slate-400">Select how public visitors and search engines interact with your portfolio site.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => handleUpdateStatus('PUBLISHED')}
                className={`p-4 rounded-xl border text-left space-y-1.5 transition-all ${
                  clientData.status === 'PUBLISHED'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-[#0a0d14] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Public / Published</span>
                  <Globe className="w-4 h-4" />
                </div>
                <p className="text-[11px] leading-relaxed">Live on the web and accessible to clients.</p>
              </button>

              <button
                onClick={() => handleUpdateStatus('DRAFT')}
                className={`p-4 rounded-xl border text-left space-y-1.5 transition-all ${
                  clientData.status === 'DRAFT'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-[#0a0d14] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Draft Mode</span>
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-[11px] leading-relaxed">Hidden while you make content edits.</p>
              </button>

              <button
                onClick={() => handleUpdateStatus('UNPUBLISHED')}
                className={`p-4 rounded-xl border text-left space-y-1.5 transition-all ${
                  clientData.status === 'UNPUBLISHED'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-[#0a0d14] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Unpublished</span>
                  <XCircle className="w-4 h-4" />
                </div>
                <p className="text-[11px] leading-relaxed">Temporarily disabled from public access.</p>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Pre-Publish Readiness Health Check */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Pre-Publish Health Checklist</span>
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {healthItems.filter(i => i.status === 'complete').length} / {healthItems.length}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Review section readiness before publishing to client domain.</p>
            </div>

            <div className="space-y-2.5">
              {healthItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab(item.tab)}
                  className="p-3.5 rounded-xl bg-[#0a0d14] border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white">{item.name}</p>
                    <p className="text-[11px] text-slate-400">{item.detail}</p>
                  </div>

                  {item.status === 'complete' ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                      <Check className="w-3 h-3" />
                      <span>Complete</span>
                    </span>
                  ) : item.status === 'warning' ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Warning</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold border border-rose-500/30">
                      <X className="w-3 h-3" />
                      <span>Missing</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* EDIT SLUG MODAL */}
      {slugModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#121723] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Edit Portfolio Slug</span>
              </h3>
              <button onClick={() => setSlugModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSlug} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                <div className="flex items-center space-x-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Slug Change Warning</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Changing the portfolio URL slug will alter your public link. Any previously shared links will need to be updated.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Custom URL Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. arun-kumar"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSlugModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? 'Updating...' : 'Save New Slug'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
