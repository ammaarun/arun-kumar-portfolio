import React, { useState } from 'react';
import { Save, CheckCircle2, Settings } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';

export const SettingsView = () => {
  const { data, refreshData } = useData();
  const [formData, setFormData] = useState(data.settings || {});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateSettings(formData);
      if (res.success) {
        setSuccessMsg('Website settings saved successfully!');
        await refreshData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white">Website & System Settings</h2>
        <p className="text-xs text-slate-400">Configure site metadata, resume download link, and section visibility.</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-6">
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Browser Tab Title</label>
          <input
            type="text"
            required
            value={formData.siteTitle || ''}
            onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">SEO Meta Description</label>
          <textarea
            rows={2}
            value={formData.metaDescription || ''}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Resume / CV Download File Link</label>
          <input
            type="text"
            value={formData.resumeUrl || '#'}
            onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
};
