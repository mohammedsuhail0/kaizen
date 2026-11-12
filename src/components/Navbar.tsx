import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger, cubicBezier } from 'animejs';
import { X, MessageSquare, ArrowUpRight, Calculator } from 'lucide-react';
import { KaizenLogo } from './KaizenLogo';
import { getWhatsAppUrl, handleWhatsAppInstantClick } from '../data/agencyData';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenEstimator?: () => void;
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate, onOpenEstimator, onOpenChat }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuNavRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Anime.js Staggered Entrance Choreography when menu opens
  useEffect(() => {
    if (!menuOpen) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = menuNavRef.current?.querySelectorAll('.menu-stagger-item');
    if (!items || items.length === 0) return;

    animate(items, {
      translateY: [20, 0],
      opacity: [0, 1],
      delay: stagger(55, { start: 120 }),
      ease: cubicBezier(0.16, 1, 0.3, 1),
      duration: 500,
    });
  }, [menuOpen]);

  const navItems = [
    { id: 'hero', index: '01.', label: 'Home' },
    { id: 'services', index: '02.', label: 'Agency Services' },
    { id: 'bundles', index: '03.', label: 'Popular Bundles' },
    { id: 'demos', index: '04.', label: 'Live Client Demos' },
    { id: 'quotation', index: '05.', label: 'Instant Quotation' },
    { id: 'brand', index: '06.', label: 'Brand & Style Guide' },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <>
      {/* 1. Ultra-Clean Architectural Header (Capped at 1440px with breathing room) */}
      <header className="fixed top-0 left-0 right-0 z-40 py-3 sm:py-4 px-6 sm:px-10 flex items-center justify-between select-none pointer-events-none">
        {/* Top Left: Accessible 48x48px Menu Toggle + Brand */}
        <div className="flex items-center gap-4 pointer-events-auto">
          {/* Architectural 3-Line Menu Button (48x48px hit area) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="touch-target p-2 text-white hover:text-emerald-400 focus-visible:outline-emerald-400 transition-[color,transform] duration-200 active:scale-95 group cursor-pointer"
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <div className="flex flex-col justify-center gap-1.5 w-6 h-5">
              <span className="w-6 h-[2px] bg-white group-hover:bg-emerald-400 transition-[background-color] duration-200" />
              <span className="w-4 h-[2px] bg-white group-hover:w-6 group-hover:bg-emerald-400 transition-[background-color,width] duration-200" />
              <span className="w-5 h-[2px] bg-white group-hover:w-6 group-hover:bg-emerald-400 transition-[background-color,width] duration-200" />
            </div>
          </button>

          {/* Vertical Divider */}
          <div className="w-[1px] h-5 bg-white/15" />

          {/* KAIZEN Brand Logo */}
          <button
            onClick={() => onNavigate('hero')}
            className="flex items-center text-left focus-visible:outline-emerald-400 hover:opacity-90 transition-opacity cursor-pointer"
            aria-label="Kaizen Agency Home"
          >
            <KaizenLogo size="sm" showTagline={false} />
          </button>
        </div>

        {/* Top Right: Direct Quick Action Triggers */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {onOpenEstimator && (
            <button
              onClick={onOpenEstimator}
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-emerald-400/50 text-xs font-mono text-slate-200 hover:text-white transition-[background-color,border-color,transform] duration-150 active:scale-95 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quote Builder</span>
            </button>
          )}

          {onOpenChat ? (
            <button
              onClick={onOpenChat}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-mono font-bold tracking-wider uppercase transition-[transform,box-shadow] duration-150 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.35)] cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>ASK ME</span>
            </button>
          ) : (
            <a
              href={getWhatsAppUrl("Hi! I came across your website and I'd like to discuss a project for my business. Can we connect?")}
              onClick={(e) => handleWhatsAppInstantClick(e, "Hi! I came across your website and I'd like to discuss a project for my business. Can we connect?")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold tracking-wider uppercase transition-[background-color,transform,box-shadow] duration-150 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat ↗</span>
            </a>
          )}
        </div>
      </header>

      {/* 2. Fullscreen Authentic Optical Glass Showcase Navigation Menu */}
      <div
        className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-12 lg:p-16 backdrop-blur-[24px] saturate-[190%] bg-[#080c14]/85 border-b border-white/10 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          menuOpen
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-4'
        }`}
      >
        {/* Top Row: Brand Header & 48x48px Accessible Close Button */}
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between border-b border-white/10 pb-5 sm:pb-6">
          {/* Brand & Subtitle */}
          <div>
            <KaizenLogo size="sm" showTagline={false} />
            <div className="text-xs font-mono font-medium text-emerald-400 tracking-wider mt-1">
              Navigation Menu
            </div>
          </div>

          {/* Right: Close Button with Minimum 48x48px Touch Target */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline font-mono text-xs text-slate-400">
              Esc to close
            </span>

            <button
              onClick={() => setMenuOpen(false)}
              className="touch-target p-2 text-slate-300 hover:text-white border border-white/15 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] transition-[background-color,border-color,transform] duration-150 active:scale-95 focus-visible:outline-emerald-400 cursor-pointer"
              aria-label="Close Navigation"
              title="Close Menu (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Large Numbered Menu Links with Anime.js Staggered Entrance */}
        <nav ref={menuNavRef} className="my-auto py-6 sm:py-10 w-full max-w-7xl mx-auto">
          <ul className="space-y-4 sm:space-y-6">
            {navItems.map((item) => {
              const isSelected = activeSection === item.id;
              return (
                <li key={item.id} className="menu-stagger-item opacity-100">
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className="group flex items-baseline text-left focus-visible:outline-emerald-400 transition-transform duration-200 hover:translate-x-3 active:scale-[0.985] cursor-pointer"
                  >
                    {/* Number Index */}
                    <span
                      className={`font-mono text-base sm:text-xl font-bold mr-4 sm:mr-6 transition-colors duration-150 ${
                        isSelected
                          ? 'text-emerald-400'
                          : 'text-slate-500 group-hover:text-emerald-400'
                      }`}
                    >
                      {item.index}
                    </span>

                    {/* Headline Label */}
                    <span
                      className={`type-h2 transition-colors duration-150 ${
                        isSelected
                          ? 'text-emerald-400'
                          : 'text-white group-hover:text-emerald-300'
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Hover Arrow Indicator (transform and opacity only) */}
                    <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8 ml-3 text-emerald-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-200" />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Row: Direct Client Contact Actions */}
        <div className="w-full max-w-7xl mx-auto pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={getWhatsAppUrl("Hi! I was checking out your website and want to explore building a website/system for my business.")}
              onClick={(e) => handleWhatsAppInstantClick(e, "Hi! I was checking out your website and want to explore building a website/system for my business.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              title="Connect on WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Connect on WhatsApp ↗</span>
            </a>

            <a
              href="mailto:mohammedsuhail0@gmail.com?subject=Software%20Agency%20Project%20Inquiry"
              className="btn-secondary"
              title="Send direct email"
            >
              <span>Email: mohammedsuhail0@gmail.com ↗</span>
            </a>
          </div>

          <div className="type-meta text-slate-400">
            <span>30% Advance • 3 to 7 Days Delivery • 100% Code Ownership</span>
          </div>
        </div>
      </div>
    </>
  );
};
