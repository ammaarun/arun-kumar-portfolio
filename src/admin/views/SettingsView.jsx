import React, { useState, useEffect } from 'react';
import { 
  Settings, Globe, Share2, Palette, ShieldCheck, Mail, Save, 
  CheckCircle2, AlertTriangle, Eye, Edit3, Image, Lock, HelpCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { MediaPickerModal } from '../components/MediaPickerModal';

export const SettingsView = () => {
  const { token } = useAuth();
  const { data, refreshData, refetchData } = useData();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'branding' | 'seo' | 'social' | 'contact' | 'publishing'

  const [seo, setSeo] = useState({
    pageTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
    author: '',
    robots: 'index, follow',
    socialShareTitle: '',
    socialShareDescription: '',
    socialShareImage: ''
  });

  const [branding, setBranding] = useState({
    faviconUrl: '/favicon.svg',
    logoUrl: '/icons.svg',
    browserTitle: 'Developer Portfolio'
  });

  const [settings, setSettings] = useState({
    siteTitle: '',
    metaDescription: '',
    accentColor: 'emerald',
    themePreference: 'dark'
  });

  const [slug, setSlug] = useState('');

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (data) {
      if (data.seo) setSeo(data.seo);
      if (data.branding) setBranding(data.branding);
      if (data.settings) setSettings(data.settings);
      if (data.slug) setSlug(data.slug);
    }
  }, [data]);

  const handleOpenMediaPicker = (field) => {
    setMediaTargetField(field);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (url) => {
    if (mediaTargetField === 'socialShareImage') {
      setSeo(prev => ({ ...prev, socialShareImage: url }));
    } else if (mediaTargetField === 'faviconUrl') {
      setBranding(prev => ({ ...prev, faviconUrl: url }));
    } else if (mediaTargetField === 'logoUrl') {
      setBranding(prev => ({ ...prev, logoUrl: url }));
    }
  };

  const handleSaveSeo = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(seo)
      });
      const resData = await res.json();
      if (resData.success) {
        if (refreshData) await refreshData();
        setMessage('SEO & Social settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(resData.message || 'Failed to save SEO settings.');
      }
    } catch (err) {
      console.error('Error saving SEO:', err);
      setError('Network error saving SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(branding)
      });
      const resData = await res.json();
      if (resData.success) {
        if (refreshData) await refreshData();
        setMessage('Website branding settings saved!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving branding:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSlug = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/slug', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ slug })
      });
      const resData = await res.json();
      if (resData.success) {
        if (refreshData) await refreshData();
        setMessage(resData.message);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(resData.message || 'Failed to update slug.');
      }
    } catch (err) {
      console.error('Error updating slug:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>WEBSITE CONFIGURATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Website Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organized settings console for SEO, Open Graph social share cards, branding, and publication slugs.
          </p>
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

      {/* Categorized Sub-tab Navigation */}
      <div className="flex items-center space-x-1.5 bg-[#121723] p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
        {[
          { id: 'general', label: 'GENERAL', icon: Settings },
          { id: 'branding', label: 'BRANDING', icon: Palette },
          { id: 'seo', label: 'SEO META', icon: Globe },
          { id: 'social', label: 'SOCIAL PREVIEW', icon: Share2 },
          { id: 'publishing', label: 'PUBLISHING & SLUG', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GENERAL SETTINGS */}
      {activeTab === 'general' && (
        <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">General Portfolio Info</h3>
            <p className="text-xs text-slate-400">Configure global website title and basic metadata.</p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Site Title</label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Default Theme Preference</label>
              <select
                value={settings.themePreference}
                onChange={(e) => setSettings({ ...settings, themePreference: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="dark">Dark Theme (Default)</option>
                <option value="light">Light Theme</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANDING */}
      {activeTab === 'branding' && (
        <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Website Branding & Favicon</h3>
            <p className="text-xs text-slate-400">Customize site favicon, browser title, and header logo.</p>
          </div>

          <form onSubmit={handleSaveBranding} className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Browser Tab Title</label>
              <input
                type="text"
                value={branding.browserTitle}
                onChange={(e) => setBranding({ ...branding, browserTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Favicon Icon URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={branding.faviconUrl}
                  onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleOpenMediaPicker('faviconUrl')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white shrink-0"
                >
                  Choose
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20"
              >
                {saving ? 'Saving...' : 'Save Branding Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SEO META */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Search Engine Optimization (SEO)</h3>
            <p className="text-xs text-slate-400">Configure page title, meta descriptions, canonical URLs, and indexing directives.</p>
          </div>

          <form onSubmit={handleSaveSeo} className="space-y-4 max-w-2xl">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300">Page SEO Title</label>
                <span className="text-[11px] font-mono text-slate-500">{seo.pageTitle.length} / 60 chars</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Arun Kumar | Senior Java & Full-Stack Developer"
                value={seo.pageTitle}
                onChange={(e) => setSeo({ ...seo, pageTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300">Meta Description</label>
                <span className={`text-[11px] font-mono ${seo.metaDescription.length > 160 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                  {seo.metaDescription.length} / 160 chars
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Describe your background, core tech stack, and portfolio highlights for search engine snippets..."
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Keywords (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="Java, Spring Boot, React, Developer"
                  value={seo.keywords}
                  onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Robots Directive</label>
                <input
                  type="text"
                  placeholder="index, follow"
                  value={seo.robots}
                  onChange={(e) => setSeo({ ...seo, robots: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20"
              >
                {saving ? 'Saving...' : 'Save SEO Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: SOCIAL SHARE PREVIEW */}
      {activeTab === 'social' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Open Graph / Social Sharing Settings</span>
              </h3>
              <p className="text-xs text-slate-400">Configure how your portfolio link appears when shared on Twitter, LinkedIn, WhatsApp, or Slack.</p>
            </div>

            <form onSubmit={handleSaveSeo} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Social Share Title</label>
                <input
                  type="text"
                  value={seo.socialShareTitle || seo.pageTitle}
                  onChange={(e) => setSeo({ ...seo, socialShareTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Social Share Description</label>
                <textarea
                  rows={3}
                  value={seo.socialShareDescription || seo.metaDescription}
                  onChange={(e) => setSeo({ ...seo, socialShareDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Social Share Image (OG Image)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={seo.socialShareImage}
                    onChange={(e) => setSeo({ ...seo, socialShareImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleOpenMediaPicker('socialShareImage')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white shrink-0"
                  >
                    Choose Image
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20"
                >
                  {saving ? 'Saving...' : 'Save Social Card'}
                </button>
              </div>
            </form>
          </div>

          {/* Social Share Card Live Preview */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Social Share Card Live Preview</h3>

            <div className="rounded-2xl bg-[#0a0d14] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="h-44 bg-slate-900 overflow-hidden">
                <img
                  src={seo.socialShareImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'}
                  alt="Social preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-1 bg-[#121723] border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase">portfolio.example.com</span>
                <h4 className="text-sm font-bold text-white truncate">{seo.socialShareTitle || seo.pageTitle || 'Developer Portfolio'}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {seo.socialShareDescription || seo.metaDescription || 'Senior Software Developer Portfolio & Case Studies.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PUBLISHING & SLUG */}
      {activeTab === 'publishing' && (
        <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Portfolio URL Slug & Domain</h3>
            <p className="text-xs text-slate-400">Configure your portfolio's URL slug and check uniqueness.</p>
          </div>

          <form onSubmit={handleSaveSlug} className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Portfolio Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs font-mono text-emerald-400">
              Public URL: {window.location.origin}/portfolio/{slug}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20"
              >
                {saving ? 'Updating...' : 'Update Portfolio Slug'}
              </button>
            </div>
          </form>
        </div>
      )}

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectMedia={handleMediaSelect}
      />

    </div>
  );
};
