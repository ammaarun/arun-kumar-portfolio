import React from 'react';
import { Quote, Star, MessageSquare } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Testimonials = () => {
  const { data } = useData();
  const testimonials = (data.testimonials || []).filter(t => t.visible !== false);

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 relative bg-slate-100/50 dark:bg-[#0d1019] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>CLIENT & LEAD FEEDBACK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Endorsements & Recommendations
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            What directors, team leads, and product managers say about working with me.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((item) => (
            <div 
              key={item.id}
              className="p-8 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Quote Icon & Rating Stars */}
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Quote className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{item.content}"
                </p>
              </div>

              {/* Reviewer Profile Header */}
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center font-mono">
                    {item.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.role} <span className="text-emerald-500">• {item.company}</span>
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
