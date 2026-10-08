import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, Command, FileText, Code2, Terminal, User, Briefcase, Mail, Sparkles, BookOpen, MessageSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

export const Navbar = ({ onOpenCommand, onOpenResume, onOpenInquiry, activeTheme, onToggleTheme }) => {
  const { theme, toggleTheme, toggleVisitorTheme } = useTheme();
  const { data } = useData();
  const personalInfo = data?.personalInfo || {};

  const currentTheme = activeTheme || theme;
  const handleToggle = onToggleTheme || (() => toggleVisitorTheme(currentTheme));

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState(null, '', href);
        }
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const allNavLinks = [
    { id: 'about', label: 'About', href: '#about', icon: User },
    { id: 'skills', label: 'Skills', href: '#skills', icon: Code2 },
    { id: 'projects', label: 'Projects', href: '#projects', icon: Terminal },
    { id: 'services', label: 'Services', href: '#services', icon: Sparkles },
    { id: 'experience', label: 'Experience', href: '#experience', icon: Briefcase },
    { id: 'blog', label: 'Blog', href: '#blog', icon: BookOpen },
    { id: 'testimonials', label: 'Testimonials', href: '#testimonials', icon: MessageSquare },
    { id: 'contact', label: 'Contact', href: '#contact', icon: Mail },
  ];

  const sectionsConfig = data?.designConfig?.sections;
  const navLinks = Array.isArray(sectionsConfig) && sectionsConfig.length > 0
    ? [...sectionsConfig]
        .filter(sec => sec.visible !== false && sec.id !== 'hero')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(sec => {
          const match = allNavLinks.find(link => link.id === sec.id);
          return match || { id: sec.id, label: sec.name || sec.id, href: `#${sec.id}`, icon: User };
        })
    : allNavLinks;

  const eyebrowLabel = personalInfo.eyebrow !== undefined
    ? personalInfo.eyebrow
    : (personalInfo.shortRole || personalInfo.professionalLabel || personalInfo.role || '');

  const initials = personalInfo.name
    ? personalInfo.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AK';

  const showFreelancerCTA = personalInfo.showFreelancerCTA !== undefined
    ? personalInfo.showFreelancerCTA
    : (personalInfo.profileType === 'freelancer' || data?.profileType === 'freelancer');

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'py-3.5 bg-slate-50 dark:bg-[#0a0d14]/85 dark:bg-[#0a0d14]/90 backdrop-blur-md shadow-lg border-b border-slate-200/80 dark:border-slate-800/80' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a 
          href="#" 
          onClick={(e) => handleNavClick(e, '#')}
          className="flex items-center space-x-2.5 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-900 dark:text-white font-mono font-bold text-sm shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">
              {personalInfo.name || 'Portfolio'}
            </span>
            {eyebrowLabel ? (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase truncate max-w-[180px]">
                {eyebrowLabel}
              </span>
            ) : null}
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 dark:bg-[#121723]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="px-3.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {showFreelancerCTA && (
            <button
              onClick={onOpenInquiry}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all hover:scale-[1.02]"
              title="Request Custom Portfolio"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Portfolio</span>
            </button>
          )}

          <button
            onClick={onOpenCommand}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#121723] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
            title="Command Palette (Ctrl + K)"
          >
            <Command className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono">Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-mono border border-slate-200 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={onOpenResume}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">CV / Resume</span>
          </button>

          <button
            onClick={handleToggle}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
            aria-label="Toggle dark/light theme"
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-fadeIn max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{link.label}</span>
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
};
