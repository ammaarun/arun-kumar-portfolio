import React from 'react';
import { Server, Layout, Database, Code2, ArrowRight, Sparkles, CheckCircle2, Check, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { siteConfig } from '../config/siteConfig';

export const Services = ({ onOpenInquiry }) => {
  const { data } = useData();
  const services = data.services || [];
  const personalInfo = data.personalInfo || {};
  const freelancePackages = siteConfig.freelanceOfferings?.packages || [];

  const showFreelancerCTA = personalInfo.showFreelancerCTA !== undefined
    ? personalInfo.showFreelancerCTA
    : (personalInfo.profileType === 'freelancer' || data?.profileType === 'freelancer');

  const serviceIcons = {
    Server: Server,
    Layout: Layout,
    Database: Database,
    Code2: Code2
  };

  return (
    <section id="services" className="py-20 relative bg-[#0a0d14] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SERVICES & OFFERINGS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Specialized Development & Professional Services
          </h2>
          <p className="text-base text-slate-400">
            Tailored solutions engineered to deliver high-impact results for clients and organizations.
          </p>
        </div>

        {/* Featured Freelance Portfolio Packages Banner */}
        {showFreelancerCTA && freelancePackages.length > 0 && (
          <div className="p-8 sm:p-10 rounded-2xl bg-[#121723] text-white border border-slate-800 shadow-2xl relative overflow-hidden space-y-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold border border-emerald-500/30">
                  <Zap className="w-3.5 h-3.5" />
                  <span>FREELANCE PORTFOLIO OFFERING</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Want Your Own Custom Portfolio & Live CMS?
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Stand out to recruiters and clients with a dynamic professional portfolio, protected `/admin` dashboard, and permanent cloud database persistence. Delivered in 48 hours.
                </p>
              </div>

              <button
                onClick={() => onOpenInquiry && onOpenInquiry('cms')}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] shrink-0"
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
                  className={`p-6 rounded-2xl bg-[#0a0d14] border transition-all flex flex-col justify-between space-y-4 ${
                    pkg.popular ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-slate-800'
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
                    className="w-full py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-emerald-600 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
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
                className="p-8 rounded-2xl bg-[#121723] border border-slate-800/80 shadow-sm hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    {service.pricing && (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#0a0d14] text-slate-300 border border-slate-800">
                        {service.pricing}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <a
                    href="#contact"
                    className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:underline"
                  >
                    <span>Request Service Inquiry</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
