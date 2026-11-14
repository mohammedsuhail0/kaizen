import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger, cubicBezier } from 'animejs';
import { Check, MessageSquare, ArrowUpRight, Globe, Calendar, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';
import { SERVICE_CATEGORIES, getWhatsAppUrl, handleWhatsAppInstantClick, formatINR } from '../data/agencyData';
import type { ServiceItem, ServiceCategory } from '../data/agencyData';

interface ServicesSectionProps {
  onOpenQuotation: () => void;
  onSelectServiceForQuote?: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenQuotation,
  onSelectServiceForQuote,
}) => {
  const [activeCatIdx, setActiveCatIdx] = useState(0);
  const [activeServiceIdx, setActiveServiceIdx] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const currentCat: ServiceCategory = SERVICE_CATEGORIES[activeCatIdx] || SERVICE_CATEGORIES[0];
  const currentService: ServiceItem = currentCat.items[activeServiceIdx] || currentCat.items[0];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = sectionRef.current?.querySelectorAll('.stagger-service');
    if (!items || items.length === 0) return;

    animate(items, {
      translateY: [16, 0],
      opacity: [0, 1],
      delay: stagger(50, { start: 60 }),
      ease: cubicBezier(0.16, 1, 0.3, 1),
      duration: 600,
    });
  }, [activeCatIdx]);

  const handleCategoryChange = (idx: number) => {
    setActiveCatIdx(idx);
    setActiveServiceIdx(0);
  };

  const getWaUrl = (item: ServiceItem) => {
    const text = `Hi! I saw the "${item.name}" (${item.price}) service on your website. I'd like to get this for my business—could you share details on timeline and onboarding?`;
    return getWhatsAppUrl(text);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'globe':
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-cyan-400" />;
      case 'barChart':
        return <BarChart3 className="w-4 h-4 text-amber-400" />;
      case 'messageSquare':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'trendingUp':
      default:
        return <TrendingUp className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div
      id="services"
      ref={sectionRef}
      className="w-full text-left select-none flex flex-col justify-center max-w-5xl py-2 scroll-mt-24"
    >
      {/* 1. Section Header */}
      <div className="stagger-service flex flex-wrap items-end justify-between border-b border-white/15 pb-3 mb-4">
        <div>
          <h2 className="type-h2 text-white">
            What we build for you.
          </h2>
          <p className="type-body text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
            Choose individual services or combine them in our Quote Builder. Delivered in days, and you own everything.
          </p>
        </div>

        {/* Action Link with 5 States */}
        <button
          onClick={onOpenQuotation}
          className="btn-ghost text-emerald-400 hover:text-emerald-300 mt-2 sm:mt-0"
          aria-label="Open custom quote builder"
        >
          <span>Build Full Quotation</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Typographic Category Tabs */}
      <div className="stagger-service flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/10 pb-2 mb-4 type-meta">
        {SERVICE_CATEGORIES.map((cat, idx) => {
          const isSelected = idx === activeCatIdx;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(idx)}
              className={`touch-target py-2 transition-[color,border-color,transform] duration-150 flex items-center gap-2 border-b-2 cursor-pointer focus-visible:outline-emerald-400 active:scale-95 ${
                isSelected
                  ? 'border-emerald-400 text-white font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
              aria-label={`Show ${cat.title}`}
            >
              <span>{getCategoryIcon(cat.iconName)}</span>
              <span>{cat.shortTitle}</span>
              <span className={`text-xs ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                ({cat.items.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Split Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Services Selection Ledger */}
        <div className="stagger-service md:col-span-5 font-mono">
          <div className="type-meta text-slate-300 font-semibold mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
            <span>AVAILABLE SERVICES ({currentCat.items.length})</span>
            <span className="text-cyan-400 text-xs">SELECT TO INSPECT</span>
          </div>

          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
            {currentCat.items.map((item, idx) => {
              const isSelected = idx === activeServiceIdx;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveServiceIdx(idx)}
                  className={`w-full py-2.5 px-3 transition-[background-color,border-color,transform] duration-150 flex items-center justify-between cursor-pointer border-l-2 active:scale-[0.985] ${
                    isSelected
                      ? 'border-cyan-400 bg-white/[0.08] text-white shadow-sm'
                      : 'border-transparent hover:border-white/30 hover:bg-white/[0.03] text-slate-300'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className={`text-sm font-sans font-medium leading-snug ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {item.name}
                    </div>
                    <div className="type-meta text-slate-300 mt-0.5">
                      ⏱ {item.turnaround}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-sm font-mono font-bold ${isSelected ? 'text-emerald-300' : 'text-emerald-400'}`}>
                      {item.price}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Service Details */}
        <div className="stagger-service md:col-span-7 border-t md:border-t-0 md:border-l border-white/15 md:pl-6 text-left flex flex-col justify-between">
          <div>
            {/* Header: Scope, Introductory Badge, & Price */}
            <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="type-meta text-cyan-400 font-semibold">
                    {currentCat.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-300 font-mono text-[9px] font-bold tracking-wider uppercase">
                    Introductory pricing
                  </span>
                </div>
                <h3 className="type-h3 text-white">
                  {currentService.name}
                </h3>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-baseline gap-1.5 justify-end">
                  {currentService.regularPrice && (
                    <span className="line-through text-slate-500 font-mono text-xs">
                      {formatINR(currentService.regularPrice)}
                    </span>
                  )}
                  <span className="text-2xl font-mono font-bold text-emerald-400">
                    {currentService.price}
                  </span>
                </div>
                <div className="type-meta text-slate-300 mt-0.5 font-mono">
                  ⏱ {currentService.turnaround} turnaround
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="type-body text-slate-200 mb-4 font-sans leading-relaxed">
              {currentService.description}
            </p>

            {/* Deliverables Checklist (WCAG AA Contrast) */}
            <div className="mb-4">
              <span className="type-meta text-slate-200 font-semibold block mb-2 font-mono">
                Included Deliverables:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-200 font-sans">
                {currentService.deliverables.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="leading-snug">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-4 border-t border-white/15 pt-4">
            <a
              href={getWaUrl(currentService)}
              onClick={(e) => handleWhatsAppInstantClick(e, `Hi! I saw the "${currentService.name}" (${currentService.price}) service on your website. I'd like to get this for my business—could you share details on timeline and onboarding?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              aria-label={`Order ${currentService.name} via WhatsApp`}
            >
              <MessageSquare className="w-4 h-4 text-slate-950" />
              <span>Order via WhatsApp ↗</span>
            </a>

            <button
              onClick={() => {
                if (onSelectServiceForQuote) {
                  onSelectServiceForQuote(currentService.id);
                } else {
                  onOpenQuotation();
                }
              }}
              className="btn-secondary"
              aria-label={`Add ${currentService.name} to quote builder`}
            >
              <span>Add to Quote Builder</span>
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Commercial Trust Strip */}
      <div className="stagger-service border-t border-white/15 pt-3 mt-4 flex flex-wrap items-center justify-between gap-3 type-meta text-slate-300">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>TERMS:</span>
          </span>
          <span>Pay 30% to start, 70% when you're happy</span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <span className="hidden sm:inline">2 rounds of changes</span>
          <span className="text-zinc-600 hidden md:inline">/</span>
          <span className="hidden md:inline">Free support included</span>
          <span className="text-zinc-600 hidden lg:inline">/</span>
          <span className="hidden lg:inline">You own everything. No monthly lock-in.</span>
        </div>

        <button
          onClick={onOpenQuotation}
          className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
          aria-label="Calculate total project cost"
        >
          Calculate Total Cost →
        </button>
      </div>
    </div>
  );
};
