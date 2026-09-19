import React from 'react';
import { X, Download, Mail, Phone, MapPin, ExternalLink, Briefcase, GraduationCap, Code2, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export const ResumeModal = ({ isOpen, onClose }) => {
  const { data } = useData();

  if (!isOpen) return null;

  const personalInfo = data?.personalInfo || {};
  const skills = data?.skills || [];
  const experience = data?.experience || [];
  const projects = data?.projects || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#121723] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1019] sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
              Resume Preview — {personalInfo.name}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Resume Content */}
        <div className="p-8 overflow-y-auto font-sans space-y-8 text-slate-800 dark:text-slate-200">
          {/* Header Block */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {personalInfo.name}
            </h1>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium text-lg mt-1">
              {personalInfo.role}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{personalInfo.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                <span>{personalInfo.email}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>{personalInfo.phone}</span>
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center space-x-2">
              <Code2 className="w-4 h-4" />
              <span>Professional Summary</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {personalInfo.bio}
            </p>
          </div>

          {/* Technical Core Competencies */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center space-x-2">
              <Code2 className="w-4 h-4" />
              <span>Technical Skills & Core Stack</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((cat, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 mb-2">
                    {cat.category}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 font-mono">
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work History */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4 flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Professional Experience</span>
            </h2>
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative pl-4 border-l-2 border-emerald-500">
                  <div className="flex flex-wrap justify-between items-baseline">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {exp.role} <span className="text-slate-400 font-normal">| {exp.company}</span>
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-2">{exp.location}</p>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {exp.achievements.map((ach, aIdx) => (
                      <li key={aIdx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Enterprise Projects */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>Key Projects</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2 line-clamp-2">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {proj.tech.slice(0, 4).map((t, tIdx) => (
                      <span key={tIdx} className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Certification */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Education</span>
            </h2>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200">
                  Bachelor of Technology (B.Tech) in Computer Science & Engineering
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">JNTU Hyderabad / Telangana University</p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
