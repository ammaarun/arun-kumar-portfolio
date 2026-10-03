import React, { useState } from 'react';
import { ArrowRight, MapPin, Download, Mail, Check, Copy, Code2, Terminal, Sparkles, User } from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from './SocialIcons';
import { useData } from '../context/DataContext';
import { NeonPublicImage } from './NeonPublicImage';

export const Hero = ({ onOpenResume, onOpenInquiry }) => {
  const { data } = useData();
  const personalInfo = data.personalInfo || {};
  const codeSnippets = data.codeSnippets || {};

  const [activeTab, setActiveTab] = useState('java');
  const [copied, setCopied] = useState(false);

  const currentSnippet = codeSnippets[activeTab] || { filename: 'snippet.java', code: '// Loading...' };

  const handleCopy = () => {
    if (currentSnippet?.code) {
      navigator.clipboard.writeText(currentSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const visualType = personalInfo.heroVisualType || data?.designConfig?.layout?.heroVisual || (
    personalInfo.profileType === 'freelancer' ? 'none' : 'code'
  );

  const isFreelancerCTA = personalInfo.showFreelancerCTA !== undefined
    ? personalInfo.showFreelancerCTA
    : (personalInfo.profileType === 'freelancer' || data?.profileType === 'freelancer');

  const primaryCtaText = personalInfo.heroCtaText || (
    isFreelancerCTA ? 'Request Custom Portfolio' : 'Get in Touch'
  );

  const handlePrimaryCtaClick = () => {
    if (isFreelancerCTA && onOpenInquiry) {
      onOpenInquiry();
    } else {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      } else if (personalInfo.email) {
        window.location.href = `mailto:${personalInfo.email}`;
      }
    }
  };

  const showVisual = visualType !== 'none' && visualType !== 'hidden';

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#0a0d14]">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${showVisual ? 'lg:grid-cols-12 gap-12 lg:gap-8' : 'max-w-4xl mx-auto'} items-center`}>
          
          {/* Left Column - Editorial Intro */}
          <div className={`${showVisual ? 'lg:col-span-7' : 'w-full'} space-y-7 text-left`}>
            {/* Status Pill */}
            {personalInfo.availability && (
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{personalInfo.availability}</span>
              </div>
            )}

            {/* Main Headline */}
            <div className="space-y-2.5">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Hi, I'm <span className="text-emerald-400">{personalInfo.name || 'Professional'}</span>
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-slate-300">
                {personalInfo.role || personalInfo.tagline || 'Professional Portfolio'}
              </p>
            </div>

            {/* Location & Specialization Tagline */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 font-mono">
              {personalInfo.location && (
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Based in <strong className="text-slate-200">{personalInfo.location}</strong></span>
                </span>
              )}
              {personalInfo.location && personalInfo.specialization && (
                <span className="text-slate-700">•</span>
              )}
              {personalInfo.specialization ? (
                <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{personalInfo.specialization}</span>
                </span>
              ) : null}
            </div>

            {/* Narrative Summary */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {personalInfo.shortBio || personalInfo.bio || personalInfo.tagline}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {primaryCtaText ? (
                <button
                  onClick={handlePrimaryCtaClick}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : null}

              <a
                href="#projects"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#121723] hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs transition-all"
              >
                <span>View Featured Work</span>
              </a>

              <button
                onClick={onOpenResume}
                className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>View Resume</span>
              </button>
            </div>

            {/* Social Links */}
            <div className="pt-4 flex items-center space-x-4 border-t border-slate-800/80 max-w-md">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                Connect:
              </span>
              <div className="flex items-center space-x-2">
                {personalInfo.github && (
                  <a
                    href={personalInfo.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-[#121723] transition-colors"
                    title="GitHub Profile"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}
                {personalInfo.linkedin && (
                  <a
                    href={personalInfo.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-[#121723] transition-colors"
                    title="LinkedIn Profile"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                )}
                {personalInfo.twitter && (
                  <a
                    href={personalInfo.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-[#121723] transition-colors"
                    title="Twitter / X"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                )}
                {personalInfo.email && (
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-[#121723] transition-colors"
                    title="Direct Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Configurable Hero Visual */}
          {showVisual && (
            <div className="lg:col-span-5">
              {visualType === 'image' ? (
                <div className="flex justify-center">
                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#121723] group">
                    <NeonPublicImage
                      src={personalInfo.image}
                      alt={personalInfo.name || 'Hero'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <User className="w-20 h-20 text-emerald-500/30" />
                        </div>
                      }
                    />
                  </div>
                </div>
              ) : visualType === 'highlights' ? (
                <div className="p-6 rounded-2xl bg-[#121723] border border-slate-800 space-y-4">
                  <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Professional Highlights</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(data.stats || []).map((s, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800/80">
                        <div className="text-2xl font-bold font-mono text-emerald-400">{s.value}</div>
                        <div className="text-xs font-semibold text-white mt-1">{s.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{s.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl shadow-2xl border border-slate-800 bg-[#0d1117] overflow-hidden group">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                      <span className="text-xs font-mono text-slate-400 ml-2 flex items-center space-x-1">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>workstation:~</span>
                      </span>
                    </div>

                    <div className="flex items-center bg-[#0d1117] p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => setActiveTab('java')}
                        className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                          activeTab === 'java'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Backend
                      </button>
                      <button
                        onClick={() => setActiveTab('react')}
                        className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                          activeTab === 'react'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Frontend
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-2 bg-[#12161f] border-b border-slate-800/60 text-xs font-mono text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-200">{currentSnippet.filename}</span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Copy snippet"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed bg-[#0d1117] max-h-80">
                    <code>{currentSnippet.code}</code>
                  </pre>

                  <div className="px-4 py-2 bg-[#161b22] border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{personalInfo.availability ? personalInfo.availability.toUpperCase() : 'AVAILABLE FOR PROJECTS'}</span>
                    </div>
                    <span>UTF-8</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
