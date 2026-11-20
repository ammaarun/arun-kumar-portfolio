import React, { useState } from 'react';
import {
  ArrowRight,
  MapPin,
  Download,
  Mail,
  Check,
  Copy,
  Code2,
  Terminal,
  Sparkles,
  User,
  ExternalLink
} from 'lucide-react';
import {
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
  InstagramIcon,
  WebsiteIcon
} from './SocialIcons';
import { useData } from '../context/DataContext';
import { NeonPublicImage } from './NeonPublicImage';

const SOCIAL_PLATFORMS = [
  { key: 'github', label: 'GitHub', icon: GithubIcon },
  { key: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon },
  { key: 'twitter', label: 'Twitter / X', icon: TwitterIcon },
  { key: 'youtube', label: 'YouTube', icon: YoutubeIcon },
  { key: 'instagram', label: 'Instagram', icon: InstagramIcon },
  { key: 'website', label: 'Personal Website', icon: WebsiteIcon },
];

const isValidUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  if (!trimmed || trimmed === '#') return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * Resolves the list of Hero CTAs with independent label and action mapping.
 * Provides backward compatibility for older client records and presets.
 */
export const resolveHeroCtas = (personalInfo, data) => {
  if (Array.isArray(personalInfo?.heroCtas) && personalInfo.heroCtas.length > 0) {
    return [...personalInfo.heroCtas].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  const isFreelancerCTA = personalInfo?.showFreelancerCTA !== undefined
    ? personalInfo.showFreelancerCTA
    : (personalInfo?.profileType === 'freelancer' || data?.profileType === 'freelancer');

  const legacyCta = (personalInfo?.heroCtaText || '').trim();
  const legacyProjectsCta = (personalInfo?.heroProjectsCtaText || '').trim();

  let projectsLabel = 'View My Projects';
  let contactLabel = isFreelancerCTA ? 'Request Custom Portfolio' : 'Contact Me';

  if (legacyProjectsCta) {
    projectsLabel = legacyProjectsCta;
  }

  if (legacyCta) {
    const lower = legacyCta.toLowerCase();
    const isProjectLike =
      lower.includes('project') ||
      lower.includes('work') ||
      lower.includes('app') ||
      lower.includes('case stud') ||
      lower.includes('design') ||
      lower.includes('course') ||
      lower.includes('curriculum');

    if (isProjectLike) {
      // Legacy text was clearly intended for the projects button
      projectsLabel = legacyCta;
      contactLabel = isFreelancerCTA ? 'Request Custom Portfolio' : 'Contact Me';
    } else {
      // Legacy text was intended for the contact / inquiry button
      contactLabel = legacyCta;
      if (!legacyProjectsCta) {
        projectsLabel = 'View My Projects';
      }
    }
  }

  return [
    {
      id: 'projects',
      action: 'projects',
      label: projectsLabel,
      enabled: true,
      style: 'primary',
      order: 1
    },
    {
      id: 'contact',
      action: 'contact',
      label: contactLabel,
      enabled: true,
      style: 'secondary',
      order: 2
    },
    {
      id: 'resume',
      action: 'resume',
      label: 'Download Resume',
      enabled: true,
      style: 'outline',
      order: 3
    }
  ];
};

export const Hero = ({ onOpenResume, onOpenInquiry }) => {
  const { data } = useData();
  const personalInfo = data?.personalInfo || {};
  const codeSnippets = data?.codeSnippets || {};

  const [activeTab, setActiveTab] = useState('java');
  const [copied, setCopied] = useState(false);
  const [resumeError, setResumeError] = useState('');

  const activeResume = (data?.resumes || []).find(r => r.isActive) || (data?.resumes || [])[0];
  const resumeUrl = activeResume?.url || personalInfo?.resumeUrl;
  const hasResume = Boolean(resumeUrl && resumeUrl !== '#' && String(resumeUrl).trim() !== '');

  const handleDownloadResume = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setResumeError('');

    if (!hasResume) {
      setResumeError('Resume document is currently unavailable.');
      return;
    }

    const targetSlug = data?.slug || (typeof window !== 'undefined' && window.location.pathname.startsWith('/portfolio/') ? window.location.pathname.split('/')[2] : '');
    const downloadEndpoint = `/api/portfolio/resume/download${targetSlug ? `/${encodeURIComponent(targetSlug)}` : ''}`;

    const link = document.createElement('a');
    link.href = downloadEndpoint;
    link.setAttribute('download', activeResume?.name || `${personalInfo.name || 'Resume'}-Resume.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  // Section visibility checks
  const rawSections = data?.designConfig?.sections;
  const isSectionVisible = (sectionId) => {
    if (!rawSections || !Array.isArray(rawSections) || rawSections.length === 0) {
      return true;
    }
    const sec = rawSections.find(s => s.id === sectionId);
    return sec ? sec.visible !== false : true;
  };

  const isContactEnabled = data?.contactSettings?.enabled !== false;
  const showProjectsSection = isSectionVisible('projects');
  const showContactSection = isSectionVisible('contact') && isContactEnabled;

  const handleScrollToProjects = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isFreelancerCTA && onOpenInquiry) {
      onOpenInquiry();
      return;
    }
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (personalInfo.email) {
      window.location.href = `mailto:${personalInfo.email}`;
    }
  };

  const showVisual = visualType !== 'none' && visualType !== 'hidden';

  // Compute enabled and valid social links
  const visibleSocialLinks = SOCIAL_PLATFORMS.filter(plat => {
    const url = personalInfo[plat.key];
    if (!url || typeof url !== 'string' || !url.trim() || !isValidUrl(url)) {
      return false;
    }
    if (personalInfo.socialVisibility && personalInfo.socialVisibility[plat.key] === false) {
      return false;
    }
    return true;
  }).map(plat => ({
    ...plat,
    url: personalInfo[plat.key].trim()
  }));

  // Resolve independent Hero CTAs
  const resolvedCtas = resolveHeroCtas(personalInfo, data);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-slate-50 dark:bg-[#0a0d14]">
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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Hi, I'm <span className="text-emerald-400">{personalInfo.name || 'Professional'}</span>
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300">
                {personalInfo.role || personalInfo.tagline || 'Professional Portfolio'}
              </p>
            </div>

            {/* Location & Specialization Tagline */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
              {personalInfo.location && (
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Based in <strong className="text-slate-800 dark:text-slate-200">{personalInfo.location}</strong></span>
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
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
              {personalInfo.shortBio || personalInfo.bio || personalInfo.tagline}
            </p>

            {/* Dynamic Hero Action Buttons (CTAs) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {resolvedCtas.map(cta => {
                if (cta.enabled === false) return null;

                // Section visibility & availability checks
                if (cta.action === 'projects' && !showProjectsSection) return null;
                if (cta.action === 'contact' && !showContactSection) return null;
                if (cta.action === 'resume' && !hasResume) return null;
                if (cta.action === 'external' && !cta.url) return null;

                const styleClass = cta.style === 'primary'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]'
                  : cta.style === 'outline'
                  ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all'
                  : 'bg-white dark:bg-[#121723] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-xs transition-all';

                if (cta.action === 'projects') {
                  return (
                    <a
                      key={cta.id || 'projects'}
                      href="#projects"
                      onClick={handleScrollToProjects}
                      className={`inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl ${styleClass}`}
                    >
                      <Code2 className="w-4 h-4" />
                      <span>{cta.label}</span>
                      {cta.style === 'primary' && <ArrowRight className="w-4 h-4" />}
                    </a>
                  );
                }

                if (cta.action === 'contact') {
                  return (
                    <button
                      key={cta.id || 'contact'}
                      type="button"
                      onClick={handleContactClick}
                      className={`inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl ${styleClass}`}
                    >
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span>{cta.label}</span>
                    </button>
                  );
                }

                if (cta.action === 'resume') {
                  return (
                    <button
                      key={cta.id || 'resume'}
                      type="button"
                      onClick={handleDownloadResume}
                      className={`inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl ${styleClass}`}
                      aria-label={cta.label}
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>{cta.label}</span>
                    </button>
                  );
                }

                if (cta.action === 'external') {
                  return (
                    <a
                      key={cta.id || 'external'}
                      href={cta.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl ${styleClass}`}
                    >
                      <span>{cta.label}</span>
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                    </a>
                  );
                }

                return null;
              })}
            </div>

            {resumeError && (
              <p className="text-xs text-rose-400 mt-2 font-medium animate-fadeIn" role="alert">
                {resumeError}
              </p>
            )}

            {/* Social Links */}
            {(visibleSocialLinks.length > 0 || personalInfo.email) && (
              <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-slate-200/80 dark:border-slate-800/80 max-w-lg">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  Connect:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {visibleSocialLinks.map((plat) => {
                    const IconComp = plat.icon;
                    return (
                      <a
                        key={plat.key}
                        href={plat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#121723] transition-colors"
                        title={plat.label}
                        aria-label={plat.label}
                      >
                        <IconComp className="w-4 h-4" />
                      </a>
                    );
                  })}
                  {personalInfo.email && (
                    <a
                      href={`mailto:${personalInfo.email}`}
                      className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#121723] transition-colors"
                      title="Direct Email"
                      aria-label="Direct Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Configurable Hero Visual */}
          {showVisual && (
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              {visualType === 'image' && personalInfo.image ? (
                /* Profile / Avatar Image Visual */
                <div className="relative mx-auto max-w-sm sm:max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-[#0e131f] shadow-2xl p-3">
                  <div className="w-full h-full rounded-2xl overflow-hidden relative">
                    <NeonPublicImage
                      src={personalInfo.image}
                      alt={personalInfo.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Decorative Corner Accents */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                </div>
              ) : (
                /* Developer Terminal / Code Visual */
                <div className="relative rounded-2xl bg-slate-900 dark:bg-[#0e131f] border border-slate-800 shadow-2xl overflow-hidden">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      <span className="text-xs font-mono text-slate-400 ml-2">
                        {currentSnippet.filename}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {codeSnippets.java && (
                        <button
                          onClick={() => setActiveTab('java')}
                          className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                            activeTab === 'java'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Java
                        </button>
                      )}
                      {codeSnippets.react && (
                        <button
                          onClick={() => setActiveTab('react')}
                          className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                            activeTab === 'react'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          React
                        </button>
                      )}
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy code"
                        aria-label="Copy code"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Terminal Code Body */}
                  <div className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed bg-[#0a0d14]/90 max-h-[420px] text-left">
                    <pre className="text-slate-300">
                      <code>{currentSnippet.code}</code>
                    </pre>
                  </div>

                  {/* Terminal Footer */}
                  <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3 h-3 text-emerald-400" />
                      <span>{personalInfo.eyebrow || 'READY'}</span>
                    </div>
                    <span className="text-emerald-400/80">
                      {personalInfo.specialization ? `• ${personalInfo.specialization}` : '• UTF-8'}
                    </span>
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
