import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, CheckCircle2, User, Code2, Briefcase, GraduationCap, Server, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PresetPreviewModal } from '../components/PresetPreviewModal';
import { ApplyPresetModal } from '../components/ApplyPresetModal';

export const PresetsView = ({ setActiveTab }) => {
  const { token } = useAuth();
  const { refetchData } = useData();

  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewPreset, setPreviewPreset] = useState(null);
  const [selectedPresetForApply, setSelectedPresetForApply] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/admin/presets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPresets(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching presets:', err);
      setError('Failed to load portfolio presets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, [token]);

  const handlePreview = async (presetId) => {
    try {
      const res = await fetch(`/api/admin/presets/${presetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPreviewPreset(data.data);
      }
    } catch (err) {
      console.error('Error fetching preset preview:', err);
    }
  };

  const handleConfirmApply = async (presetId) => {
    try {
      const res = await fetch(`/api/admin/presets/${presetId}/apply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        await refetchData();
        setSelectedPresetForApply(null);
        setSuccessMessage(data.message);
        setTimeout(() => {
          if (setActiveTab) setActiveTab('profile');
        }, 1500);
      } else {
        setError(data.message || 'Failed to apply preset.');
      }
    } catch (err) {
      console.error('Error applying preset:', err);
      setError('Network error applying preset.');
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>PORTFOLIO PLATFORM ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Portfolio Presets & Profile Starters
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Select a starter profile preset to instantly generate target portfolio content for different client career levels.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage} Redirecting to CMS Profile Editor...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Preset Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs">
          Loading portfolio presets...
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
                    onClick={() => handlePreview(preset.id)}
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
                    <span>Use This Preset</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewPreset && (
        <PresetPreviewModal
          preset={previewPreset}
          onClose={() => setPreviewPreset(null)}
          onApply={(preset) => setSelectedPresetForApply(preset)}
        />
      )}

      {/* Apply Confirmation Modal */}
      {selectedPresetForApply && (
        <ApplyPresetModal
          preset={selectedPresetForApply}
          isOpen={!!selectedPresetForApply}
          onClose={() => setSelectedPresetForApply(null)}
          onConfirm={handleConfirmApply}
        />
      )}
    </div>
  );
};
