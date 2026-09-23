import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Eye, CheckCircle2, User, Code2, Briefcase, 
  GraduationCap, Server, Layers, Check, AlertTriangle, X, Layout, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PresetPreviewModal } from '../components/PresetPreviewModal';

export const TemplatesAndStartersView = ({ setActiveTab }) => {
  const { token } = useAuth();
  const { data: currentData, refreshData, refetchData } = useData();

  const [activeSubTab, setActiveSubTab] = useState('templates'); // 'templates' | 'starters'

  // Visual Templates state
  const [templates, setTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplateForApply, setSelectedTemplateForApply] = useState(null);

  // Profile Starters state
  const [presets, setPresets] = useState([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [previewPreset, setPreviewPreset] = useState(null);
  const [selectedPresetForApply, setSelectedPresetForApply] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/templates', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const resData = await res.json();
      if (resData.success) {
        setTemplates(resData.data || []);
        setActiveTemplateId(resData.activeTemplateId || 'modern-dark');
      }
    } catch (err) {
      // Safe silent catch
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/admin/presets', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const resData = await res.json();
      if (resData.success) {
        setPresets(resData.data || []);
      }
    } catch (err) {
      // Safe silent catch
    } finally {
      setLoadingPresets(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchPresets();
  }, [token, currentData]);

  const handleApplyTemplate = async (templateId) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/templates/${templateId}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setSelectedTemplateForApply(null);
        setActiveTemplateId(templateId);
        if (refreshData) await refreshData();
        if (refetchData) await refetchData();
        setSuccessMessage(resData.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(resData.message || 'Failed to apply visual template.');
      }
    } catch (err) {
      console.error('Error applying template:', err);
      setError('Network error applying template.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyStarter = async (presetId) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/presets/${presetId}/apply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await res.json();
      if (resData.success) {
        setSelectedPresetForApply(null);
        if (refreshData) await refreshData();
        if (refetchData) await refetchData();
        setSuccessMessage(resData.message || 'Profile starter applied successfully.');
        setTimeout(() => {
          if (setActiveTab) setActiveTab('profile');
        }, 1500);
      } else {
        setError(resData.message || 'Failed to apply profile starter.');
      }
    } catch (err) {
      console.error('Error applying starter:', err);
      setError('Network error applying starter.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviewPreset = async (presetId) => {
    try {
      const res = await fetch(`/api/admin/presets/${presetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setPreviewPreset(resData.data);
      }
    } catch (err) {
      console.error('Error previewing preset:', err);
    }
  };

  const getPresetIcon = (id) => {
    switch (id) {
      case 'fresher': return GraduationCap;
      case 'experienced': return Briefcase;
      case 'fullstack': return Server;
      case 'freelancer': return Sparkles;
      case 'student': return User;
      default: return Code2;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>PORTFOLIO PLATFORM SYSTEM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Templates & Starters
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Separates visual presentation (Templates) from initial portfolio content (Profile Starters).
          </p>
        </div>

        {/* Sub-tab Navigation Switcher */}
        <div className="flex items-center bg-[#121723] p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveSubTab('templates')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'templates'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Visual Templates</span>
          </button>

          <button
            onClick={() => setActiveSubTab('starters')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'starters'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Profile Starters</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* TAB 1: VISUAL TEMPLATES */}
      {activeSubTab === 'templates' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Visual Templates</strong> control colors, fonts, layouts, and button styles. Applying a template changes only the visual presentation; your portfolio content is preserved untouched.
            </span>
          </div>

          {loadingTemplates ? (
            <div className="py-16 text-center text-slate-400 font-mono text-xs">
              Loading visual templates...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl) => {
                const isActive = tpl.id === activeTemplateId;
                return (
                  <div
                    key={tpl.id}
                    className={`p-5 rounded-2xl bg-[#121723] border transition-all flex flex-col justify-between space-y-4 group ${
                      isActive
                        ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 bg-gradient-to-b from-[#162030] to-[#121723]'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Template Preview Image */}
                      <div className="relative h-36 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                        <img
                          src={tpl.thumbnail}
                          alt={tpl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-950/80 text-emerald-400 rounded-full border border-emerald-500/30 backdrop-blur-md">
                            {tpl.badge}
                          </span>
                        </div>
                        {isActive && (
                          <div className="absolute top-2 right-2 px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-500 text-white rounded-full flex items-center space-x-1 shadow-md">
                            <Check className="w-3 h-3" />
                            <span>Active Template</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {tpl.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {tpl.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-400 rounded-md border border-slate-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => setSelectedTemplateForApply(tpl)}
                        className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => setSelectedTemplateForApply(tpl)}
                        disabled={isActive}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isActive ? 'Active' : 'Use Template'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE STARTERS */}
      {activeSubTab === 'starters' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Profile Starters</strong> provide initial portfolio content (bio, skills, projects, experience) for specific developer roles. Applying a starter adds sample portfolio content.
            </span>
          </div>

          {loadingPresets ? (
            <div className="py-16 text-center text-slate-400 font-mono text-xs">
              Loading profile starters...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presets.map((preset) => {
                const Icon = getPresetIcon(preset.id);
                return (
                  <div
                    key={preset.id}
                    className="p-6 rounded-2xl bg-[#121723] border border-slate-800/80 shadow-lg hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-5 group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {preset.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {preset.name}
                        </h3>
                        <p className="text-xs text-emerald-400/90 font-mono mt-0.5">
                          Target: {preset.targetAudience}
                        </p>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {preset.description}
                      </p>

                      <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-3">
                        <span>{preset.projectsCount} Sample Projects</span>
                        <span>•</span>
                        <span>{preset.skillsCount} Core Skills</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => handlePreviewPreset(preset.id)}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => setSelectedPresetForApply(preset)}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Use Starter</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Visual Template Apply Confirmation Modal */}
      {selectedTemplateForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0f1420] text-slate-100 rounded-2xl border border-slate-800 p-6 space-y-4">
            <button onClick={() => setSelectedTemplateForApply(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Change Template?</h3>
            
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400 text-sm">{selectedTemplateForApply.name}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your portfolio content (bio, skills, projects, work experience) will <strong>remain unchanged</strong>. Only the visual design, layout variants, colors, and fonts will be updated.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => setSelectedTemplateForApply(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyTemplate(selectedTemplateForApply.id)}
                disabled={submitting}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20"
              >
                {submitting ? 'Applying...' : 'Apply Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Preview Modal */}
      {previewPreset && (
        <PresetPreviewModal
          preset={previewPreset}
          onClose={() => setPreviewPreset(null)}
          onApply={(preset) => setSelectedPresetForApply(preset)}
        />
      )}

      {/* Profile Starter Apply Confirmation Modal */}
      {selectedPresetForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0f1420] text-slate-100 rounded-2xl border border-slate-800 p-6 space-y-4">
            <button onClick={() => setSelectedPresetForApply(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Apply Profile Starter?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This may change existing portfolio content (profile, skills, projects, and work history) for {selectedPresetForApply.name}.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => setSelectedPresetForApply(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyStarter(selectedPresetForApply.id)}
                disabled={submitting}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20"
              >
                {submitting ? 'Applying...' : 'Apply Starter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Backwards compatibility alias for PresetsView
export const PresetsView = TemplatesAndStartersView;
