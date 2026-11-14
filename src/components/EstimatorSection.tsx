import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger, cubicBezier } from 'animejs';
import { MessageSquare, Check, X, RotateCcw } from 'lucide-react';
import {
  BUNDLES,
  ALL_SERVICES,
  getWhatsAppUrl,
  handleWhatsAppInstantClick,
  formatINR,
  calculateAdvance,
  calculateBalance,
  calculateCombinedTimeline,
} from '../data/agencyData';
import type { BundleItem, ServiceItem } from '../data/agencyData';

interface QuotableItem {
  id: string;
  name: string;
  price: number;
  regularPrice?: number;
  category: 'bundle' | 'website' | 'booking' | 'billing-crm' | 'whatsapp-automation' | 'monthly-plans';
  categoryLabel: string;
  description: string;
  turnaround: string;
  timeline?: string;
  popular?: boolean;
}

// Build unified quotable items list from canonical agencyData
const quoteOptions: QuotableItem[] = [
  ...BUNDLES.map((b: BundleItem): QuotableItem => ({
    id: b.id,
    name: b.name,
    price: b.numericPrice,
    regularPrice: b.regularPrice,
    category: 'bundle',
    categoryLabel: 'Turnkey Bundles',
    description: b.tagline,
    turnaround: b.timeline,
    timeline: b.timeline,
    popular: b.popular,
  })),
  ...ALL_SERVICES.map((s: ServiceItem): QuotableItem => {
    let cat: QuotableItem['category'] = 'website';
    if (s.category === 'booking') cat = 'booking';
    else if (s.category === 'billing-crm') cat = 'billing-crm';
    else if (s.category === 'whatsapp-automation') cat = 'whatsapp-automation';
    else if (s.category === 'monthly-plans') cat = 'monthly-plans';

    return {
      id: s.id,
      name: s.name,
      price: s.numericPrice,
      regularPrice: s.regularPrice,
      category: cat,
      categoryLabel: s.categoryLabel,
      description: s.description,
      turnaround: s.turnaround,
      popular: s.popular,
    };
  }),
];

type FilterCategory = 'bundle' | 'website' | 'booking' | 'billing-crm' | 'whatsapp-automation' | 'monthly-plans' | 'all';

