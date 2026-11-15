import React, { useState, useEffect, useCallback } from 'react';
import { Save, CheckCircle2, User, Image, Trash2, Sparkles, AlertCircle, Share2, Globe, Eye, EyeOff, MousePointerClick, Code2, Mail, Download, ExternalLink } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MediaPickerModal } from '../components/MediaPickerModal';
import { resolveHeroCtas } from '../../components/Hero';
import {
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
  InstagramIcon,
  WebsiteIcon
} from '../../components/SocialIcons';

const SOCIAL_PLATFORMS = [
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username', icon: GithubIcon },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', icon: LinkedinIcon },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/username', icon: TwitterIcon },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel', icon: YoutubeIcon },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username', icon: InstagramIcon },
  { key: 'website', label: 'Personal Website', placeholder: 'https://yourdomain.com', icon: WebsiteIcon },
];

const isValidUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Resolves a neon::<mediaId> ref into a presigned URL for admin preview.
const useNeonImageUrl = (imageRef, token) => {
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!imageRef?.startsWith('neon::') || !token) {
      setSrc(imageRef || null);
      setErr(false);
      return;
    }
    let cancelled = false;
    setErr(false);
    setSrc(null);
    const mediaId = imageRef.replace('neon::', '');
    fetch(`/api/admin/media?search=${encodeURIComponent(mediaId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        const record = (d.data || []).find(m => m.id === mediaId);
        if (!record?.objectKey) { if (!cancelled) setErr(true); return; }
        return fetch(`/api/admin/media/serve/${encodeURIComponent(record.objectKey)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then(r => r?.json())
      .then(d => { if (!cancelled) { if (d?.presignedUrl) setSrc(d.presignedUrl); else setErr(true); } })
      .catch(() => { if (!cancelled) setErr(true); });
    return () => { cancelled = true; };
  }, [imageRef, token]);

  return { src, err };
};

