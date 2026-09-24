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

import { BlogPostView } from './components/BlogPostView';
import { AdminLogin } from './admin/AdminLogin';
import { ProtectedRoute } from './admin/ProtectedRoute';
import { AdminDashboardPlaceholder } from './admin/AdminDashboard';
import { generateThemeStyles } from './utils/themeUtils';

function MainPublicPortfolio() {
  const { data } = useData();
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
              {/* Public Portfolio Route */}
              <Route path="/" element={<MainPublicPortfolio />} />
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
