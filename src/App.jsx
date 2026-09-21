import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

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

function MainPublicPortfolio() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryPkgId, setInquiryPkgId] = useState('cms');

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0a0d14] dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar 
        onOpenCommand={() => setCommandOpen(true)}
        onOpenResume={() => setResumeOpen(true)}
        onOpenInquiry={() => handleOpenInquiry('cms')}
      />

      <main>
        <Hero 
          onOpenResume={() => setResumeOpen(true)}
          onOpenInquiry={() => handleOpenInquiry('cms')}
        />
        <About />
        <Skills />
        <Projects onSelectProject={(project) => setSelectedProject(project)} />
        <Services onOpenInquiry={handleOpenInquiry} />
        <Experience />
        <Blog />
        <Testimonials />
        <Contact />
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
