import React from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2, Building2 } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export const Experience = () => {
  const { experience } = portfolioData;

  return (
    <section id="experience" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>CAREER JOURNEY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Work Experience & Track Record
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            A timeline of software engineering roles, microservice migrations, and team contributions.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Center Line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 hidden sm:block" />

          <div className="space-y-12">
            {experience.map((exp, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div 
                  key={idx}
                  className={`relative flex flex-col sm:flex-row items-center ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Badge Dot */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white dark:bg-[#0a0d14] border-2 border-emerald-500 flex items-center justify-center shadow-md z-10 hidden sm:flex">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                  </div>

                  {/* Content Card */}
                  <div className={`w-full sm:w-1/2 ${isEven ? 'sm:pl-12' : 'sm:pr-12'}`}>
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-emerald-500/40 transition-all duration-300 space-y-4">
                      
                      {/* Role & Company Header */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {exp.period}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            <span>{exp.location}</span>
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {exp.role}
                        </h3>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {exp.company}
                        </p>
                      </div>

                      {/* Achievements List */}
                      <ul className="space-y-2 pt-2">
                        {exp.achievements.map((ach, aIdx) => (
                          <li key={aIdx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{ach}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Tech Stack Used */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1">
                        {exp.skills.map((s, sIdx) => (
                          <span 
                            key={sIdx}
                            className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
