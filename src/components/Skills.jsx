import React, { useState } from 'react';
import { Server, Layout, Database, Cloud, Star, CheckCircle, Code2 } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export const Skills = () => {
  const { skills } = portfolioData;
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...skills.map(s => s.category)];

  const categoryIcons = {
    'Backend Engineering': Server,
    'Frontend Development': Layout,
    'Databases & Caching': Database,
    'DevOps, Cloud & Tools': Cloud,
  };

  const filteredSkills = selectedCategory === 'All'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  return (
    <section id="skills" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
            <Code2 className="w-3.5 h-3.5" />
            <span>TECHNICAL CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tech Stack & Specialized Expertise
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            A comprehensive overview of my backend, frontend, database, and cloud toolsets.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-[#121723] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredSkills.map((group, gIdx) => {
            const Icon = categoryIcons[group.category] || Server;
            return (
              <div 
                key={gIdx}
                className="p-6 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                {/* Category Header */}
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {group.category}
                  </h3>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {group.items.map((item, iIdx) => (
                    <div key={iIdx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{item.name}</span>
                          {item.popular && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                              <Star className="w-2.5 h-2.5 mr-0.5 fill-amber-400" /> Core
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-slate-400 dark:text-slate-500">
                          {item.level}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                          style={{ width: `${item.level}%` }}
                        />
                      </div>
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
