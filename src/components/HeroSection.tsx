import React, { useEffect, useRef } from 'react';
import { animate, stagger, cubicBezier } from 'animejs';
import { ArrowRight, MessageSquare, Check } from 'lucide-react';
import { getWhatsAppUrl, handleWhatsAppInstantClick } from '../data/agencyData';

interface HeroSectionProps {
  onExploreServices: () => void;
  onOpenQuotation: () => void;
  onExploreDemos: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreServices,
  onOpenQuotation,
  onExploreDemos,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = heroRef.current?.querySelectorAll('.stagger-reveal');
    if (!elements || elements.length === 0) return;

    animate(elements, {
      translateY: [16, 0],
      opacity: [0, 1],
      delay: stagger(65, { start: 80 }),
      ease: cubicBezier(0.16, 1, 0.3, 1),
      duration: 650,
    });
  }, []);

  return (
    <div
      ref={heroRef}
      className="w-full text-left select-none flex flex-col justify-center max-w-4xl py-3"
    >
      {/* 1. High-Impact Mathematical Master Headline (Clamp 2.5rem-4.25rem, line-height 1.1) */}
      <h1 className="stagger-reveal type-hero text-white mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] max-w-3xl">
        Turn your idea into software that drives real business.
      </h1>

      {/* 3. Direct Commercial Narrative (Scannable in < 3 seconds, line-height 1.65) */}
      <p className="stagger-reveal type-body text-slate-200 mb-6 max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
        Custom-built for growing businesses, clinics, cafes, salons, and ambitious creators. From high-converting business websites, QR digital menus, and online booking engines, to client management portals — engineered 100% around your workflow.
      </p>

      {/* 4. Commercial Trust Metrics (Single Elevated Glass Layer, Zero Card-in-Card Nesting) */}
      <div className="stagger-reveal glass-surface py-3 px-4 mb-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-xs sm:text-sm font-mono text-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">₹4,999</span>
          <span className="text-slate-300">Starter packages</span>
        </div>
        <div className="hidden sm:block text-zinc-600">/</div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">30% advance</span>
          <span className="text-slate-300">70% on delivery approval</span>
        </div>
        <div className="hidden sm:block text-zinc-600">/</div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">100% ownership</span>
          <span className="text-slate-300">Full code &amp; assets</span>
        </div>
        <div className="hidden sm:block text-zinc-600">/</div>
        <div className="flex items-center gap-2">
          <span className="text-cyan-300 font-bold">15 days</span>
          <span className="text-slate-300">Free hypercare</span>
        </div>
      </div>

      {/* 5. Architectural Action Triggers (5 Interactive States, Min 48px Touch Targets) */}
      <div className="stagger-reveal flex flex-wrap items-center gap-4 text-xs sm:text-sm">
        {/* Primary Emerald Action CTA */}
        <button
          onClick={onOpenQuotation}
          className="btn-primary"
          aria-label="Get instant quotation"
        >
          <span>Get Instant Quotation</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Secondary Architectural Buttons */}
        <button
          onClick={onExploreServices}
          className="btn-secondary"
          aria-label="Explore agency services"
        >
          <span>Explore Services →</span>
        </button>

        <button
          onClick={onExploreDemos}
          className="btn-secondary"
          aria-label="Explore live client demos"
        >
          <span>Live Client Demos →</span>
        </button>

        {/* Direct WhatsApp Chat Action */}
        <a
          href={getWhatsAppUrl("Hi! I came across your website and I'm interested in getting a website / system built for my business. Can we discuss?")}
          onClick={(e) => handleWhatsAppInstantClick(e, "Hi! I came across your website and I'm interested in getting a website / system built for my business. Can we discuss?")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-emerald-400 hover:text-emerald-300 ml-auto sm:ml-0"
          title="Chat directly on WhatsApp"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">WhatsApp Chat ↗</span>
        </a>
      </div>

      {/* 6. Reassurance Strip (WCAG AA Compliant 13px Text, No Tracked Badges) */}
      <div className="stagger-reveal flex flex-wrap items-center gap-4 mt-6 type-meta text-slate-300">
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>2 rounds of revisions included</span>
        </span>
        <span className="text-zinc-600">•</span>
        <span>Custom-built for you</span>
        <span className="text-zinc-600">•</span>
        <span>Pick what you need, pay one flat price</span>
      </div>
    </div>
  );
};
