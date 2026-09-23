import React, { useState } from 'react';
import { X, Smartphone, Tablet, Monitor, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export const MultiDevicePreviewModal = ({ client, isOpen, onClose }) => {
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'

  if (!isOpen || !client) return null;

  const getViewportStyles = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-[375px] h-[667px] rounded-3xl border-8 border-slate-800 shadow-2xl';
      case 'tablet':
        return 'w-[768px] h-[850px] rounded-2xl border-8 border-slate-800 shadow-2xl';
      case 'desktop':
      default:
        return 'w-full h-[85vh] rounded-xl border border-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-7xl max-h-[96vh] bg-[#0f1420] text-slate-100 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls Bar */}
        <div className="px-6 py-4 bg-[#121723] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              {client.name ? client.name.split(' ').map(n=>n[0]).join('') : 'CL'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">{client.name}</h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  client.status === 'PUBLISHED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {client.status || 'DRAFT'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                slug: /{client.slug || 'portfolio'}
              </p>
            </div>
          </div>

          {/* Viewport Device Mode Buttons */}
          <div className="hidden sm:flex items-center space-x-1 bg-[#0a0d14] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile (375px)</span>
            </button>

            <button
              onClick={() => setDeviceMode('tablet')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                deviceMode === 'tablet'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet className="w-4 h-4" />
              <span>Tablet (768px)</span>
            </button>

            <button
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Desktop (Full)</span>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Frame Container */}
        <div className="flex-1 p-4 bg-[#0a0d14] flex items-center justify-center overflow-auto">
          <div className={`transition-all duration-300 bg-white dark:bg-[#0a0d14] overflow-hidden ${getViewportStyles()}`}>
            <iframe
              src="/"
              title={`Preview ${client.name}`}
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
