import React, { useEffect, useRef } from 'react';
import { animate, stagger, cubicBezier } from 'animejs';
import { ArrowRight, MessageSquare, Play } from 'lucide-react';
import { getWhatsAppUrl, handleWhatsAppInstantClick, AGENCY_CONFIG } from '../data/agencyData';

interface HeroSectionProps {
  onExploreServices: () => void;
  onOpenQuotation: () => void;
  onExploreDemos: () => void;
  onOpenPromoAd?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreServices,
  onOpenQuotation,
  onExploreDemos,
  onOpenPromoAd,
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
      id="hero"
      ref={heroRef}
      className="w-full text-left select-none flex flex-col justify-center max-w-4xl py-3 scroll-mt-24"
    >
      {/* 1. Master Headline */}
      <h1 className="stagger-reveal type-hero text-white mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] max-w-3xl">
        Websites, booking &amp; QR menus that bring more customers to your business.
      </h1>

      {/* 2. Direct Commercial Narrative */}
      <p className="stagger-reveal type-body text-slate-200 mb-6 max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-sans text-base sm:text-lg leading-relaxed">
        Fixed-price websites and simple systems for cafes, clinics, salons, gyms and shops. Built for you, delivered in days, and you own everything.
      </p>

      {/* 3. Commercial Trust Metrics */}
      <div className="stagger-reveal glass-surface py-3 px-4 mb-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-xs sm:text-sm font-sans text-slate-200 border border-white/15">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold font-mono">₹4,999</span>
          <span className="text-slate-200">Starter packages</span>
        </div>
        <div className="hidden sm:block text-zinc-600">/</div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-300 font-semibold">Pay 30% to start</span>
          <span className="text-slate-300">70% when you're happy</span>
        </div>
        <div className="hidden sm:block text-zinc-600">/</div>
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">You own everything.</span>
          <span className="text-slate-300">No monthly lock-in.</span>
        </div>
        <div className="hidden sm:block text-zinc-600">/</div>
        <div className="flex items-center gap-2">
          <span className="text-cyan-300 font-bold font-mono">15 days</span>
          <span className="text-slate-300">Free support</span>
        </div>
      </div>

      {/* 4. Action Triggers: One Clear Primary Hero CTA, others visually secondary */}
      <div className="stagger-reveal flex flex-wrap items-center gap-3.5 text-xs sm:text-sm">
        {/* Sole Primary Hero CTA */}
        <button
          onClick={onOpenQuotation}
          className="btn-primary"
          aria-label="Get Instant Quotation"
        >
          <span>Get Instant Quotation</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* 30s Promo Ad Button */}
        {onOpenPromoAd && (
          <button
            onClick={onOpenPromoAd}
            className="btn-secondary text-cyan-400 hover:text-cyan-300 border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(0,245,255,0.15)] flex items-center gap-2"
            aria-label="Watch 30s Showcase Promo Ad"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-400" />
            <span>Watch 30s Promo Ad</span>
          </button>
        )}

        {/* Visually Secondary Action Buttons */}
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

        {/* WhatsApp Consultation Link */}
        <a
          href={getWhatsAppUrl("Hi! I came across your website and I'd like to discuss a project for my business. Can we connect?")}
          onClick={(e) => handleWhatsAppInstantClick(e, "Hi! I came across your website and I'd like to discuss a project for my business. Can we connect?")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-emerald-400 hover:text-emerald-300 border-emerald-400/30"
          aria-label={`Chat with ${AGENCY_CONFIG.founder.name} on WhatsApp`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>WhatsApp Chat ↗</span>
        </a>
      </div>

      {/* 5. Minimal Guarantee Underline */}
      <div className="stagger-reveal mt-5 flex items-center gap-3 text-xs font-sans text-slate-300">
        <span className="text-emerald-400 font-bold">✓</span>
        <span>2 rounds of revisions included</span>
        <span className="text-zinc-600">·</span>
        <span>Custom-built for your business</span>
        <span className="text-zinc-600">·</span>
        <span>Direct WhatsApp engineer support</span>
      </div>
    </div>
  );
};
