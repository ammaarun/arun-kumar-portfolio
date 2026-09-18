import React from 'react';
import { Server, Layout, Database, ShieldCheck, Cpu, Award } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export const About = () => {
  const { personalInfo, stats } = portfolioData;

  const pillars = [
    {
      title: "Microservices & Distributed Systems",
      icon: Server,
      description: "Building scalable, event-driven backend architectures using Java 17/21, Spring Boot, Kafka, and Redis with high availability and fault tolerance."
    },
    {
      title: "Modern Full-Stack Integration",
      icon: Layout,
      description: "Connecting resilient Spring Boot REST APIs with sleek, interactive React & Tailwind CSS user interfaces for seamless end-to-end user experiences."
    },
    {
      title: "Database Performance & Optimization",
      icon: Database,
      description: "Designing normalized PostgreSQL & MySQL relational schemas, indexing high-query tables, and reducing latency through smart caching strategies."
    },
    {
      title: "Clean Code & Quality Engineering",
      icon: ShieldCheck,
      description: "Enforcing SOLID principles, robust unit testing with JUnit 5 / Mockito, secure authentication (JWT/OAuth2), and automated CI/CD pipelines."
    }
  ];

  return (
    <section id="about" className="py-20 relative bg-slate-100/50 dark:bg-[#0d1019] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>BACKGROUND & PHILOSOPHY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineering High-Performance Solutions with Precision
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            A look into how I design, develop, and deliver modern enterprise software.
          </p>
        </div>

        {/* Narrative & Key Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Bio Narrative */}
          <div className="lg:col-span-6 space-y-5 text-slate-600 dark:text-slate-300">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Crafting backend robustness with frontend elegance
            </h3>
            <p className="leading-relaxed">
              {personalInfo.bio}
            </p>
            <p className="leading-relaxed">
              Based in Telangana, India, I take pride in building enterprise-grade applications that balance bulletproof security, low-latency API execution, and clean user interfaces. Whether configuring Kafka event streams or optimizing a complex SQL query, my goal is always to deliver software that scales effortlessly.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>COMMITTED TO MAINTAINABLE ARCHITECTURE & CONTINUOUS INTEGRATION</span>
            </div>
          </div>

          {/* Key Stats Counter Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6">
            {stats.map((stat, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all duration-300 group"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-gradient group-hover:scale-105 transition-transform origin-left">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
