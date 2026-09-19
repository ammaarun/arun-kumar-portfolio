import React, { useEffect, useState } from 'react';
import { Search, FileText, Code, User, Briefcase, Mail, Moon, Sun, X, Terminal, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

export const CommandMenu = ({ isOpen, onClose, onOpenResume }) => {
  const { theme, toggleTheme } = useTheme();
  const { data } = useData();
  const personalInfo = data?.personalInfo || {};
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'about',
      label: 'Go to About Section',
      category: 'Navigation',
      icon: User,
      action: () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      }
    },
    {
      id: 'skills',
      label: 'Explore Tech Stack & Skills',
      category: 'Navigation',
      icon: Code,
      action: () => {
        document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      }
    },
    {
      id: 'projects',
      label: 'View Featured Projects',
      category: 'Navigation',
      icon: Terminal,
      action: () => {
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      }
    },
    {
      id: 'experience',
      label: 'View Work Experience Timeline',
      category: 'Navigation',
      icon: Briefcase,
      action: () => {
        document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      }
    },
    {
      id: 'contact',
      label: 'Get in Touch / Contact',
      category: 'Navigation',
      icon: Mail,
      action: () => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      }
    },
    {
      id: 'resume',
      label: 'Open Resume / CV Preview',
      category: 'Actions',
      icon: FileText,
      action: () => {
        onClose();
        onOpenResume();
      }
    },
    {
      id: 'theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Actions',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        toggleTheme();
        onClose();
      }
    },
    {
      id: 'github',
      label: 'Visit GitHub Profile',
      category: 'External Links',
      icon: ExternalLink,
      action: () => {
        window.open(personalInfo.github, '_blank');
        onClose();
      }
    },
    {
      id: 'linkedin',
      label: 'Connect on LinkedIn',
      category: 'External Links',
      icon: ExternalLink,
      action: () => {
        window.open(personalInfo.linkedin, '_blank');
        onClose();
      }
    }
  ];

  const filteredActions = actions.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#121723] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="relative flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3" />
          <input
            type="text"
            placeholder="Type a command or search section..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-4 text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-sans"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No command found for "{search}"
            </div>
          ) : (
            filteredActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {item.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-[#0d1019] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Navigate with mouse or click</span>
          <div className="flex items-center space-x-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">ESC</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