export const ProfileView = () => {
  const { data, refreshData } = useData();
  const { token } = useAuth();

  const [formData, setFormData] = useState(data.personalInfo || {});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  useEffect(() => {
    if (data.personalInfo) {
      setFormData(data.personalInfo);
    }
  }, [data.personalInfo]);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleSocialVisibility = useCallback((key, enabled) => {
    setFormData(prev => ({
      ...prev,
      socialVisibility: {
        ...(prev.socialVisibility || {}),
        [key]: enabled
      }
    }));
  }, []);

  const currentCtas = resolveHeroCtas(formData, data);

  const updateCta = useCallback((ctaId, updates) => {
    setFormData(prev => {
      const existing = resolveHeroCtas(prev, data);
      const updated = existing.map(c => c.id === ctaId ? { ...c, ...updates } : c);
      const projCta = updated.find(c => c.action === 'projects');
      const contactCta = updated.find(c => c.action === 'contact');

      return {
        ...prev,
        heroCtas: updated,
        heroProjectsCtaText: projCta?.label || prev.heroProjectsCtaText,
        heroCtaText: contactCta?.label || prev.heroCtaText
      };
    });
  }, [data]);

  const { src: previewSrc, err: previewErr } = useNeonImageUrl(formData.image, token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // URL validation for all provided social links
    for (const plat of SOCIAL_PLATFORMS) {
      const url = formData[plat.key];
      if (url && typeof url === 'string' && url.trim() !== '') {
        if (!isValidUrl(url)) {
          setErrorMsg(`Please enter a valid URL (starting with http:// or https://) for ${plat.label}.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      let snapshot;
      setFormData(prev => { snapshot = prev; return prev; });
      const res = await api.updateProfile(snapshot || formData);
      if (res.success) {
        setSuccessMsg('Profile information updated successfully!');
        if (res.data) {
          setFormData(res.data);
        }
        await refreshData();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please check your network connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Profile & Brand Management</h2>
          <p className="text-xs text-slate-400">Update your profile avatar photo, headline, contact details, bio, and social handles.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs animate-fadeIn" role="status">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs animate-fadeIn" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6">
        
        {/* Profile Avatar Section */}
        <div className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-900 shrink-0">
            {formData.image && !previewErr && previewSrc ? (
              <img src={previewSrc} alt={formData.name || 'Profile Avatar'} className="w-full h-full object-cover" />
            ) : formData.image && !previewErr && !previewSrc && formData.image.startsWith('neon::') ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : formData.image && !formData.image.startsWith('neon::') ? (
              <img src={formData.image} alt={formData.name || 'Profile Avatar'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <h4 className="text-sm font-bold text-white">Profile Avatar Photo</h4>
            <p className="text-xs text-slate-400">Recommended dimension: 600 x 600px square format image.</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMediaPickerOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
              >
                <Image className="w-3.5 h-3.5" />
                <span>Choose from Media Library</span>
              </button>

              {formData.image && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center space-x-1 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="profile-name" className="text-xs font-semibold text-slate-300">Full Name</label>
            <input
              id="profile-name"
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="profile-role" className="text-xs font-semibold text-slate-300">Professional Role / Title</label>
            <input
              id="profile-role"
              type="text"
              required
              value={formData.role || ''}
              onChange={(e) => updateField('role', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="profile-location" className="text-xs font-semibold text-slate-300">Location</label>
            <input
              id="profile-location"
              type="text"
              value={formData.location || ''}
              onChange={(e) => updateField('location', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="profile-availability" className="text-xs font-semibold text-slate-300">Availability Status Badge</label>
            <input
              id="profile-availability"
              type="text"
              value={formData.availability || ''}
              onChange={(e) => updateField('availability', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Hero Identity & Specialization Section */}
        <div className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Hero Identity & Call to Action</span>
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="profile-eyebrow" className="text-xs font-semibold text-slate-300">Professional Label / Eyebrow</label>
              <input
                id="profile-eyebrow"
                type="text"
                value={formData.eyebrow !== undefined ? formData.eyebrow : (formData.shortRole || '')}
                onChange={(e) => updateField('eyebrow', e.target.value)}
                placeholder="e.g. JAVA & FULL STACK"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121723] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400">Top brand header label. Leave blank to omit.</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="profile-specialization" className="text-xs font-semibold text-slate-300">Specialization / Highlight</label>
              <input
                id="profile-specialization"
                type="text"
                value={formData.specialization || ''}
                onChange={(e) => updateField('specialization', e.target.value)}
                placeholder="e.g. Spring Boot & React Specialist"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121723] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400">Hero highlight badge & terminal footer label. Leave blank to omit.</p>
            </div>
          </div>

          <div className="pt-2">
            <div className="space-y-1">
              <label htmlFor="profile-hero-visual" className="text-xs font-semibold text-slate-300">Hero Visual Panel Type</label>
              <select
                id="profile-hero-visual"
                value={formData.heroVisualType || 'code'}
                onChange={(e) => updateField('heroVisualType', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#121723] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="code">Developer Terminal / Code Visual</option>
                <option value="image">Profile / Avatar Photo</option>
                <option value="none">None (Hide Visual Panel)</option>
              </select>
              <p className="text-[11px] text-slate-400">Select right-side visual element for Hero.</p>
            </div>
          </div>

          {/* Hero Action Buttons (CTAs) Configuration */}
          <div className="pt-3 border-t border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h5 className="text-xs font-bold text-white flex items-center space-x-1.5 uppercase tracking-wider">
                <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hero Action Buttons (CTAs)</span>
              </h5>
              <p className="text-[11px] text-slate-400">
                Configure labels, visibility, and independent navigation actions for each hero button.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* 1. Primary Projects CTA */}
              {(() => {
                const cta = currentCtas.find(c => c.action === 'projects') || {
                  id: 'projects',
                  action: 'projects',
                  label: 'View My Projects',
                  enabled: true,
                  style: 'primary'
                };
                const suggestions = [
                  'View My Projects',
                  'View Data Projects',
                  'View My Apps',
                  'View My Designs',
                  'View My Work',
                  'View Case Studies'
                ];

                return (
                  <div className="p-4 rounded-xl bg-[#121723] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                          <Code2 className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white">Primary Action Button</span>
                          <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                            Action: Projects (scroll to #projects)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          {cta.enabled !== false ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={cta.enabled !== false}
                          aria-label="Toggle Primary Projects Button visibility"
                          onClick={() => updateCta('projects', { enabled: cta.enabled === false })}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            cta.enabled !== false ? 'bg-emerald-600' : 'bg-slate-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              cta.enabled !== false ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="cta-projects-label" className="text-xs font-semibold text-slate-300">
                        Button Label
                      </label>
                      <input
                        id="cta-projects-label"
                        type="text"
                        value={cta.label}
                        onChange={(e) => updateCta('projects', { label: e.target.value })}
                        placeholder="e.g. View My Projects"
                        className="w-full px-4 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">Suggested:</span>
                      {suggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => updateCta('projects', { label: sug })}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-[#0a0d14] hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 transition-all font-mono"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 2. Secondary Contact CTA */}
              {(() => {
                const cta = currentCtas.find(c => c.action === 'contact') || {
                  id: 'contact',
                  action: 'contact',
                  label: 'Contact Me',
                  enabled: true,
                  style: 'secondary'
                };
                const suggestions = [
                  'Contact Me',
                  'Get in Touch',
                  "Let's Talk",
                  'Request Custom Portfolio',
                  'Hire Me'
                ];

                return (
                  <div className="p-4 rounded-xl bg-[#121723] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                          <Mail className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white">Secondary Action Button</span>
                          <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                            Action: Contact (scroll to #contact)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          {cta.enabled !== false ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={cta.enabled !== false}
                          aria-label="Toggle Secondary Contact Button visibility"
                          onClick={() => updateCta('contact', { enabled: cta.enabled === false })}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            cta.enabled !== false ? 'bg-emerald-600' : 'bg-slate-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              cta.enabled !== false ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="cta-contact-label" className="text-xs font-semibold text-slate-300">
                        Button Label
                      </label>
                      <input
                        id="cta-contact-label"
                        type="text"
                        value={cta.label}
                        onChange={(e) => updateCta('contact', { label: e.target.value })}
                        placeholder="e.g. Contact Me"
                        className="w-full px-4 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">Suggested:</span>
                      {suggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => updateCta('contact', { label: sug })}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-[#0a0d14] hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 transition-all font-mono"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 3. Resume CTA */}
              {(() => {
                const cta = currentCtas.find(c => c.action === 'resume') || {
                  id: 'resume',
                  action: 'resume',
                  label: 'Download Resume',
                  enabled: true,
                  style: 'outline'
                };

                return (
                  <div className="p-4 rounded-xl bg-[#121723] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                          <Download className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white">Resume Download Button</span>
                          <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                            Action: Resume (direct download)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          {cta.enabled !== false ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={cta.enabled !== false}
                          aria-label="Toggle Resume Download Button visibility"
                          onClick={() => updateCta('resume', { enabled: cta.enabled === false })}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            cta.enabled !== false ? 'bg-emerald-600' : 'bg-slate-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              cta.enabled !== false ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="cta-resume-label" className="text-xs font-semibold text-slate-300">
                        Button Label
                      </label>
                      <input
                        id="cta-resume-label"
                        type="text"
                        value={cta.label}
                        onChange={(e) => updateCta('resume', { label: e.target.value })}
                        placeholder="e.g. Download Resume"
                        className="w-full px-4 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Note: Automatically hidden on public portfolio if no active resume file is configured.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <input
              type="checkbox"
              id="showFreelancerCTA"
              checked={formData.showFreelancerCTA !== undefined ? !!formData.showFreelancerCTA : formData.profileType === 'freelancer'}
              onChange={(e) => updateField('showFreelancerCTA', e.target.checked)}
              className="w-4 h-4 rounded bg-[#121723] border-slate-800 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="showFreelancerCTA" className="text-xs font-medium text-slate-300 cursor-pointer">
              Enable Freelancer Custom Portfolio Pricing CTA Flow ("Request Custom Portfolio" & "Get Portfolio" Header Button)
            </label>
          </div>
        </div>

        {/* Contact Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="profile-email" className="text-xs font-semibold text-slate-300">Email Address</label>
            <input
              id="profile-email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="profile-phone" className="text-xs font-semibold text-slate-300">Phone / WhatsApp</label>
            <input
              id="profile-phone"
              type="text"
              value={formData.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Social Media & Online Presence Section */}
        <div className="p-5 rounded-xl bg-[#0a0d14] border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Social Media & Public Profiles</h4>
            </div>
            <p className="text-[11px] text-slate-400">
              Only enabled platforms with valid, non-empty URLs are shown on your public portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {SOCIAL_PLATFORMS.map((plat) => {
              const IconComponent = plat.icon;
              // If socialVisibility flag is explicitly boolean, use it; otherwise default to true if URL is present or empty.
              const isEnabled = formData.socialVisibility?.[plat.key] !== undefined
                ? Boolean(formData.socialVisibility[plat.key])
                : Boolean(formData[plat.key] && String(formData[plat.key]).trim());

              return (
                <div
                  key={plat.key}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isEnabled
                      ? 'bg-[#121723] border-slate-800 hover:border-slate-700'
                      : 'bg-[#121723]/40 border-slate-800/50 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor={`social-${plat.key}`}
                      className="text-xs font-semibold text-slate-200 flex items-center space-x-2 cursor-pointer"
                    >
                      <span className={`p-1.5 rounded-lg ${isEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </span>
                      <span>{plat.label}</span>
                    </label>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono font-medium ${isEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        aria-label={`Toggle ${plat.label} visibility`}
                        onClick={() => toggleSocialVisibility(plat.key, !isEnabled)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-emerald-600' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <input
                    id={`social-${plat.key}`}
                    type="url"
                    value={formData[plat.key] || ''}
                    onChange={(e) => updateField(plat.key, e.target.value)}
                    placeholder={plat.placeholder}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bios */}
        <div className="space-y-1">
          <label htmlFor="profile-short-bio" className="text-xs font-semibold text-slate-300">Short Hero Bio (1-2 sentences)</label>
          <input
            id="profile-short-bio"
            type="text"
            value={formData.shortBio || ''}
            onChange={(e) => updateField('shortBio', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="profile-bio" className="text-xs font-semibold text-slate-300">Detailed About Narrative Bio</label>
          <textarea
            id="profile-bio"
            rows={4}
            value={formData.bio || ''}
            onChange={(e) => updateField('bio', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
        </button>
      </form>

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectMedia={(mediaRecord) => {
          const imageValue = mediaRecord.storageBackend === 'neon'
            ? `neon::${mediaRecord.id}`
            : (mediaRecord.url || '');
          setFormData(prev => ({ ...prev, image: imageValue }));
        }}
        currentUrl={formData.image}
      />
    </div>
  );
};
