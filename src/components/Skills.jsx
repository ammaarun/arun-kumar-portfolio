import React, { useState } from 'react';
import { Server, Layout, Database, Cloud, Star, CheckCircle, Code2, Sparkles, BookOpen, Briefcase, Award } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Skills = () => {
  const { data } = useData();
  const skills = data?.skills || [];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(skills.map(s => s.category).filter(Boolean))];

  const categoryIcons = {
    'Backend Engineering': Server,
    'Frontend Development': Layout,
    'Databases & Caching': Database,
    'DevOps, Cloud & Tools': Cloud,
    'Data Analysis & Languages': Database,
    'BI & Visualization Tools': Layout,
    'UX Research & Strategy': Sparkles,
    'UI & Systems Design': Layout,
    'Teaching & Pedagogy': BookOpen,
    'Business Strategy': Briefcase
  };

  const filteredSkills = selectedCategory === 'All'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  return (
    <section id="skills" className="py-20 relative bg-[#0a0d14] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            <Code2 className="w-3.5 h-3.5" />
            <span>SKILLS & EXPERTISE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Core Competencies & Specialized Toolsets
          </h2>
          <p className="text-base text-slate-400">
            A comprehensive overview of key skills, methodologies, frameworks, and specialized tools.
          </p>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-[#121723] text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSkills.map((group, gIdx) => {
            const Icon = categoryIcons[group.category] || Server;
            return (
              <div 
                key={gIdx}
                className="p-6 rounded-2xl bg-[#121723] border border-slate-800/80 shadow-sm space-y-6 hover:border-emerald-500/40 transition-all duration-300"
              >
                {/* Category Header */}
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {group.category}
                  </h3>
                </div>

                {/* Skill Items */}
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item, iIdx) => (
                    <div 
                      key={iIdx}
                      className="px-3.5 py-2 rounded-xl bg-[#0a0d14] border border-slate-800 flex items-center space-x-2 text-xs font-semibold text-slate-200 hover:border-slate-700 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item.name}</span>
                      {item.popular && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 font-mono shrink-0 border border-amber-500/20">
                          <Star className="w-2.5 h-2.5 mr-0.5 fill-amber-400 shrink-0" /> Core
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
