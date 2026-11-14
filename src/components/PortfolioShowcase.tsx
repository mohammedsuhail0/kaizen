import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger, cubicBezier } from 'animejs';
import { ArrowUpRight, Check, MessageSquare, ExternalLink, Globe } from 'lucide-react';
import { PROJECTS, AGENCY_CONFIG, getWhatsAppUrl, handleWhatsAppInstantClick } from '../data/agencyData';
import type { ProjectItem } from '../data/agencyData';

export const PortfolioShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'WEBSITE' | 'MOBILE WEBAPP'>('ALL');
  const [activeIdx, setActiveIdx] = useState(0);
  const showcaseRef = useRef<HTMLDivElement>(null);

  const filteredProjects = PROJECTS.filter((p) => {
    if (activeTab === 'ALL') return true;
    return p.type === activeTab;
  });

  const current = filteredProjects[activeIdx] || filteredProjects[0] || PROJECTS[0];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = showcaseRef.current?.querySelectorAll('.stagger-portfolio');
    if (!items || items.length === 0) return;

    animate(items, {
      translateY: [16, 0],
      opacity: [0, 1],
      delay: stagger(50, { start: 60 }),
      ease: cubicBezier(0.16, 1, 0.3, 1),
      duration: 600,
    });
  }, [activeTab]);

  const getWaInquiryUrl = (p: ProjectItem) => {
    const text = `Hi! I saw the "${p.name}" live demo on your website and really liked it. I'm looking for something similar for my business—can we discuss details?`;
    return getWhatsAppUrl(text);
  };

  return (
    <div
      id="demos"
      ref={showcaseRef}
      className="w-full text-left select-none flex flex-col justify-center max-w-5xl py-2 scroll-mt-24"
    >
      {/* 1. Top Section Header */}
      <div className="stagger-portfolio flex flex-wrap items-end justify-between border-b border-white/15 pb-3 mb-4">
        <div>
          <h2 className="type-h2 text-white">
            Real Systems Running Live.
          </h2>
          <p className="type-body text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
            Every build is deployed live, tested on real phones, and driving real customer results.
          </p>
        </div>

        {/* 2. Typographic Filter Navigation */}
        <div className="flex items-center gap-5 type-meta mt-2 sm:mt-0 font-mono">
          <button
            onClick={() => {
              setActiveTab('ALL');
              setActiveIdx(0);
            }}
            className={`touch-target py-2 transition-[color,border-color,transform] duration-150 border-b-2 cursor-pointer focus-visible:outline-emerald-400 active:scale-95 ${
              activeTab === 'ALL'
                ? 'border-emerald-400 text-white font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
            aria-label="Show all projects"
          >
            All Works ({PROJECTS.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('WEBSITE');
              setActiveIdx(0);
            }}
            className={`touch-target py-2 transition-[color,border-color,transform] duration-150 border-b-2 cursor-pointer focus-visible:outline-emerald-400 active:scale-95 ${
              activeTab === 'WEBSITE'
                ? 'border-emerald-400 text-white font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
            aria-label="Show websites only"
          >
            Websites &amp; Portals
          </button>
          <button
            onClick={() => {
              setActiveTab('MOBILE WEBAPP');
              setActiveIdx(0);
            }}
            className={`touch-target py-2 transition-[color,border-color,transform] duration-150 border-b-2 cursor-pointer focus-visible:outline-emerald-400 active:scale-95 ${
              activeTab === 'MOBILE WEBAPP'
                ? 'border-emerald-400 text-white font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
            aria-label="Show mobile webapps only"
          >
            Mobile Webapps
          </button>
        </div>
      </div>

      {/* 3. Split Editorial Showcase Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Project Selector List */}
        <div className="stagger-portfolio md:col-span-5 font-mono">
          <div className="type-meta text-slate-300 font-semibold mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
            <span>INDEX ({filteredProjects.length})</span>
            <span className="text-cyan-400 text-xs">SELECT TO INSPECT</span>
          </div>

          <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
            {filteredProjects.map((p, idx) => {
              const isSelected = p.name === current.name;
              return (
                <div
                  key={p.index}
                  className={`w-full py-2.5 px-3 transition-[background-color,border-color,transform] duration-150 flex items-center justify-between cursor-pointer border-l-2 active:scale-[0.985] ${
                    isSelected
                      ? 'border-cyan-400 bg-white/[0.08] text-white shadow-sm'
                      : 'border-transparent hover:border-white/30 hover:bg-white/[0.03] text-slate-300'
                  }`}
                  onClick={() => setActiveIdx(idx)}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                    <span className={`text-xs font-bold shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`}>
                      {p.index}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-sans font-medium leading-snug truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {p.name}
                        </span>
                        {p.tag && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-mono uppercase tracking-wider shrink-0">
                            {p.tag}
                          </span>
                        )}
                      </div>
                      <div className="type-meta text-slate-400 mt-0.5">
                        {p.type} • {p.category}
                      </div>
                    </div>
                  </div>

                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="touch-target p-2 text-slate-400 hover:text-cyan-400 shrink-0 transition-colors"
                    title={`Open ${p.name} live in a new tab`}
                    aria-label={`Open ${p.name} live in a new tab`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>

          {/* Minimal Custom Build Prompt */}
          <div className="border-t border-white/10 pt-3 mt-3 text-xs font-sans text-slate-300">
            <span className="text-emerald-400 font-bold block type-meta mb-0.5 font-mono">
              Need A Similar Build?
            </span>
            <p className="text-slate-300 leading-normal font-sans">
              We engineer custom portals, booking systems, and websites tailored 100% to your workflow.
            </p>
          </div>
        </div>

        {/* Right Column: Selected Project Console with Image / Browser-Frame Thumbnail */}
        <div className="stagger-portfolio md:col-span-7 border-t md:border-t-0 md:border-l border-white/15 md:pl-6 text-left flex flex-col justify-between">
          <div>
            {/* Project Header */}
            <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2.5 mb-3">
              <div className="flex items-center gap-2 type-meta font-mono">
                <span className="text-cyan-400 font-bold">{current.type}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-slate-300">{current.category}</span>
                {current.tag && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono">
                    {current.tag}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 type-meta font-semibold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span>ONLINE &amp; ACTIVE</span>
              </div>
            </div>

            {/* Browser-Frame Thumbnail Slot (Local asset path or neutral browser-frame placeholder) */}
            <div className="mb-4 rounded-xl overflow-hidden border border-white/15 bg-black/60 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
              {/* Browser Mock Chrome Bar */}
              <div className="px-3 py-2 bg-white/[0.04] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
                </div>
                <div className="px-3 py-0.5 rounded-full bg-black/50 border border-white/10 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 max-w-[220px] truncate">
                  <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{current.liveUrl.replace('https://', '')}</span>
                </div>
                <div className="w-10" />
              </div>

              {/* Image Thumbnail or Neutral Placeholder */}
              {current.image ? (
                <div className="aspect-[16/9] w-full overflow-hidden bg-[#0a0f1d]">
                  <img
                    src={current.image}
                    alt={`${current.name} preview`}
                    className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#0c1322] via-[#090d17] to-[#060911] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                  {/* Subtle Blueprint Grid Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-cyan-400 mb-2 shadow-inner">
                    <Globe className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="text-white font-sans font-semibold text-base mb-1 tracking-tight">
                    {current.name}
                  </h4>
                  <p className="text-xs font-sans text-slate-400 max-w-sm line-clamp-2">
                    {current.summary}
                  </p>
                  <a
                    href={current.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-xs font-mono text-slate-200 hover:text-white transition-colors"
                  >
                    <span>View Live Deployment</span>
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                  </a>
                </div>
              )}
            </div>

            {/* Title & Summary */}
            <h3 className="type-h3 text-white mb-2">
              {current.name}
            </h3>
            <p className="type-body text-slate-200 mb-4 font-sans leading-relaxed">
              {current.summary}
            </p>

            {/* Client Business Outcome */}
            <div className="mb-4 glass-surface border-l-2 border-emerald-400 p-3.5">
              <span className="type-meta text-emerald-400 font-bold block mb-1 font-mono">
                Why A Business Needs This
              </span>
              <p className="text-sm text-slate-100 font-medium font-sans leading-relaxed">
                {current.businessValue}
              </p>
            </div>

            {/* Core Features in Simple Outcome Wording */}
            <div className="space-y-1.5 mb-5 font-sans text-xs sm:text-sm text-slate-200">
              {current.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-4 border-t border-white/15 pt-4">
            <a
              href={current.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              aria-label={`Launch ${current.name} live`}
            >
              <span>Launch Live Site ↗</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={getWaInquiryUrl(current)}
              onClick={(e) => handleWhatsAppInstantClick(e, `Hi! I saw the "${current.name}" live demo on your website and really liked it. I'm looking for something similar for my business—can we discuss details?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-emerald-400 hover:text-emerald-300"
              aria-label={`Inquire about ${current.name} on WhatsApp`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inquire About A Similar Build ↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4. Testimonial Component (Renders ONLY when testimonials exist in config) */}
      {AGENCY_CONFIG.testimonials && AGENCY_CONFIG.testimonials.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="type-meta text-cyan-400 font-bold mb-3 font-mono">
            WHAT CLIENTS SAY
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AGENCY_CONFIG.testimonials.map((t) => (
              <div key={t.id} className="p-4 rounded-xl glass-surface border border-white/10">
                <p className="text-xs sm:text-sm font-sans text-slate-200 italic mb-3">
                  "{t.text}"
                </p>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold">{t.clientName}</span>
                  <span className="text-slate-400">{t.businessName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
