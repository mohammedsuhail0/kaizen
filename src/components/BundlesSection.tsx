import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger, cubicBezier } from 'animejs';
import { Check, ArrowUpRight, Zap, Store, Rocket } from 'lucide-react';
import { BUNDLES, getWhatsAppUrl, handleWhatsAppInstantClick, formatINR } from '../data/agencyData';
import type { BundleItem } from '../data/agencyData';

interface BundlesSectionProps {
  onOpenQuotation: () => void;
}

export const BundlesSection: React.FC<BundlesSectionProps> = ({ onOpenQuotation }) => {
  const [activeBundleId, setActiveBundleId] = useState('bundle-shop');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = sectionRef.current?.querySelectorAll('.stagger-bundle');
    if (!items || items.length === 0) return;

    animate(items, {
      translateY: [18, 0],
      opacity: [0, 1],
      delay: stagger(65, { start: 80 }),
      ease: cubicBezier(0.16, 1, 0.3, 1),
      duration: 650,
    });
  }, []);

  const getWaLink = (b: BundleItem) => {
    const text = `Hi! I'm interested in the "${b.name}" (${b.price}) package I saw on your website. Could you let me know what you'd need from my side to get started?`;
    return getWhatsAppUrl(text);
  };

  const getBundleIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'store':
        return <Store className="w-4 h-4 text-cyan-400" />;
      case 'rocket':
      default:
        return <Rocket className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div
      id="bundles"
      ref={sectionRef}
      className="relative w-full text-left select-none flex flex-col justify-center max-w-6xl py-3 mx-auto scroll-mt-24"
    >
      {/* 1. Ambient Backlight */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-display font-extrabold text-[120px] sm:text-[150px] lg:text-[180px] tracking-tight leading-none text-white/[0.025] select-none uppercase">
          Pricing
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(0,119,255,0.16),rgba(0,245,255,0.06)_40%,transparent_70%)] blur-2xl" />
        <div className="absolute top-8 right-12 w-32 h-32 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* 2. Section Header Strip */}
      <div className="stagger-bundle flex flex-wrap items-end justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <h2 className="type-h2 text-white">
            Predictable Investment. Zero Hidden Costs.
          </h2>
          <p className="type-body text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
            Pay 30% to start, 70% when you're happy. Fixed packages built for you, delivered in days, and you own everything.
          </p>
        </div>

        {/* Action Link to Custom Estimator */}
        <button
          onClick={onOpenQuotation}
          className="btn-ghost text-slate-300 hover:text-white mt-2 sm:mt-0"
          aria-label="Open custom quote builder"
        >
          <span>Need custom services? Open Builder</span>
          <ArrowUpRight className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* 3. The 3 Distinct Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch relative">
        {BUNDLES.map((b) => {
          const isFeatured = b.popular;
          const isSelected = b.id === activeBundleId;
          const deliveryBalance = b.numericPrice - b.numericAdvance;

          return (
            <div
              key={b.id}
              onClick={() => setActiveBundleId(b.id)}
              className={`stagger-bundle rounded-3xl p-6 lg:p-7 flex flex-col justify-between transition-[transform,border-color,box-shadow,background-color] duration-300 cursor-pointer relative ${
                isFeatured ? 'md:order-2 md:-translate-y-1' : b.id === 'bundle-starter' ? 'md:order-1' : 'md:order-3'
              } ${
                isFeatured
                  ? 'bg-gradient-to-b from-[#0c1833]/90 via-[#0a1226]/90 to-[#070b16]/95 border-2 border-cyan-400/60 shadow-[0_20px_50px_-10px_rgba(0,140,255,0.3)] ring-1 ring-cyan-400/30'
                  : isSelected
                  ? 'bg-gradient-to-b from-white/[0.09] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/30 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/20'
                  : 'bg-gradient-to-b from-white/[0.06] via-white/[0.03] to-white/[0.015] backdrop-blur-2xl border border-white/10 hover:border-white/25 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.7)] hover:bg-white/[0.05]'
              }`}
            >
              {/* Featured Ribbon Badge */}
              {isFeatured && (
                <div className="absolute -top-3.5 right-6 pointer-events-none">
                  <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-mono text-[10px] font-bold tracking-widest uppercase shadow-[0_0_18px_rgba(0,245,255,0.6)] flex items-center gap-1">
                    <span>★</span>
                    <span>MOST POPULAR</span>
                  </span>
                </div>
              )}

              {/* Card Header & Pricing */}
              <div className="pt-2">
                {/* Plan Category & Icon */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center shrink-0">
                      {getBundleIcon(b.iconName)}
                    </div>
                    <span className="text-xs font-mono font-medium tracking-wider uppercase text-slate-300">
                      {b.name.replace(' Bundle', '')}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-200">
                    ⏱ {b.timeline}
                  </span>
                </div>

                {/* Big Price Display with Optional Regular Price Strikethrough */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
                      {b.price}
                    </span>
                    {b.regularPrice && (
                      <span className="line-through text-slate-500 font-mono text-sm">
                        {formatINR(b.regularPrice)}
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400">
                      / package
                    </span>
                  </div>

                  {/* Two Clean Lines for Payment Breakdown */}
                  <div className="mt-2.5 space-y-1 text-xs font-sans border-l-2 border-emerald-400/60 pl-2.5 py-0.5">
                    <div className="text-emerald-400 font-medium">
                      Pay {formatINR(b.numericAdvance)} to start
                    </div>
                    <div className="text-slate-300">
                      {formatINR(deliveryBalance)} on delivery
                    </div>
                  </div>
                </div>

                {/* Tagline / Value Proposition */}
                <p className="text-xs font-sans text-slate-200 leading-relaxed mb-5 min-h-[36px]">
                  {b.tagline}
                </p>

                {/* Divider */}
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent mb-5" />

                {/* Best For Strip with WCAG AA Contrast */}
                <div className="text-xs mb-4">
                  <span className="text-slate-300 font-mono text-[11px] uppercase tracking-wider block mb-0.5 font-semibold">
                    Ideal For:
                  </span>
                  <span className="text-white font-sans font-medium">
                    {b.bestFor}
                  </span>
                </div>

                {/* Deliverables Checklist with WCAG AA Contrast */}
                <div className="space-y-2.5 mb-6">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-200 font-semibold block mb-2">
                    Included Features:
                  </span>
                  {b.included.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs font-sans text-slate-200">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isFeatured
                            ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                            : 'bg-white/[0.08] text-emerald-400 border border-white/20'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2 mt-auto">
                <a
                  href={getWaLink(b)}
                  onClick={(e) => handleWhatsAppInstantClick(e, `Hi! I'm interested in the "${b.name}" (${b.price}) package I saw on your website. Could you let me know what you'd need from my side to get started?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-5 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-[transform,background-color,box-shadow,filter] duration-150 active:scale-[0.97] cursor-pointer ${
                    isFeatured
                      ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.45)] hover:shadow-[0_0_25px_rgba(16,185,129,0.65)] hover:brightness-110'
                      : 'bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/20 hover:border-emerald-400/50'
                  }`}
                  aria-label={`Get started with ${b.name}`}
                >
                  <span>Select {b.name.replace(' Bundle', '')} ↗</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
