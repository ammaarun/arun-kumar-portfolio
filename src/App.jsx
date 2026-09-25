import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Services } from './components/Services';
import { Experience } from './components/Experience';
import { Blog } from './components/Blog';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { CommandMenu } from './components/CommandMenu';
import { ResumeModal } from './components/ResumeModal';
import { ProjectModal } from './components/ProjectModal';
import { ClientInquiryModal } from './components/ClientInquiryModal';

import { UserX, Lock, Loader2 } from 'lucide-react';
import { BlogPostView } from './components/BlogPostView';
import { AdminLogin } from './admin/AdminLogin';
import { ProtectedRoute } from './admin/ProtectedRoute';
import { AdminDashboardPlaceholder } from './admin/AdminDashboard';
import { generateThemeStyles } from './utils/themeUtils';

function MainPublicPortfolio() {
  const { data, loading, error } = useData();
  const [commandOpen, setCommandOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryPkgId, setInquiryPkgId] = useState('cms');
  const [overrideDesignConfig, setOverrideDesignConfig] = useState(null);

  const handleOpenInquiry = (packageId = 'cms') => {
    setInquiryPkgId(packageId);
    setInquiryOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'PREVIEW_DESIGN_CONFIG') {
        setOverrideDesignConfig(event.data.config);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const designConfig = overrideDesignConfig || data?.designConfig || {};
  const themeStyles = generateThemeStyles(designConfig);
  const isLightMode = designConfig.themeMode === 'light';

  useEffect(() => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [isLightMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center p-6 text-slate-400 font-mono text-sm space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span>Loading Portfolio...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
          <UserX className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Portfolio Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          The requested client portfolio could not be found or has been removed.
        </p>
        <a 
          href="/"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs hover:bg-emerald-600 transition-all"
        >
          View Default Portfolio
        </a>
      </div>
    );
  }

  const isPreview = typeof window !== 'undefined' && (window.location.search.includes('preview=true') || window.self !== window.top);

  if (!isPreview && (data.status === 'UNPUBLISHED' || data.status === 'PRIVATE')) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Portfolio Unavailable</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          This portfolio is currently unpublished or set to private mode.
        </p>
        <a 
          href="/"
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs hover:bg-slate-700 transition-all"
        >
          Return to Home
        </a>
      </div>
    );
  }

  const sectionComponents = {
    hero: (
      <Hero 
        key="hero"
        onOpenResume={() => setResumeOpen(true)}
        onOpenInquiry={() => handleOpenInquiry('cms')}
        layoutVariant={designConfig.layout?.hero}
      />
    ),
    about: <About key="about" />,
    skills: <Skills key="skills" />,
    projects: (
      <Projects 
        key="projects" 
        onSelectProject={(project) => setSelectedProject(project)} 
        layoutVariant={designConfig.layout?.projects}
      />
    ),
    services: <Services key="services" onOpenInquiry={handleOpenInquiry} />,
    experience: <Experience key="experience" />,
    blog: <Blog key="blog" />,
    testimonials: <Testimonials key="testimonials" />,
    contact: <Contact key="contact" />
  };

  const defaultSectionOrder = [
    { id: 'hero', visible: true, order: 1 },
    { id: 'about', visible: true, order: 2 },
    { id: 'skills', visible: true, order: 3 },
    { id: 'projects', visible: true, order: 4 },
    { id: 'services', visible: true, order: 5 },
    { id: 'experience', visible: true, order: 6 },
    { id: 'blog', visible: true, order: 7 },
    { id: 'testimonials', visible: true, order: 8 },
    { id: 'contact', visible: true, order: 9 }
  ];

  const rawSections = (designConfig.sections && designConfig.sections.length > 0)
    ? designConfig.sections
    : defaultSectionOrder;

  const activeSections = [...rawSections]
    .filter(s => s.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div 
      style={themeStyles}
      data-template={designConfig.template || 'modern-dark'}
      className={`min-h-screen transition-colors duration-300 ${
        isLightMode ? 'bg-slate-50 text-slate-900' : 'bg-[#0a0d14] text-slate-100 dark'
      }`}
    >
      <Navbar 
        onOpenCommand={() => setCommandOpen(true)}
        onOpenResume={() => setResumeOpen(true)}
        onOpenInquiry={() => handleOpenInquiry('cms')}
      />

      <main>
        {activeSections.map(sec => sectionComponents[sec.id] || null)}
      </main>

      <Footer />

      <CommandMenu 
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onOpenResume={() => setResumeOpen(true)}
      />

      <ResumeModal
        isOpen={resumeOpen}
        onClose={() => setResumeOpen(false)}
      />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <ClientInquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        defaultPackageId={inquiryPkgId}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Routes>
              {/* Public Portfolio Routes */}
              <Route path="/" element={<MainPublicPortfolio />} />
              <Route path="/portfolio/:slug" element={<MainPublicPortfolio />} />
              <Route path="/:slug" element={<MainPublicPortfolio />} />
              <Route path="/blog/:slug" element={<BlogPostView />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <AdminDashboardPlaceholder />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