export const EstimatorSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('bundle');
  const [selectedIds, setSelectedIds] = useState<string[]>(['bundle-shop']);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = sectionRef.current?.querySelectorAll('.stagger-quote');
    if (!items || items.length === 0) return;

    animate(items, {
      translateY: [16, 0],
      opacity: [0, 1],
      delay: stagger(50, { start: 60 }),
      ease: cubicBezier(0.16, 1, 0.3, 1),
      duration: 600,
    });
  }, [activeFilter]);

  const filterTabs: { id: FilterCategory; label: string; count: number }[] = [
    { id: 'bundle', label: 'Bundles', count: quoteOptions.filter((o) => o.category === 'bundle').length },
    { id: 'website', label: 'Websites', count: quoteOptions.filter((o) => o.category === 'website').length },
    { id: 'booking', label: 'Booking', count: quoteOptions.filter((o) => o.category === 'booking').length },
    { id: 'billing-crm', label: 'CRM & Billing', count: quoteOptions.filter((o) => o.category === 'billing-crm').length },
    { id: 'whatsapp-automation', label: 'WhatsApp', count: quoteOptions.filter((o) => o.category === 'whatsapp-automation').length },
    { id: 'monthly-plans', label: 'Monthly Care', count: quoteOptions.filter((o) => o.category === 'monthly-plans').length },
    { id: 'all', label: 'All Services', count: quoteOptions.length },
  ];

  const handleSelectPreset = (preset: 'cafe' | 'clinic' | 'gym' | 'starter' | 'clear') => {
    if (preset === 'cafe') {
      setSelectedIds(['bundle-shop']);
      setActiveFilter('bundle');
    } else if (preset === 'clinic') {
      setSelectedIds(['clinic-scheduling', 'whatsapp-bot', 'google-review-qr']);
      setActiveFilter('booking');
    } else if (preset === 'gym') {
      setSelectedIds(['membership-system', 'website-1page', 'whatsapp-bot']);
      setActiveFilter('booking');
    } else if (preset === 'starter') {
      setSelectedIds(['bundle-starter']);
      setActiveFilter('bundle');
    } else if (preset === 'clear') {
      setSelectedIds([]);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      if (id.startsWith('bundle-')) {
        const withoutBundles = prev.filter((item) => !item.startsWith('bundle-'));
        return prev.includes(id) ? withoutBundles : [...withoutBundles, id];
      }
      return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const filteredItems = activeFilter === 'all'
    ? quoteOptions
    : quoteOptions.filter((item) => item.category === activeFilter);

  const selectedItems = quoteOptions.filter((item) => selectedIds.includes(item.id));
  const oneTimeItems = selectedItems.filter((item) => item.category !== 'monthly-plans');
  const monthlyItems = selectedItems.filter((item) => item.category === 'monthly-plans');

  const oneTimeTotal = oneTimeItems.reduce((acc, curr) => acc + curr.price, 0);
  const monthlyTotal = monthlyItems.reduce((acc, curr) => acc + curr.price, 0);

  // Exact advance calculation formula: Math.round(price * 0.3 / 10) * 10
  const advancePayment = calculateAdvance(oneTimeTotal);
  const deliveryBalance = calculateBalance(oneTimeTotal);

  // Single data source combined timeline
  const timelineText = calculateCombinedTimeline(oneTimeItems);

  const itemsSummary = selectedItems
    .map((i) => `• ${i.name} (${formatINR(i.price)}${i.category === 'monthly-plans' ? '/mo' : ''})`)
    .join('\n');

  const clientInquiryMessage = [
    `Hi! I was checking out the pricing on your website.`,
    ``,
    `I'm interested in getting this built for my business:`,
    itemsSummary,
    ``,
    `Estimated Total: ${formatINR(oneTimeTotal)}${monthlyTotal > 0 ? ` + ${formatINR(monthlyTotal)}/mo support` : ''}`,
    `Pay 30% to start: ${formatINR(advancePayment)}`,
    `70% when you're happy: ${formatINR(deliveryBalance)}`,
    `Estimated Timeline: ~${timelineText}`,
    ``,
    `Could you let me know how we can get started and what you'd need from my end? Thanks!`,
  ].join('\n');

  const waQuoteUrl = getWhatsAppUrl(clientInquiryMessage);

  return (
    <div
      id="quotation"
      ref={sectionRef}
      className="w-full text-left select-none flex flex-col justify-center max-w-5xl py-2 scroll-mt-24"
    >
      {/* 1. Top Section Header */}
      <div className="stagger-quote flex flex-wrap items-end justify-between border-b border-white/15 pb-3 mb-4">
        <div>
          <h2 className="type-h2 text-white">
            Custom Build Scope &amp; Investment.
          </h2>
          <p className="type-body text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
            Select what your business needs. Pay 30% to start, 70% when you're happy.
          </p>
        </div>

        {/* Commercial Terms Badge */}
        <div className="type-meta text-slate-300 flex items-center gap-2 mt-2 sm:mt-0 font-sans">
          <span className="text-slate-300 font-medium">How payment works:</span>
          <span className="text-emerald-400 font-bold border-b border-emerald-400/40 pb-0.5">
            Pay 30% to start, 70% when you're happy
          </span>
        </div>
      </div>

      {/* 2. Architectural Presets Strip */}
      <div className="stagger-quote flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4 type-meta">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-300 font-semibold text-xs font-mono">
            Industry Presets:
          </span>
          <button
            onClick={() => handleSelectPreset('cafe')}
            className="touch-target py-1 text-slate-200 hover:text-white border-b border-white/20 hover:border-cyan-400 transition-colors cursor-pointer focus-visible:outline-emerald-400 active:scale-95"
            aria-label="Preset for Cafe or Retail"
          >
            Cafe / Retail
          </button>
          <span className="text-zinc-600">/</span>
          <button
            onClick={() => handleSelectPreset('clinic')}
            className="touch-target py-1 text-slate-200 hover:text-white border-b border-white/20 hover:border-cyan-400 transition-colors cursor-pointer focus-visible:outline-emerald-400 active:scale-95"
            aria-label="Preset for Clinic or Salon"
          >
            Clinic / Salon
          </button>
          <span className="text-zinc-600">/</span>
          <button
            onClick={() => handleSelectPreset('gym')}
            className="touch-target py-1 text-slate-200 hover:text-white border-b border-white/20 hover:border-cyan-400 transition-colors cursor-pointer focus-visible:outline-emerald-400 active:scale-95"
            aria-label="Preset for Gym or Academy"
          >
            Gym / Academy
          </button>
          <span className="text-zinc-600">/</span>
          <button
            onClick={() => handleSelectPreset('starter')}
            className="touch-target py-1 text-slate-200 hover:text-white border-b border-white/20 hover:border-cyan-400 transition-colors cursor-pointer focus-visible:outline-emerald-400 active:scale-95"
            aria-label="Preset for Starter Package"
          >
            Starter Package
          </button>
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={() => handleSelectPreset('clear')}
            className="touch-target py-1 type-meta text-slate-300 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer ml-auto sm:ml-0 focus-visible:outline-rose-400 active:scale-95 font-mono"
            aria-label="Reset all selections"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Selections</span>
          </button>
        )}
      </div>

      {/* 3. Main Split Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Category Tabs & Selectable Items */}
        <div className="stagger-quote md:col-span-7 flex flex-col justify-between">
          {/* Typographic Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-white/10 pb-2 mb-3 type-meta font-mono">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`touch-target py-1.5 transition-[color,border-color,transform] duration-150 border-b-2 cursor-pointer focus-visible:outline-emerald-400 active:scale-95 ${
                    isActive
                      ? 'border-emerald-400 text-white font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                  aria-label={`Filter by ${tab.label}`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-xs ml-1 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                    ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selectable Services Ledger */}
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full py-2.5 px-3 transition-[background-color,border-color,transform] duration-150 flex items-center justify-between cursor-pointer border-l-2 active:scale-[0.985] ${
                    isSelected
                      ? 'border-cyan-400 bg-white/[0.08] text-white shadow-sm'
                      : 'border-transparent hover:border-white/30 hover:bg-white/[0.03] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                    <div
                      className={`w-4 h-4 flex items-center justify-center border shrink-0 text-[10px] transition-[background-color,border-color] duration-150 ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-400 text-slate-950 font-bold'
                          : 'border-slate-500 bg-white/5'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-sans font-medium leading-snug ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {item.name}
                        </span>
                        {item.popular && (
                          <span className="type-meta text-cyan-300 font-bold shrink-0 font-mono text-[10px]">
                            ★ POPULAR
                          </span>
                        )}
                      </div>
                      <div className="type-meta text-slate-300 leading-tight mt-0.5 font-sans">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-sm font-mono font-bold ${isSelected ? 'text-emerald-300' : 'text-emerald-400'}`}>
                      {formatINR(item.price)}{item.category === 'monthly-plans' ? '/mo' : ''}
                    </div>
                    <div className="type-meta text-slate-300 font-mono text-xs">
                      ⏱ {item.turnaround}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Your Quote (Replaced Project Ledger) */}
        <div className="stagger-quote md:col-span-5 border-t md:border-t-0 md:border-l border-white/15 md:pl-6 text-left flex flex-col justify-between glass-surface p-4">
          <div>
            {/* Ledger Header */}
            <div className="type-meta text-cyan-400 font-bold mb-2 flex items-center justify-between border-b border-white/15 pb-2 font-mono">
              <span>YOUR QUOTE</span>
              <span className="text-slate-200 text-xs">
                {selectedItems.length} {selectedItems.length === 1 ? 'SERVICE' : 'SERVICES'}
              </span>
            </div>

            {/* Selected Items */}
            <div className="space-y-1.5 font-sans text-xs max-h-24 overflow-y-auto pr-1 border-b border-white/10 pb-2 mb-3 no-scrollbar">
              {selectedItems.length === 0 ? (
                <div className="text-slate-300 py-3 text-center type-meta font-sans">
                  Select services on the left to calculate exact investment.
                </div>
              ) : (
                selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2">
                    <span className="text-slate-200 flex items-center gap-1.5 flex-1 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(item.id);
                        }}
                        className="touch-target w-6 h-6 p-0.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0 focus-visible:outline-rose-400 active:scale-95"
                        title="Remove service"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="leading-tight truncate">{item.name}</span>
                    </span>
                    <span className="text-white shrink-0 font-bold font-mono">
                      {formatINR(item.price)}{item.category === 'monthly-plans' ? '/mo' : ''}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Investment Schedule */}
            <div className="space-y-1.5 font-sans text-xs border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Estimated Delivery:</span>
                <span className="text-emerald-400 font-bold font-mono">{timelineText}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Pay 30% to start:</span>
                <span className="text-emerald-300 font-bold font-mono">{formatINR(advancePayment)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">70% when you're happy:</span>
                <span className="text-slate-200 font-medium font-mono">{formatINR(deliveryBalance)}</span>
              </div>

              {monthlyTotal > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <span className="text-cyan-400">Monthly Support:</span>
                  <span className="text-cyan-300 font-bold font-mono">{formatINR(monthlyTotal)} / mo</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-white text-xs font-bold uppercase tracking-wider font-sans">Total Investment:</span>
                <span className="text-2xl font-bold font-mono text-white">
                  {formatINR(oneTimeTotal)}
                </span>
              </div>
            </div>

            {/* What's Included Brief (Replaced Official Commercial Terms) */}
            <div className="border-l-2 border-emerald-400 pl-3 py-1 mb-4 type-meta text-slate-200">
              <span className="text-emerald-400 font-bold block mb-0.5 font-mono">
                What's included:
              </span>
              <p className="text-slate-200 leading-relaxed font-sans text-xs">
                Includes 2 rounds of changes, free support after delivery, and you own everything with no monthly lock-in.
              </p>
            </div>
          </div>

          {/* Action Trigger */}
          <div>
            <a
              href={waQuoteUrl}
              onClick={(e) => handleWhatsAppInstantClick(e, clientInquiryMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full"
              aria-label="Confirm quotation and send via WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Confirm &amp; Send on WhatsApp ↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
