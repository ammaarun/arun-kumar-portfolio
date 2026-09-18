import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Experience } from './components/Experience';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { CommandMenu } from './components/CommandMenu';
import { ResumeModal } from './components/ResumeModal';
import { ProjectModal } from './components/ProjectModal';

export default function App() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Keyboard shortcut for Cmd+K / Ctrl+K
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
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0a0d14] dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-emerald-500 selection:text-white">
        
        {/* Sticky Header Navbar */}
        <Navbar 
          onOpenCommand={() => setCommandOpen(true)}
          onOpenResume={() => setResumeOpen(true)}
        />

        {/* Main Content Sections */}
        <main>
          <Hero onOpenResume={() => setResumeOpen(true)} />
          <About />
          <Skills />
          <Projects onSelectProject={(project) => setSelectedProject(project)} />
          <Experience />
          <Contact />
        </main>

        {/* Footer */}
        <Footer />

        {/* Interactive Modals */}
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

      </div>
    </ThemeProvider>
  );
}
