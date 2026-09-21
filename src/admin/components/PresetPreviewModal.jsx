import React from 'react';
import { X, User, Code2, Terminal, Briefcase, Sparkles, GraduationCap, CheckCircle2 } from 'lucide-react';

export const PresetPreviewModal = ({ preset, onClose, onApply }) => {
  if (!preset) return null;

  const info = preset.personalInfo || {};
  const skills = preset.skills || [];
  const projects = preset.projects || [];
  const education = preset.education || [];
  const experience = preset.experience || [];
  const services = preset.services || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f1420] text-slate-100 rounded-2xl shadow-2xl border border-slate-800 p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PREVIEW MODE (NO CHANGES SAVED)
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-slate-800 text-slate-300">
                {preset.badge}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {preset.name} Preset Preview
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              {preset.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Summary */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg font-mono">
              {info.name ? info.name.split(' ').map(n=>n[0]).join('') : 'PR'}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{info.name}</h3>
              <p className="text-xs text-emerald-400 font-medium">{info.role}</p>
              <p className="text-xs text-slate-400">{info.location} • {info.availability}</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 italic border-t border-slate-800/80 pt-2">
            "{info.tagline}"
          </p>
        </div>

        {/* Skills Preview */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Sample Skill Categories ({skills.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skills.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{cat.category}</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items?.map((sk, sidx) => (
                    <span key={sidx} className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded font-mono">
                      {sk.name} ({sk.level}%)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Preview */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Sample Projects ({projects.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((proj) => (
              <div key={proj.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white">{proj.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{proj.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.tech?.map((t, tidx) => (
                    <span key={tidx} className="px-1.5 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 rounded font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
          >
            Close Preview
          </button>

          <button
            onClick={() => {
              onClose();
              onApply(preset);
            }}
            className="flex items-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Use This Preset</span>
          </button>
        </div>

      </div>
    </div>
  );
};
