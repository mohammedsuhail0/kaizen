import React from 'react';
import { AGENCY_CONFIG } from '../data/agencyData';
import { KaizenLogo } from './KaizenLogo';

interface TrustSectionProps {
  onNavigate: (sectionId: string) => void;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ onNavigate }) => {
  const { testimonials, email, displayPhone } = AGENCY_CONFIG;

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'bundles', label: 'Bundles' },
    { id: 'demos', label: 'Client Demos' },
    { id: 'quotation', label: 'Get Quote' },
  ];

  return (
    <section id="footer" className="w-full text-left scroll-mt-24 pt-8 pb-6 border-t border-white/10 mt-8">
      {/* 1. Optional Testimonials Strip (Renders ONLY if data exists in config) */}
      {testimonials && testimonials.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="type-meta text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Client Feedback
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl glass-surface border border-white/10 text-left">
                <p className="text-sm font-sans text-slate-200 leading-relaxed mb-4 italic">
                  "{t.text}"
                </p>
                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">{t.clientName}</span>
                    <span className="text-slate-400 text-[11px]">{t.businessName}</span>
                  </div>
                  {t.location && (
                    <span className="text-[11px] font-mono text-emerald-400">{t.location}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Simple Clean Footer */}
      <footer className="text-slate-400 text-xs font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KaizenLogo size="sm" showTagline={false} />
            <span className="text-slate-400 text-xs">
              © {new Date().getFullYear()} Kaizen Software Agency · Hyderabad, India
            </span>
          </div>

          {/* Section Navigation Links */}
          <nav className="flex flex-wrap items-center gap-4 text-xs font-mono" aria-label="Footer navigation">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
          <span>Pay 30% to start, 70% when you're happy · 100% Code Ownership</span>
          <span>{displayPhone} · {email}</span>
        </div>
      </footer>
    </section>
  );
};
