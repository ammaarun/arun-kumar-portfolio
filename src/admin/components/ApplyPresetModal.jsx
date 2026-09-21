import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X, Loader2, Sparkles } from 'lucide-react';

export const ApplyPresetModal = ({ preset, isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !preset) return null;

  const handleApply = async () => {
    setLoading(true);
    await onConfirm(preset.id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#0f1420] text-slate-100 rounded-2xl shadow-2xl border border-slate-800 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Apply {preset.name} Preset?</h3>
            <p className="text-xs text-slate-400">Starter Portfolio Setup Confirmation</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
          <p className="font-semibold text-emerald-400 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>This will create starter content for your portfolio:</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>Populates starter skills, projects, education, and services.</li>
            <li>Preserves your existing admin account credentials & messages inbox.</li>
            <li>All generated starter content can be customized afterward in the CMS editor.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Applying Preset...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Apply Preset</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
