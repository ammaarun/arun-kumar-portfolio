import React from 'react';
import { ArrowUp, Heart, Code2 } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0d14] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Copyright */}
        <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 font-mono font-bold flex items-center justify-center text-xs">
            AK
          </div>
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              © {new Date().getFullYear()} {portfolioData.personalInfo.name}
            </span>
            <span className="mx-2 text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs">Based in Telangana, India</span>
          </div>
        </div>

        {/* Tech Tag */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <Code2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Built with React 18, Vite & Tailwind CSS</span>
        </div>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors"
        >
          <span>Back to top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>

      </div>
    </footer>
  );
};
