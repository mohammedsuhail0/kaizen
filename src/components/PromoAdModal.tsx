import React, { useState } from 'react';
import { X, Maximize2, Smartphone, Monitor } from 'lucide-react';

interface PromoAdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromoAdModal: React.FC<PromoAdModalProps> = ({ isOpen, onClose }) => {
  const [aspect, setAspect] = useState<'16-9' | '9-16'>('16-9');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#070c14] border border-cyan-500/30 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(0,245,255,0.2)] overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#0c1220]/80">
          <div className="flex items-center gap-3">
            <span className="font-serif font-black text-cyan-400 text-sm bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
              改善
            </span>
            <div>
              <div className="text-white text-sm font-bold tracking-wide">
                KAIZEN 30s SHOWCASE PROMO AD
              </div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase">
                124 BPM Beat-Synced · Dual-Aspect Master
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Aspect Switcher */}
            <div className="flex bg-black/40 border border-white/10 p-1 rounded-lg">
              <button
                onClick={() => setAspect('16-9')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-semibold transition-colors ${
                  aspect === '16-9' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
                title="16:9 Landscape (Hero & YouTube)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">16:9 Landscape</span>
              </button>
              <button
                onClick={() => setAspect('9-16')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-semibold transition-colors ${
                  aspect === '9-16' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
                title="9:16 Vertical Reel (Instagram & TikTok)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">9:16 Reel</span>
              </button>
            </div>

            <a
              href="/kaizen-promo-ad.html"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
              title="Open Fullscreen Studio Player"
            >
              <Maximize2 className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Ad Player Viewport */}
        <div className="flex-1 bg-black/95 flex items-center justify-center p-2 sm:p-4 min-h-[500px] overflow-hidden">
          <div
            className={`transition-all duration-300 rounded-xl overflow-hidden border border-white/10 shadow-2xl relative ${
              aspect === '16-9' ? 'w-full max-w-4xl aspect-video' : 'w-[320px] sm:w-[350px] aspect-[9/16]'
            }`}
          >
            <iframe
              src="/kaizen-promo-ad.html"
              title="Kaizen 30s Promo Ad"
              className="w-full h-full border-0"
              allow="autoplay; audio"
            />
          </div>
        </div>

        {/* Bottom Bar Info */}
        <div className="px-5 py-2.5 bg-[#090e18] border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Web Audio API Engine · Zero Latency Synthesizer</span>
          </div>
          <div>
            Showcase: <span className="text-cyan-400 font-bold">mohammed-suhail.vercel.app</span>
          </div>
        </div>

      </div>
    </div>
  );
};
