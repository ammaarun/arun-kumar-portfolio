import React, { useState } from 'react';
import { Briefcase, MapPin, CheckCircle2, Building2, GraduationCap, Award } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Experience = () => {
  const { data } = useData();
  const experience = data.experience || [];
  const education = data.education || [];

  const [activeTab, setActiveTab] = useState('experience');

  return (
    <section id="experience" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>CAREER & ACADEMICS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Work History & Education
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            A timeline of software engineering roles, microservice migrations, and academic background.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center space-x-2 mb-12">
          <button
            onClick={() => setActiveTab('experience')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'experience'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-white shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-[#121723] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Work Experience ({experience.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'education'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-white shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-[#121723] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Education & Degrees ({education.length})</span>
          </button>
        </div>

        {/* Work Experience Timeline */}
        {activeTab === 'experience' && (
          <div className="relative max-w-4xl mx-auto">
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
                    <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white dark:bg-[#0a0d14] border-2 border-emerald-500 flex items-center justify-center shadow-md z-10 hidden sm:flex">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                    </div>

                    <div className={`w-full sm:w-1/2 ${isEven ? 'sm:pl-12' : 'sm:pr-12'}`}>
                      <div className="p-6 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-emerald-500/40 transition-all duration-300 space-y-4">
                        
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

                        {exp.achievements && (
                          <ul className="space-y-2 pt-2">
                            {exp.achievements.map((ach, aIdx) => (
                              <li key={aIdx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                <span>{ach}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {exp.skills && (
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
                        )}

                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Education Sub-timeline */}
        {activeTab === 'education' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {education.map((edu, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-start space-x-4"
              >
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap justify-between items-baseline">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {edu.degree}
                    </h3>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {edu.period}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {edu.institution}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {edu.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
