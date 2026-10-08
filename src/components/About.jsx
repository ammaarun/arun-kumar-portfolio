import React from 'react';
import { Server, Layout, Database, ShieldCheck, Cpu, Award, Sparkles, Target, BookOpen, Layers } from 'lucide-react';
import { useData } from '../context/DataContext';

export const About = () => {
  const { data } = useData();
  const personalInfo = data.personalInfo || {};
  const stats = data.stats || [];

  // Generate dynamic pillars based on profession profile type if customized pillars are missing
  const getPillars = () => {
    if (Array.isArray(data.aboutPillars) && data.aboutPillars.length > 0) {
      return data.aboutPillars;
    }
    if (Array.isArray(data.pillars) && data.pillars.length > 0) {
      return data.pillars;
    }

    const pType = (personalInfo.profileType || '').toLowerCase();
    const roleStr = (personalInfo.role || '').toLowerCase();

    if (pType === 'analyst' || roleStr.includes('analyst') || roleStr.includes('data')) {
      return [
        { title: "ETL & Data Engineering", icon: Database, description: "Building automated data pipelines, cleaning complex multi-source datasets, and optimizing SQL queries." },
        { title: "BI & Interactive Dashboards", icon: Layout, description: "Designing executive dashboards in Tableau & Power BI to communicate real-time business performance." },
        { title: "Predictive Analytics", icon: Cpu, description: "Applying statistical models and machine learning algorithms in Python to forecast trends and risk." },
        { title: "Data-Driven Insights", icon: ShieldCheck, description: "Translating granular metrics into strategic growth recommendations for key business stakeholders." }
      ];
    }
    
    if (pType === 'designer' || roleStr.includes('designer') || roleStr.includes('ui/ux')) {
      return [
        { title: "User-Centered UI/UX", icon: Layout, description: "Crafting intuitive digital interfaces through wireframing, interactive prototyping, and usability testing." },
        { title: "Design Systems & Tokenization", icon: Layers, description: "Establishing consistent visual foundations, UI component libraries, and multi-platform design tokens." },
        { title: "User Research & Insights", icon: Target, description: "Conducting qualitative user interviews and quantitative heuristic evaluations to solve real pain points." },
        { title: "Cross-Functional Handoff", icon: Sparkles, description: "Collaborating seamlessly with engineering teams to ensure pixel-perfect production implementation." }
      ];
    }

    if (pType === 'teacher' || roleStr.includes('teacher') || roleStr.includes('educator')) {
      return [
        { title: "Curriculum & Lesson Planning", icon: BookOpen, description: "Designing comprehensive, outcome-based educational curricula aligned with modern learning standards." },
        { title: "Interactive Pedagogy", icon: Target, description: "Engaging students with inquiry-based learning, digital tools, and hands-on collaborative exercises." },
        { title: "Assessment & Progress Tracking", icon: ShieldCheck, description: "Evaluating student mastery through formative and summative metrics to provide actionable feedback." },
        { title: "Continuous Mentorship", icon: Award, description: "Fostering an inclusive, encouraging classroom culture that inspires curiosity and lifelong learning." }
      ];
    }

    if (pType === 'consultant' || roleStr.includes('consultant') || roleStr.includes('business')) {
      return [
        { title: "Strategic Roadmap Planning", icon: Target, description: "Helping organizations define clear operational goals, competitive positioning, and growth strategies." },
        { title: "Process & Operations Optimization", icon: Layers, description: "Identifying workflow bottlenecks, streamlining business operations, and driving efficiency gains." },
        { title: "Financial & Market Modeling", icon: Database, description: "Analyzing market opportunities and building robust ROI projection models to inform investments." },
        { title: "Stakeholder Alignment", icon: ShieldCheck, description: "Facilitating change management and executive alignment across cross-functional leadership." }
      ];
    }

    // Default / Full Stack Developer fallback
    return [
      { title: "Architecture & Systems Design", icon: Server, description: "Designing scalable, event-driven backend systems with high availability and low latency execution." },
      { title: "Modern Full-Stack Integration", icon: Layout, description: "Connecting resilient API endpoints with sleek, responsive web interfaces for optimal user experiences." },
      { title: "Data Storage & Optimization", icon: Database, description: "Structuring normalized relational database schemas, indexing queries, and optimizing caching strategy." },
      { title: "Quality & Security Engineering", icon: ShieldCheck, description: "Enforcing clean code standards, comprehensive unit testing, automated pipelines, and strict security." }
    ];
  };

  const pillars = getPillars();

  return (
    <section id="about" className="py-20 relative bg-slate-50 dark:bg-[#0a0d14] border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>BACKGROUND & PHILOSOPHY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {personalInfo.aboutHeading || 'Professional Philosophy & Expertise'}
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            {personalInfo.aboutSubtitle || 'A closer look into how I approach problem solving, project delivery, and quality.'}
          </p>
        </div>

        {/* Narrative & Key Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Bio Narrative */}
          <div className="lg:col-span-6 space-y-5 text-slate-700 dark:text-slate-300">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {personalInfo.bioHeader || 'Delivering impactful results through dedication and precision'}
            </h3>
            <p className="leading-relaxed">
              {personalInfo.bio}
            </p>
            {personalInfo.location && (
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                Based in <strong className="text-slate-900 dark:text-white">{personalInfo.location}</strong>, I take pride in developing high-quality solutions that solve real-world problems while maintaining high professional standards.
              </p>
            )}
            <div className="pt-2 flex items-center space-x-3 text-xs font-mono text-emerald-400 font-semibold">
              <Award className="w-4 h-4 shrink-0" />
              <span className="uppercase">Committed to Continuous Learning & Excellence</span>
            </div>
          </div>

          {/* Key Stats Counter Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-5">
            {stats.map((stat, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-emerald-500/40 transition-all duration-300 group"
              >
                <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-400 group-hover:scale-105 transition-transform origin-left">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon || Sparkles;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
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
