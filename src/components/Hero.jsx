import React, { useState } from 'react';
import { ArrowRight, MapPin, Download, Mail, Check, Copy, Code2, Terminal, Sparkles } from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from './SocialIcons';
import { useData } from '../context/DataContext';

export const Hero = ({ onOpenResume }) => {
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

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Subtle Background Glow Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column - Intro & Editorial Typography */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Status Pill */}
            {personalInfo.availability && (
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{personalInfo.availability}</span>
              </div>
            )}

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Hi, I'm <span className="text-gradient">{personalInfo.name || 'Arun Kumar'}</span>
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300">
                {personalInfo.role || 'Java Developer | Full Stack Developer'}
              </p>
            </div>

            {/* Location & Tagline */}
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Based in <strong className="text-slate-800 dark:text-slate-200">{personalInfo.location || 'Telangana, India'}</strong></span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Spring Boot & React Specialist</span>
              </span>
            </div>

            {/* Narrative Summary */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {personalInfo.shortBio || personalInfo.tagline}
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#projects"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
              >
                <span>View Featured Work</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onOpenResume}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Download CV</span>
              </button>
            </div>

            {/* Social Links */}
            <div className="pt-4 flex items-center space-x-4 border-t border-slate-200/80 dark:border-slate-800/80 max-w-md">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Connect:
              </span>
              <div className="flex items-center space-x-2">
                {personalInfo.github && (
                  <a
                    href={personalInfo.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                    className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                    className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Twitter / X"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                )}
                {personalInfo.email && (
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Direct Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Live Code / Terminal Widget */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl shadow-2xl border border-slate-800/90 bg-[#0d1117] overflow-hidden group">
              <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                  <span className="text-xs font-mono text-slate-400 ml-2 flex items-center space-x-1">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>arun@dev-station:~</span>
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
                    Backend (Java)
                  </button>
                  <button
                    onClick={() => setActiveTab('react')}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                      activeTab === 'react'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Frontend (React)
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

              <div className="px-4 py-2 bg-[#161b22] border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>SPRING BOOT & REACT READY</span>
                </div>
                <span>UTF-8</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
