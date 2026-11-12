import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger, cubicBezier } from 'animejs';
import { Download, ExternalLink, Copy, Check, Palette, Sparkles } from 'lucide-react';

export const BrandSection: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = brandRef.current?.querySelectorAll('.stagger-brand');
    if (!items || items.length === 0) return;

    animate(items, {
      translateY: [16, 0],
      opacity: [0, 1],
      delay: stagger(50, { start: 60 }),
      ease: cubicBezier(0.16, 1, 0.3, 1),
      duration: 600,
    });
  }, []);

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const assets = [
    { name: 'Official Style Guide Card (2X 4K)', path: '/assets/kaizen-brand-style-guide.png', ext: 'PNG' },
    { name: 'Master Logo (Dark Background)', path: '/assets/kaizen-logo-dark.svg', ext: 'SVG' },
    { name: 'Master Logo (Light Background)', path: '/assets/kaizen-logo-light.svg', ext: 'SVG' },
    { name: 'Geometric K Icon Mark', path: '/assets/kaizen-mark.svg', ext: 'SVG' },
    { name: 'Japanese Hanko Seal (改善)', path: '/assets/kaizen-seal.svg', ext: 'SVG' },
  ];

  const primaryColors = [
    { name: 'Deep Obsidian', hex: '#080C14' },
    { name: 'Ink Slate', hex: '#0D1320' },
    { name: 'Cyan Core', hex: '#00F5FF' },
    { name: 'Cobalt Sky', hex: '#0077FF' },
    { name: 'Electric Azure', hex: '#00C8FF' },
    { name: 'Sakura Blue', hex: '#38BDF8' },
    { name: 'Sapphire Deep', hex: '#0052CC' },
    { name: 'Zen Emerald', hex: '#10B981' },
  ];

  return (
    <div
      ref={brandRef}
      className="w-full text-left max-w-5xl py-2 select-none"
    >
      <div className="stagger-brand flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-white/15 pb-3">
        <div>
          <h2 className="type-h2 text-white">
            Brand Identity &amp; Visual Assets
          </h2>
          <p className="type-body text-slate-300 mt-1 max-w-xl">
            The official 12-panel design system standard, color tokens, and production SVG assets.
          </p>
        </div>

        <a
          href="/kaizen-brand-style-guide.html"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-cyan-300 hover:text-white shrink-0 self-start sm:self-auto"
        >
          <span>Open Full Interactive Card</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Main Visual Board Preview */}
      <div className="stagger-brand relative overflow-hidden border border-cyan-500/30 bg-black/60 shadow-[0_10px_40px_rgba(0,0,0,0.8)] mb-6 group">
        <img
          src="/assets/kaizen-brand-style-guide.png"
          alt="Brand Style Guide Board"
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-4">
          <a
            href="/assets/kaizen-brand-style-guide.png"
            download="kaizen-brand-style-guide.png"
            className="btn-primary"
          >
            <Download className="w-4 h-4" />
            <span>Download 2X Master PNG (2880x1900)</span>
          </a>
        </div>
      </div>

      {/* Two Column Grid: Color Swatches & SVG Asset Downloads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Colors */}
        <div className="stagger-brand p-4 glass-surface">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <span className="type-meta font-bold text-cyan-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4" />
              Core Palette Tokens
            </span>
            <span className="type-meta text-slate-400">Click to Copy HEX</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {primaryColors.map((color) => (
              <button
                key={color.hex}
                onClick={() => copyColor(color.hex)}
                className="group p-2 bg-black/40 border border-white/10 hover:border-cyan-400/50 transition-[border-color,transform] duration-150 active:scale-95 text-left flex flex-col justify-between cursor-pointer focus-visible:outline-cyan-400"
              >
                <div
                  className="w-full h-7 mb-1.5 border border-white/15"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-xs font-sans font-medium text-white truncate block">
                  {color.name}
                </span>
                <span className="type-meta text-slate-400 flex items-center justify-between mt-0.5">
                  {color.hex}
                  {copiedHex === color.hex ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Vector Asset Kit */}
        <div className="stagger-brand p-4 glass-surface">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <span className="type-meta font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Production Vector Kit
            </span>
            <span className="type-meta text-slate-400">SVG &amp; PNG</span>
          </div>

          <div className="space-y-2">
            {assets.map((asset) => (
              <a
                key={asset.path}
                href={asset.path}
                download
                className="touch-target flex items-center justify-between p-2.5 bg-black/30 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 transition-[background-color,border-color,transform] duration-150 active:scale-[0.985] group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-1.5 py-0.5 text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {asset.ext}
                  </span>
                  <span className="text-sm text-slate-200 group-hover:text-white font-medium">
                    {asset.name}
                  </span>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
