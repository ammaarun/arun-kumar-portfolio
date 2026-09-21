import React from 'react';
import { Server, Layout, Database, Code2, ArrowRight, Sparkles, CheckCircle2, Check, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { siteConfig } from '../config/siteConfig';

export const Services = ({ onOpenInquiry }) => {
  const { data } = useData();
  const services = data.services || [];
  const freelancePackages = siteConfig.freelanceOfferings?.packages || [];

  const serviceIcons = {
    Server: Server,
    Layout: Layout,
    Database: Database,
    Code2: Code2
  };

  return (
    <section id="services" className="py-20 relative bg-slate-100/50 dark:bg-[#0d1019] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SERVICES & FREELANCING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Specialized Development & Custom Portfolio Offerings
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Tailored engineering solutions for enterprise backends, full-stack products, and custom developer portfolio creation.
          </p>
        </div>

        {/* Featured Freelance Portfolio Packages Banner */}
        {freelancePackages.length > 0 && (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#101926] text-white border border-slate-800 shadow-2xl relative overflow-hidden space-y-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold border border-emerald-500/30">
                  <Zap className="w-3.5 h-3.5" />
                  <span>CLIENT FREELANCE OFFERING</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Want Your Own High-Impact Developer Portfolio & Live CMS?
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Stand out to recruiters and clients with a full-stack dynamic portfolio, protected `/admin` dashboard, and permanent cloud database persistence. Delivered in 48 hours.
                </p>
              </div>

              <button
                onClick={() => onOpenInquiry && onOpenInquiry('cms')}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Portfolio Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800 relative z-10">
              {freelancePackages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className={`p-6 rounded-2xl bg-slate-800/60 border transition-all flex flex-col justify-between space-y-4 ${
                    pkg.popular ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-slate-700/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">{pkg.name}</span>
                      {pkg.badge && (
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded-full font-semibold border border-emerald-500/30">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold font-mono text-white">{pkg.price}</span>
                      <span className="text-xs text-slate-400 font-mono">({pkg.localPrice})</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{pkg.description}</p>
                  </div>

                  <button
                    onClick={() => onOpenInquiry && onOpenInquiry(pkg.id)}
                    className="w-full py-2 text-xs font-semibold text-white bg-slate-700 hover:bg-emerald-600 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <span>Select Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon] || Server;
            return (
              <div 
                key={service.id}
                className="p-8 rounded-2xl bg-white dark:bg-[#121723] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    {service.pricing && (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {service.pricing}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <a
                    href="#contact"
                    className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>Request Service Inquiry</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
