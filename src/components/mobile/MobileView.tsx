import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger, cubicBezier } from 'animejs';
import {
  Sparkles,
  Layers,
  Package,
  Smartphone,
  Calculator,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Code2,
  Check,
} from 'lucide-react';
import { KaizenLogo } from '../KaizenLogo';
import { BUNDLES, ALL_SERVICES, PROJECTS, getWhatsAppUrl, handleWhatsAppInstantClick } from '../../data/agencyData';
import type { BundleItem, ServiceItem, ProjectItem } from '../../data/agencyData';

interface MobileViewProps {
  initialSection?: string;
  onNavigate?: (section: string) => void;
  onOpenChat?: () => void;
  zenMode?: boolean;
  onToggleZenMode?: () => void;
}

const TABS: ('home' | 'services' | 'bundles' | 'demos' | 'quote')[] = [
  'home',
  'services',
  'bundles',
  'demos',
  'quote',
];

export const MobileView: React.FC<MobileViewProps> = ({ initialSection = 'hero', onNavigate, onOpenChat }) => {
  const mapSectionToTab = (sec: string): 'home' | 'services' | 'bundles' | 'demos' | 'quote' => {
    if (sec === 'quotation' || sec === 'quote') return 'quote';
    if (sec === 'demos' || sec === 'projects') return 'demos';
    if (sec === 'bundles') return 'bundles';
    if (sec === 'services') return 'services';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'bundles' | 'demos' | 'quote'>(() =>
    mapSectionToTab(initialSection)
  );

  const [selectedServiceCat, setSelectedServiceCat] = useState('all');
  const [selectedProjectsType, setSelectedProjectsType] = useState<'ALL' | 'WEBSITE' | 'MOBILE WEBAPP'>('ALL');
  const [selectedServices, setSelectedServices] = useState<string[]>(['bundle-shop']);
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Touch Swipe Gesture Tracking for Horizontal Menu Switching
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Must be a deliberate horizontal swipe: threshold > 45px and 1.3x greater than vertical movement
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const currentIndex = TABS.indexOf(activeTab);

      if (deltaX < 0 && currentIndex < TABS.length - 1) {
        // Swiped Left -> Advance to Next Tab
        switchTab(TABS[currentIndex + 1]);
      } else if (deltaX > 0 && currentIndex > 0) {
        // Swiped Right -> Retreat to Previous Tab
        switchTab(TABS[currentIndex - 1]);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Sync external initialSection without synchronous cascading setState warning
  const lastSectionRef = useRef(initialSection);
  useEffect(() => {
    if (lastSectionRef.current !== initialSection) {
      lastSectionRef.current = initialSection;
      const targetTab = mapSectionToTab(initialSection);
      setActiveTab((curr) => (curr !== targetTab ? targetTab : curr));
    }
  }, [initialSection]);

  // Anime.js Staggered Entrance on Tab Change
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = tabContentRef.current?.querySelectorAll('.stagger-mobile');
    if (!elements || elements.length === 0) return;

    animate(elements, {
      translateY: [14, 0],
      opacity: [0, 1],
      delay: stagger(45, { start: 40 }),
      ease: cubicBezier(0.16, 1, 0.3, 1),
      duration: 500,
    });
  }, [activeTab]);

  const switchTab = (tab: 'home' | 'services' | 'bundles' | 'demos' | 'quote') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (onNavigate) {
      const sectionName = tab === 'home' ? 'hero' : tab === 'quote' ? 'quotation' : tab;
      onNavigate(sectionName);
    }
  };

  // Build unified services list for Mobile
  const mobileServicesList = [
    ...BUNDLES.map((b: BundleItem) => ({
      id: b.id,
      name: b.name,
      price: b.numericPrice,
      category: 'bundles',
      desc: b.tagline,
      turnaround: b.timeline,
      popular: b.popular,
    })),
    ...ALL_SERVICES.map((s: ServiceItem) => ({
      id: s.id,
      name: s.name,
      price: s.numericPrice,
      category: s.category === 'websites' ? 'websites' : s.category === 'monthly-plans' ? 'monthly' : 'tools',
      desc: s.description,
      turnaround: s.turnaround,
      popular: s.popular,
    })),
  ];

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length === 1) return; // keep at least 1
      setSelectedServices(selectedServices.filter((s) => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, id) => {
      const item = mobileServicesList.find((s) => s.id === id);
      return sum + (item ? item.price : 0);
    }, 0);
  };

  const total = calculateTotal();
  const advance = Math.round(total * 0.3);
  const balance = total - advance;

  const getWaQuoteMessage = () => {
    const selectedItemsList = selectedServices
      .map((id) => mobileServicesList.find((s) => s.id === id))
      .filter(Boolean) as { name: string; price: number }[];

    const itemsSummary = selectedItemsList
      .map((i) => `• ${i.name} (Rs. ${i.price.toLocaleString('en-IN')})`)
      .join('\n');

    return [
      `Hi! I was checking out the pricing on your website.`,
      ``,
      `I'm interested in getting this set up for my business:`,
      itemsSummary,
      ``,
      `Estimated Total: Rs. ${total.toLocaleString('en-IN')}`,
      `30% Advance: Rs. ${advance.toLocaleString('en-IN')}`,
      ``,
      `Could you let me know how we can get started and what you'd need from my end? Thanks!`,
    ].join('\n');
  };

  const getWaQuoteUrl = () => {
    return getWhatsAppUrl(getWaQuoteMessage());
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="md:hidden min-h-[100dvh] w-full text-slate-100 font-sans selection:bg-emerald-400 selection:text-slate-950 relative z-20 flex flex-col justify-between bg-transparent overflow-x-clip"
    >
      
      {/* 1. Fully Transparent Top Bar (Zero dark bar, zero background, completely transparent even when scrolled) */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-transparent px-4 py-3 flex items-center justify-between select-none">
        <button
          onClick={() => switchTab('home')}
          className="touch-target flex items-center text-left focus-visible:outline-emerald-400 cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
          aria-label="Home"
        >
          <KaizenLogo size="sm" showTagline={false} />
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenChat ? (
            <button
              onClick={onOpenChat}
              className="touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-200 text-xs font-mono tracking-wider active:scale-95 transition-transform backdrop-blur-md cursor-pointer"
              title="Open Kaizen Concierge"
              aria-label="Open Kaizen Concierge"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-breath shrink-0" />
              <span>Concierge</span>
            </button>
          ) : (
            <a
              href={getWhatsAppUrl("Hi! I came across your website and I'd like to discuss a project for my business. Can we connect?")}
              onClick={(e) => handleWhatsAppInstantClick(e, "Hi! I came across your website and I'd like to discuss a project for my business. Can we connect?")}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider active:scale-95 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.35)]"
            >
              <MessageSquare className="w-4 h-4 text-slate-950" />
              <span>ASK ME</span>
            </a>
          )}
        </div>
      </header>

      {/* 2. Main Stage with Natural Thumb Zone and 100dvh Safe-Area Spacing */}
      <main
        ref={tabContentRef}
        className="flex-1 px-4 pt-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] w-full max-w-full"
      >
        
        {/* ================= TAB 1: HOME ================= */}
        {activeTab === 'home' && (
          <div className="space-y-6 text-left">
            {/* Hook Headline (No blue word/eyebrow above) */}
            <h1 className="stagger-mobile type-hero text-white leading-[1.12]">
              Turn your idea into software that drives real business.
            </h1>

            {/* Narrative with Architectural Left Accent Rule (Zero Cards) */}
            <div className="stagger-mobile border-l-2 border-cyan-400/80 pl-3.5 py-1">
              <p className="type-body text-slate-200">
                Custom-built for local businesses, clinics, cafes, salons, and ambitious creators. From high-converting websites and digital menus to online booking and automated client tools — engineered 100% around your workflow.
              </p>
            </div>

            {/* Commercial Guarantees: Continuous Hairline Ledger */}
            <div className="stagger-mobile border-t border-b border-white/15 py-2 divide-y divide-white/10 type-meta">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-400">Starter Packages</span>
                <span className="text-emerald-400 font-bold text-sm tracking-wide">
                  ₹4,999
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-400">Payment Terms</span>
                <span className="text-white font-medium">
                  30% Advance <span className="text-zinc-600">/</span> 70% on Delivery
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-400">Source Code</span>
                <span className="text-white font-medium">100% Full Ownership</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-400">Post-Delivery</span>
                <span className="text-cyan-300 font-medium">15 Days Free Hypercare</span>
              </div>
            </div>

            {/* Sharp Architectural Action Triggers */}
            <div className="stagger-mobile space-y-3 pt-1">
              <button
                onClick={() => switchTab('quote')}
                className="btn-primary w-full"
              >
                <span>Calculate Instant Quote</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-3 pt-1 type-meta">
                <button
                  onClick={() => switchTab('demos')}
                  className="touch-target py-2 border-b border-white/20 text-slate-200 hover:text-white uppercase flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>All {PROJECTS.length} Demos</span>
                  <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                </button>

                <a
                  href={getWhatsAppUrl("Hi! I was checking out your website and I'm interested in building a website/system for my business.")}
                  onClick={(e) => handleWhatsAppInstantClick(e, "Hi! I was checking out your website and I'm interested in building a website/system for my business.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target py-2 border-b border-emerald-400/40 text-emerald-400 hover:text-emerald-300 uppercase flex items-center justify-between transition-colors"
                >
                  <span>WhatsApp Chat</span>
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </a>
              </div>
            </div>

            {/* Trust Ledger (No blue eyebrow) */}
            <div className="stagger-mobile space-y-2 pt-2">
              <div className="border-t border-b border-white/15 divide-y divide-white/10">
                <div className="py-3.5 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans">Zero Financial Risk</h4>
                    <p className="type-body text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Pay only 30% advance. The remaining 70% is due only when you review and approve the live delivery.
                    </p>
                  </div>
                </div>

                <div className="py-3.5 flex items-start gap-3">
                  <Code2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans">100% Complete Code Ownership</h4>
                    <p className="type-body text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Full GitHub repository, code files, and assets are transferred directly to you.
                    </p>
                  </div>
                </div>

                <div className="py-3.5 flex items-start gap-3">
                  <Zap className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans">Direct WhatsApp Collaboration</h4>
                    <p className="type-body text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Chat directly with the engineers building your project. Daily video previews and fast turnaround.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: SERVICES ================= */}
        {activeTab === 'services' && (
          <div className="space-y-5 text-left">
            <div className="stagger-mobile">
              {/* Blue word removed */}
              <h2 className="type-h2 text-white">
                Precision-Engineered Systems.
              </h2>
              <p className="type-body text-xs text-slate-300 mt-1">
                Pick what your business needs. 30% advance, pay balance only upon delivery approval.
              </p>
            </div>

            {/* Category Navigation (Clean spacing, shrink-0, smooth horizontal touch scroll) */}
            <div className="stagger-mobile flex items-center gap-3 overflow-x-auto border-b border-white/15 pb-2 px-0.5 type-meta uppercase no-scrollbar">
              {[
                { id: 'all', label: 'All Services' },
                { id: 'websites', label: 'Websites' },
                { id: 'tools', label: 'Custom Tools' },
                { id: 'bundles', label: 'Bundles' },
                { id: 'monthly', label: 'Monthly Care' },
              ].map((cat) => {
                const isSelected = selectedServiceCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedServiceCat(cat.id)}
                    className={`touch-target py-2 px-3 whitespace-nowrap shrink-0 transition-[color,border-color,transform] duration-150 border-b-2 cursor-pointer focus-visible:outline-emerald-400 active:scale-95 ${
                      isSelected
                        ? 'border-emerald-400 text-white font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Services Catalogue */}
            <div className="stagger-mobile border-t border-b border-white/15 divide-y divide-white/10">
              {mobileServicesList
                .filter((s) => selectedServiceCat === 'all' || s.category === selectedServiceCat)
                .map((s) => {
                  const isAdded = selectedServices.includes(s.id);
                  return (
                    <div key={s.id} className="py-4 space-y-2 text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white font-sans leading-snug">{s.name}</h3>
                          <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">
                            Rs. {s.price.toLocaleString('en-IN')}{s.category === 'monthly' ? '/mo' : ''}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleService(s.id)}
                          className={`touch-target shrink-0 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border transition-[background-color,border-color,transform] duration-150 cursor-pointer active:scale-95 ${
                            isAdded
                              ? 'border-emerald-400 bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                              : 'border-white/25 bg-white/5 text-white hover:border-emerald-400'
                          }`}
                        >
                          {isAdded ? '✓ Added' : '+ Add'}
                        </button>
                      </div>

                      <p className="type-body text-xs text-slate-300 leading-relaxed">
                        {s.desc}
                      </p>

                      <div className="pt-1 flex items-center justify-between type-meta">
                        <a
                          href={getWhatsAppUrl(`Hi! I saw the "${s.name}" service on your website and I'd like to get it for my business. Can you share the next steps?`)}
                          onClick={(e) => handleWhatsAppInstantClick(e, `Hi! I saw the "${s.name}" service on your website and I'd like to get it for my business. Can you share the next steps?`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-300 font-bold flex items-center gap-1 border-b border-cyan-400/30 pb-0.5"
                        >
                          <span>Order on WhatsApp</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>

                        <span className="text-slate-400">
                          ⏱ {s.turnaround}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: BUNDLES ================= */}
        {activeTab === 'bundles' && (
          <div className="space-y-5 text-left relative">
            {/* Watermark */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 font-display font-extrabold text-[90px] tracking-tight leading-none text-white/[0.025] select-none pointer-events-none uppercase -z-10">
              Pricing
            </div>

            <div className="stagger-mobile">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.05] border border-white/15 text-[10px] font-mono font-medium text-cyan-300 uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Turnkey Packages</span>
              </div>
              <h2 className="type-h2 text-white">
                Predictable Investment.
              </h2>
              <p className="type-body text-xs text-slate-300 mt-1">
                Fixed pricing with 30% advance. The remaining 70% is due only upon your delivery approval.
              </p>
            </div>

            {/* Individual Floating Glass Cards */}
            <div className="stagger-mobile space-y-4">
              {BUNDLES.map((b: BundleItem) => {
                const isShop = b.id === 'bundle-shop';
                return (
                  <div
                    key={b.id}
                    className={`rounded-3xl p-5 space-y-3.5 transition-all duration-200 relative ${
                      isShop
                        ? 'bg-gradient-to-b from-[#0c1833]/90 via-[#0a1226]/90 to-[#070b16]/95 border-2 border-cyan-400/60 shadow-[0_15px_40px_-10px_rgba(0,140,255,0.3)] ring-1 ring-cyan-400/30'
                        : 'bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-white/[0.015] backdrop-blur-2xl border border-white/10 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.6)]'
                    }`}
                  >
                    {/* Featured Ribbon Badge */}
                    {isShop && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-mono text-[9px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,245,255,0.6)] flex items-center gap-1 whitespace-nowrap">
                        <span>★</span>
                        <span>MOST POPULAR</span>
                      </div>
                    )}

                    {/* Top Row: Plan name and timeline */}
                    <div className="flex items-center justify-between type-meta pt-0.5">
                      <span className="text-xs font-mono font-medium tracking-wider uppercase text-slate-400">
                        {b.name.replace(' Bundle', '')}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-300">
                        ⏱ {b.timeline}
                      </span>
                    </div>

                    {/* Price Block */}
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-display font-extrabold text-white tracking-tight">
                          {b.price}
                        </span>
                        <span className="text-xs font-mono text-slate-400">/ package</span>
                      </div>
                      <div className="text-xs font-mono text-emerald-400 font-semibold mt-1">
                        Advance: {b.advance} (30% to start)
                      </div>
                    </div>

                    <p className="type-body text-xs text-slate-300 leading-relaxed">
                      {b.tagline}
                    </p>

                    <div className="w-full h-[1px] bg-white/10" />

                    {/* Features list with circular checks */}
                    <div className="space-y-2 font-sans text-xs text-slate-200">
                      {b.included.map((inc, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isShop
                                ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                : 'bg-white/[0.08] text-emerald-400 border border-white/20'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="leading-snug">{inc}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-col gap-2">
                      <a
                        href={getWhatsAppUrl(`Hi! I'm interested in the "${b.name}" (${b.price}) package I saw on your website. Could you let me know what you'd need from my side to get started?`)}
                        onClick={(e) =>
                          handleWhatsAppInstantClick(
                            e,
                            `Hi! I'm interested in the "${b.name}" (${b.price}) package I saw on your website. Could you let me know what you'd need from my side to get started?`
                          )
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-3 px-5 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${
                          isShop
                            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Choose Plan ↗</span>
                      </a>

                      <button
                        onClick={() => {
                          setSelectedServices([b.id]);
                          switchTab('quote');
                        }}
                        className="text-xs font-mono text-slate-400 hover:text-cyan-300 py-1 text-center"
                      >
                        Customize in Quote Calculator →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 4: DEMOS / PROJECTS ================= */}
        {activeTab === 'demos' && (
          <div className="space-y-5 text-left">
            <div className="stagger-mobile">
              {/* Blue word removed */}
              <h2 className="type-h2 text-white">
                Live Working Projects.
              </h2>
              <p className="type-body text-xs text-slate-300 mt-1">
                Tap any project below to test real software running in production.
              </p>
            </div>

            {/* Type Filter */}
            <div className="stagger-mobile flex items-center gap-5 border-b border-white/15 pb-2 type-meta uppercase">
              {(['ALL', 'WEBSITE', 'MOBILE WEBAPP'] as const).map((t) => {
                const isSelected = selectedProjectsType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedProjectsType(t)}
                    className={`touch-target py-2 transition-[color,border-color,transform] duration-150 border-b-2 cursor-pointer focus-visible:outline-emerald-400 active:scale-95 ${
                      isSelected
                        ? 'border-cyan-400 text-white font-bold drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'ALL' ? `All (${PROJECTS.length})` : t === 'WEBSITE' ? 'Websites' : 'Mobile Apps'}
                  </button>
                );
              })}
            </div>

            {/* Projects Feed */}
            <div className="stagger-mobile border-t border-b border-white/15 divide-y divide-white/10">
              {PROJECTS
                .filter((p: ProjectItem) => selectedProjectsType === 'ALL' || p.type === selectedProjectsType)
                .map((p: ProjectItem) => (
                  <div key={p.index} className="py-4 space-y-2.5 text-left">
                    <div className="flex items-center justify-between type-meta">
                      <span className="text-cyan-400 font-bold">{p.type}</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span>ONLINE</span>
                      </span>
                    </div>

                    <h3 className="type-h3 text-white">
                      {p.name}
                    </h3>
                    
                    <p className="type-body text-xs text-slate-300 leading-relaxed">
                      {p.summary}
                    </p>

                    {/* Business Value Highlight */}
                    <div className="border-l-2 border-emerald-400 pl-3 py-1 type-body text-xs text-slate-200">
                      <strong className="text-emerald-400 font-mono block text-xs">Client Benefit:</strong>
                      {p.businessValue}
                    </div>

                    {/* Direct Launch Actions */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex-1"
                      >
                        <span>Open Live Demo</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <a
                        href={getWhatsAppUrl(`Hi! I tested your live demo for "${p.name}" on the website and really like it. I'm looking for something similar for my business—can we discuss details?`)}
                        onClick={(e) => handleWhatsAppInstantClick(e, `Hi! I tested your live demo for "${p.name}" on the website and really like it. I'm looking for something similar for my business—can we discuss details?`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="touch-target p-2.5 border border-white/20 text-emerald-400 hover:text-white"
                        title="Inquire on WhatsApp"
                        aria-label="Inquire on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: QUOTE / ESTIMATOR ================= */}
        {activeTab === 'quote' && (
          <div className="space-y-5 text-left">
            <div className="stagger-mobile">
              {/* Blue word removed */}
              <h2 className="type-h2 text-white">
                Calculate Your Price.
              </h2>
              <p className="type-body text-xs text-slate-300 mt-1">
                Tap services to build your customized proposal in real time.
              </p>
            </div>

            {/* Quick 1-Tap Presets */}
            <div className="stagger-mobile space-y-2">
              <span className="type-meta text-slate-400 font-semibold block">
                BUSINESS PRESETS:
              </span>
              <div className="grid grid-cols-2 gap-2 type-meta">
                <button
                  onClick={() => setSelectedServices(['bundle-shop'])}
                  className="touch-target p-2.5 border border-white/15 text-slate-200 text-left hover:border-emerald-400 active:scale-95 transition-colors cursor-pointer bg-white/[0.03]"
                >
                  🏪 Cafe / Retail
                </button>
                <button
                  onClick={() => setSelectedServices(['clinic-scheduling', 'whatsapp-bot', 'google-review-qr'])}
                  className="touch-target p-2.5 border border-white/15 text-slate-200 text-left hover:border-emerald-400 active:scale-95 transition-colors cursor-pointer bg-white/[0.03]"
                >
                  🩺 Clinic / Salon
                </button>
                <button
                  onClick={() => setSelectedServices(['membership-system', 'website-1page', 'whatsapp-bot'])}
                  className="touch-target p-2.5 border border-white/15 text-slate-200 text-left hover:border-emerald-400 active:scale-95 transition-colors cursor-pointer bg-white/[0.03]"
                >
                  🏋️ Gym / Fitness
                </button>
                <button
                  onClick={() => setSelectedServices(['bundle-starter'])}
                  className="touch-target p-2.5 border border-white/15 text-slate-200 text-left hover:border-emerald-400 active:scale-95 transition-colors cursor-pointer bg-white/[0.03]"
                >
                  🚀 Starter Promo
                </button>
              </div>
            </div>

            {/* Live Quotation Summary Console */}
            <div className="stagger-mobile glass-surface border-y-2 border-emerald-400 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div>
                  <span className="type-meta text-slate-400 block">Total Price</span>
                  <span className="text-2xl font-mono font-bold text-white">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right">
                  <span className="type-meta text-emerald-400 font-semibold block">30% Advance</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">₹{advance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="type-meta text-slate-300 flex items-center justify-between">
                <span>Remaining 70% due on delivery:</span>
                <span className="font-bold text-white">₹{balance.toLocaleString('en-IN')}</span>
              </div>

              <a
                href={getWaQuoteUrl()}
                onClick={(e) => handleWhatsAppInstantClick(e, getWaQuoteMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full"
              >
                <span>Confirm &amp; Send on WhatsApp</span>
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>

            {/* Service Toggle Checklist */}
            <div className="stagger-mobile space-y-2 pt-2">
              <span className="type-meta text-slate-400 font-semibold block">
                CUSTOMIZE SERVICES ({selectedServices.length} SELECTED):
              </span>

              <div className="border-t border-b border-white/15 divide-y divide-white/10">
                {mobileServicesList.map((s) => {
                  const isSelected = selectedServices.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      className={`py-3 px-2 flex items-start justify-between gap-3 cursor-pointer transition-[background-color,border-color] duration-150 ${
                        isSelected
                          ? 'border-l-2 border-emerald-400 bg-white/[0.05] text-white pl-2.5'
                          : 'border-l-2 border-transparent text-slate-300 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        {/* Square Architectural Check Indicator */}
                        <div
                          className={`w-4 h-4 border flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                            isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-500 bg-white/5'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-sans font-bold leading-snug">{s.name}</div>
                          <div className="type-meta text-slate-400 mt-0.5">
                            ⏱ {s.turnaround}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-400 shrink-0 text-right mt-0.5">
                        ₹{s.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. PERMANENTLY FIXED BOTTOM NAVIGATION DOCK (Optical Glass, Safe-Area Anchored, 48x48 Touch Targets) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#080c14]/90 backdrop-blur-[20px] saturate-[190%] border-t border-white/15 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around select-none shadow-[0_-10px_35px_rgba(0,0,0,0.8)]">
        
        <button
          onClick={() => switchTab('home')}
          className={`touch-target flex flex-col items-center gap-1 py-1 px-3 transition-[color,transform] duration-150 active:scale-95 cursor-pointer focus-visible:outline-emerald-400 ${
            activeTab === 'home' ? 'text-emerald-400 font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Home"
        >
          <Sparkles className="w-5 h-5" />
          <span className="type-meta">Home</span>
        </button>

        <button
          onClick={() => switchTab('services')}
          className={`touch-target flex flex-col items-center gap-1 py-1 px-3 transition-[color,transform] duration-150 active:scale-95 cursor-pointer focus-visible:outline-emerald-400 ${
            activeTab === 'services' ? 'text-emerald-400 font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Services"
        >
          <Layers className="w-5 h-5" />
          <span className="type-meta">Services</span>
        </button>

        <button
          onClick={() => switchTab('bundles')}
          className={`touch-target flex flex-col items-center gap-1 py-1 px-3 transition-[color,transform] duration-150 active:scale-95 cursor-pointer focus-visible:outline-emerald-400 ${
            activeTab === 'bundles' ? 'text-emerald-400 font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Bundles"
        >
          <Package className="w-5 h-5" />
          <span className="type-meta">Bundles</span>
        </button>

        <button
          onClick={() => switchTab('demos')}
          className={`touch-target flex flex-col items-center gap-1 py-1 px-3 transition-[color,transform] duration-150 active:scale-95 cursor-pointer focus-visible:outline-emerald-400 ${
            activeTab === 'demos' ? 'text-emerald-400 font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Demos"
        >
          <Smartphone className="w-5 h-5" />
          <span className="type-meta">Demos</span>
        </button>

        <button
          onClick={() => switchTab('quote')}
          className={`touch-target flex flex-col items-center gap-1 py-1 px-3 transition-[color,transform] duration-150 active:scale-95 cursor-pointer focus-visible:outline-emerald-400 ${
            activeTab === 'quote' ? 'text-emerald-400 font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Quote"
        >
          <Calculator className="w-5 h-5" />
          <span className="type-meta">Quote</span>
        </button>

      </nav>

    </div>
  );
};
