import React from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Footer = () => {
  const { data } = useData();
  const personalInfo = data?.personalInfo || {};

  const initials = personalInfo.name
    ? personalInfo.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AK';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-10 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0d14] text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Copyright */}
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs border border-emerald-500/20">
            {initials}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">
              © {new Date().getFullYear()} {personalInfo.name || 'Portfolio'}
            </span>
            {personalInfo.location && (
              <>
                <span className="mx-2 text-slate-700">•</span>
                <span className="text-xs text-slate-600 dark:text-slate-400">{personalInfo.location}</span>
              </>
            )}
          </div>
        </div>

        {/* Tech Tag */}
        <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Universal Portfolio Builder</span>
        </div>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white bg-white dark:bg-[#121723] hover:bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors"
        >
          <span>Back to top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>

      </div>
    </footer>
  );
};
