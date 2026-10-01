import React, { useState } from 'react';
import { Award, BookOpen, FileText, Globe, Heart, ShieldCheck, HelpCircle, DollarSign, ExternalLink, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const iconMap = {
  Award,
  BookOpen,
  FileText,
  Globe,
  Heart,
  ShieldCheck,
  HelpCircle,
  DollarSign,
  Sparkles
};

export const CustomSectionRenderer = ({ section }) => {
  if (!section || section.visible === false) return null;

  const [expandedFaq, setExpandedFaq] = useState({});

  const toggleFaq = (idx) => {
    setExpandedFaq(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const SectionIcon = iconMap[section.icon] || Sparkles;
  const layout = section.layout || 'cards';
  const items = Array.isArray(section.content) ? section.content : [];

  return (
    <section id={section.id} className="py-20 relative bg-[#0a0d14] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold uppercase">
            <SectionIcon className="w-3.5 h-3.5" />
            <span>{section.name || section.title || 'Section'}</span>
          </div>
          {section.title && (
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {section.title}
            </h2>
          )}
          {section.subtitle && (
            <p className="text-base text-slate-400">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Content Renderers by Layout */}

        {/* 1. CARDS / GRID LAYOUT */}
        {(layout === 'cards' || layout === 'grid') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {item.image && (
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {item.title && <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>}
                      {item.subtitle && <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{item.subtitle}</p>}
                    </div>
                    {item.badge && (
                      <span className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {Array.isArray(item.tags) && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 pt-2"
                  >
                    <span>{item.linkText || 'Learn More'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 2. LIST / TIMELINE LAYOUT */}
        {(layout === 'list' || layout === 'timeline') && (
          <div className="max-w-4xl mx-auto space-y-4">
            {items.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.subtitle && <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{item.subtitle}</p>}
                  {item.description && <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>}
                </div>

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-600 hover:text-white transition-colors shrink-0 flex items-center space-x-1"
                  >
                    <span>{item.linkText || 'View'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 3. FAQ ACCORDION LAYOUT */}
        {layout === 'faq' && (
          <div className="max-w-3xl mx-auto space-y-3">
            {items.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-500 transition-colors"
                >
                  <span>{item.title || item.question}</span>
                  {expandedFaq[idx] ? <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>

                {expandedFaq[idx] && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {item.description || item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 4. STATISTICS LAYOUT */}
        {layout === 'statistics' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-sm"
              >
                <div className="text-3xl font-extrabold text-emerald-500 font-mono">{item.value || item.title}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label || item.subtitle}</div>
                {item.description && <div className="text-[11px] text-slate-500">{item.description}</div>}
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
