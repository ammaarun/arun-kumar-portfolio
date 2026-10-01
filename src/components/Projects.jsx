import React, { useState } from 'react';
import { Terminal, ExternalLink, ArrowUpRight } from 'lucide-react';
import { GithubIcon } from './SocialIcons';
import { useData } from '../context/DataContext';

export const Projects = ({ onSelectProject, layoutVariant = 'grid' }) => {
  const { data } = useData();
  const projects = data?.projects || [];
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(projects.map(p => p.category).filter(Boolean))];

  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter(p => p.category === filter);

  const gridColsClass = layoutVariant === 'stack'
    ? 'grid-cols-1 max-w-4xl mx-auto'
    : 'grid-cols-1 md:grid-cols-2';

  return (
    <section id="projects" className="py-20 relative bg-[#0a0d14] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            <span>PORTFOLIO SHOWCASE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Featured Projects & Deliverables
          </h2>
          <p className="text-base text-slate-400">
            A selection of real-world projects, case studies, and key deliverables.
          </p>
        </div>

        {/* Filter Tabs */}
        {/* Filter Tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  filter === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-[#121723] text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Projects Grid */}
        <div className={`grid ${gridColsClass} gap-8`}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-2xl bg-[#121723] border border-slate-800/80 shadow-sm hover:border-emerald-500/40 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Image Preview Container */}
              <div className="relative h-52 overflow-hidden bg-[#0a0d14]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {project.category && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md bg-[#0a0d14]/90 text-emerald-400 border border-slate-800 backdrop-blur-md">
                      {project.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {project.title}
                  </h3>
                  {project.subtitle && (
                    <p className="text-xs font-mono text-emerald-400 font-semibold">
                      {project.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {/* Tech / Skill Stack Pills */}
                {Array.isArray(project.tech || project.tags) && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(project.tech || project.tags).map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 text-[11px] font-mono bg-[#0a0d14] text-slate-300 rounded border border-slate-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onSelectProject(project)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:underline"
                  >
                    <span>View Case Details</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-2">
                    {project.github && typeof project.github === 'string' && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Repository"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
