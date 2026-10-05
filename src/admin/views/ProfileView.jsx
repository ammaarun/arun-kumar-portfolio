import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, User, Image, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MediaPickerModal } from '../components/MediaPickerModal';

// Resolves a neon::<mediaId> ref into a presigned URL for admin preview.
// Falls back to null on error so the avatar placeholder shows instead of a broken image.
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
    // Fetch the media record list to get the objectKey, then get presigned URL
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
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Resolve admin preview of the current image value
  const { src: previewSrc, err: previewErr } = useNeonImageUrl(formData.image, token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile(formData);
      if (res.success) {
        setSuccessMsg('Profile information updated successfully!');
        await refreshData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to update profile');
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
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6">
        
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
                  onClick={() => setFormData({ ...formData, image: '' })}
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
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Professional Role / Title</label>
            <input
              type="text"
              required
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Location</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Availability Status Badge</label>
            <input
              type="text"
              value={formData.availability || ''}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
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
              <label className="text-xs font-semibold text-slate-300">Professional Label / Eyebrow</label>
              <input
                type="text"
                value={formData.eyebrow !== undefined ? formData.eyebrow : (formData.shortRole || '')}
                onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                placeholder="e.g. JAVA & FULL STACK"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121723] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400">Top brand header label. Leave blank to omit.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Specialization / Highlight</label>
              <input
                type="text"
                value={formData.specialization || ''}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Spring Boot & React Specialist"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121723] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400">Hero highlight badge & terminal footer label. Leave blank to omit.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Hero Visual Panel Type</label>
              <select
                value={formData.heroVisualType || 'code'}
                onChange={(e) => setFormData({ ...formData, heroVisualType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#121723] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="code">Developer Terminal / Code Visual</option>
                <option value="image">Profile / Avatar Photo</option>
                <option value="none">None (Hide Visual Panel)</option>
              </select>
              <p className="text-[11px] text-slate-400">Select right-side visual element for Hero.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Primary Hero CTA Button Text</label>
              <input
                type="text"
                value={formData.heroCtaText || ''}
                onChange={(e) => setFormData({ ...formData, heroCtaText: e.target.value })}
                placeholder="e.g. Request Custom Portfolio or Get in Touch"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121723] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400">Custom label for primary CTA button.</p>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <input
              type="checkbox"
              id="showFreelancerCTA"
              checked={formData.showFreelancerCTA !== undefined ? !!formData.showFreelancerCTA : formData.profileType === 'freelancer'}
              onChange={(e) => setFormData({ ...formData, showFreelancerCTA: e.target.checked })}
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
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Phone / WhatsApp</label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Social URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">GitHub Profile URL</label>
            <input
              type="url"
              value={formData.github || ''}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">LinkedIn Profile URL</label>
            <input
              type="url"
              value={formData.linkedin || ''}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Twitter / X URL</label>
            <input
              type="url"
              value={formData.twitter || ''}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Bios */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Short Hero Bio (1-2 sentences)</label>
          <input
            type="text"
            value={formData.shortBio || ''}
            onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Detailed About Narrative Bio</label>
          <textarea
            rows={4}
            value={formData.bio || ''}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
        </button>
      </form>

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectMedia={(mediaRecord) => {
          // Store stable reference — never store presigned URLs or serve paths.
          // Use functional updater to avoid stale-closure bug: formData captured
          // at modal-open time would overwrite intermediate state with old image.
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
