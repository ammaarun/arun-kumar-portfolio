import React from 'react';
import { X, ExternalLink, CheckCircle2, Cpu, BarChart3, Layers } from 'lucide-react';
import { GithubIcon } from './SocialIcons';

export const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#121723] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1019] sticky top-0 z-10">
          <div>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {project.category}
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {project.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Project Preview Image */}
          <div className="relative rounded-xl overflow-hidden h-56 border border-slate-200 dark:border-slate-800">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-sm font-semibold">
                {project.subtitle}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Overview & Architecture
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.longDescription || project.description}
            </p>
          </div>

          {/* Performance Metrics */}
          {project.metrics && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Performance & Key Impact Metrics</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {project.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      {m.value}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Architecture Highlights */}
          {project.highlights && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                <span>Key Technical Highlights</span>
              </h4>
              <ul className="space-y-2">
                {project.highlights.map((h, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack Badges */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tech Stack Used</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((t, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Action Links */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#0d1019] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Source Code</span>
            </a>
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
