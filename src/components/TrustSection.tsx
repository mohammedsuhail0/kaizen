import React from 'react';
import { ShieldCheck, Code2, Headphones, MessageSquare, Mail } from 'lucide-react';
import { AGENCY_CONFIG, getWhatsAppUrl, handleWhatsAppInstantClick } from '../data/agencyData';
import { KaizenLogo } from './KaizenLogo';

interface TrustSectionProps {
  onNavigate: (sectionId: string) => void;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ onNavigate }) => {
  const { founder, whyKaizen, testimonials, email, displayPhone } = AGENCY_CONFIG;

  const getWhyIcon = (id: string) => {
    switch (id) {
      case 'fixed-price':
        return <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'ownership':
        return <Code2 className="w-5 h-5 text-cyan-400 shrink-0" />;
      case 'support':
      default:
        return <Headphones className="w-5 h-5 text-emerald-400 shrink-0" />;
    }
  };

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'bundles', label: 'Bundles' },
    { id: 'demos', label: 'Client Demos' },
    { id: 'quotation', label: 'Get Quote' },
  ];

  return (
    <section id="trust" className="w-full text-left scroll-mt-24 pt-10 pb-6 border-t border-white/10 mt-8">
      {/* 1. Optional Testimonials Strip (Renders ONLY if data exists in config) */}
      {testimonials && testimonials.length > 0 && (
        <div className="mb-12">
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

      {/* 2. Trust Section Hero Card */}
      <div className="rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] border border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Founder Bio & Photo Slot */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-start gap-5">
            {/* Photo slot / Neutral monogram placeholder */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#121c2e] to-[#0a101d] border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
              {founder.photo ? (
                <img
                  src={founder.photo}
                  alt={founder.name}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <span className="text-2xl font-bold font-display text-emerald-400 tracking-wider">MS</span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Hyderabad</span>
                </div>
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs font-mono font-medium mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-breath" />
                <span>Direct Engineer Access</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Built by {founder.name}, {AGENCY_CONFIG.city}.
              </h2>
              <p className="text-sm font-sans text-slate-300 mt-2 leading-relaxed max-w-md">
                {founder.bio} Every system is engineered directly with you, delivered in days, with zero agency middlemen.
              </p>

              {/* Founder Contact Row */}
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-white/10 text-xs font-mono">
                <a
                  href={getWhatsAppUrl("Hi Suhail! I'm visiting the Kaizen website and would like to discuss a project.")}
                  onClick={(e) => handleWhatsAppInstantClick(e, "Hi Suhail! I'm visiting the Kaizen website and would like to discuss a project.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors cursor-pointer"
                  aria-label="Chat directly on WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp {displayPhone}</span>
                </a>

                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 transition-colors cursor-pointer"
                    aria-label="Send an email"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 3 Why Kaizen Points */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
            {whyKaizen.map((point) => (
              <div key={point.id} className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  {getWhyIcon(point.id)}
                </div>
                <h3 className="text-sm font-sans font-semibold text-white">
                  {point.title}
                </h3>
                <p className="text-xs font-sans text-slate-300 leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Simple Clean Footer */}
      <footer className="pt-6 border-t border-white/10 text-slate-400 text-xs font-sans">
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
