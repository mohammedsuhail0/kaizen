import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  ArrowUpRight,
  Copy,
  Check,
  RefreshCw,
  Printer,
  Zap,
} from 'lucide-react';
import { getWhatsAppUrl, handleWhatsAppInstantClick } from '../data/agencyData';
import { GROQ_API_KEY, KAIZEN_SYSTEM_PROMPT } from '../data/aiConsultantPrompt';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thought?: string;
  toolCall?: {
    tool: string;
    args: Record<string, unknown>;
  };
  citations?: string[];
  isStreaming?: boolean;
}

export interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const QUICK_INQUIRIES = [
  {
    label: '💬 WhatsApp Bot + Dashboard',
    query:
      'I have a website and need an automated WhatsApp order bot and an admin dashboard. How much will it cost, monthly fees, and is the first year free?',
  },
  {
    label: '☕ Cafe & Restaurant (₹6,999)',
    query:
      'What package do you recommend for a cafe / restaurant with digital QR menu and WhatsApp direct ordering?',
  },
  {
    label: '🏥 Clinic & Healthcare (₹8,999)',
    query:
      'I run a dental / medical clinic. What are the deliverables and pricing for an online appointment booking system and patient triage?',
  },
  {
    label: '🚀 Starter Landing Page (₹4,999)',
    query:
      'What is included in the ₹4,999 Starter Bundle, turnaround timeline, and 30/70 payment terms?',
  },
  {
    label: '🏋️ Gym & Fitness (₹9,499)',
    query:
      'What system do you have for a gym with membership tracking and fee dues?',
  },
  {
    label: '⚡ Custom Engineering Scope',
    query:
      'What is your custom software engineering process, sprint kickoff timeline, and 30/70 milestone policy?',
  },
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '**Welcome to Kaizen Solutions.**\n\nI am your **Senior Solutions Architect**, directly integrated with our official engineering and pricing catalog.\n\nExplore our turnkey commercial packages, delivery turnarounds, and custom software architectures. Tell me about your business or operational requirements, and I will formulate a clear, itemized proposal with exact 30/70 commercial terms.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeThought, setActiveThought] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpressQuoteOpen, setIsExpressQuoteOpen] = useState(false);

  // Express quote fields
  const [expressBusiness, setExpressBusiness] = useState('');
  const [expressNeed, setExpressNeed] = useState('');
  const [expressPackage, setExpressPackage] = useState('Growth Engine Bundle (₹11,999)');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, activeThought]);

  // Handle initial query if passed
  useEffect(() => {
    if (isOpen && initialQuery && initialQuery.trim().length > 0) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrintProposal = (content: string) => {
    const brief = buildWhatsAppHandoffMessage(content, messages);
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official Proposal — Kaizen Software Agency</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #0f172a; padding: 40px; margin: 0; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
            .brand { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
            .brand span { color: #059669; }
            .subtitle { font-size: 13px; color: #64748b; font-family: monospace; }
            .pill { display: inline-block; padding: 4px 10px; background: #ecfdf5; border: 1px solid #10b981; color: #047857; font-size: 11px; font-weight: bold; border-radius: 4px; font-family: monospace; }
            .content { white-space: pre-wrap; font-size: 14px; background: #f8fafc; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; font-family: monospace; }
            .terms { margin-top: 30px; font-size: 12px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            .terms li { margin-bottom: 6px; }
            @media print { body { padding: 20px; } button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">KAIZEN<span>.</span></div>
              <div class="subtitle">Bespoke Software Engineering & Turnkey Systems</div>
            </div>
            <div style="text-align: right;">
              <span class="pill">OFFICIAL COMMERCIAL QUOTATION</span>
              <div class="subtitle" style="margin-top: 5px;">Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
          <h3>Project Commercial Summary & Brief:</h3>
          <div class="content">${brief.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div class="terms">
            <strong>Standard Kaizen Commercial Guarantees:</strong>
            <ul>
              <li><strong>Zero Financial Risk:</strong> 30% advance secures engineering kickoff. The 70% balance is payable strictly after final live approval.</li>
              <li><strong>100% Asset Ownership:</strong> Full GitHub repository source code, design assets, and database credentials transferred upon completion.</li>
              <li><strong>Hypercare Warranty:</strong> Includes 15–30 days of post-delivery bug fixes, adjustments, and handover assistance at zero extra cost.</li>
            </ul>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSendExpressQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expressBusiness.trim() || !expressNeed.trim()) return;

    const message = `Hi Kaizen Team! I'm requesting an official proposal from your website:\n\n• Business / Brand: ${expressBusiness.trim()}\n• Primary Need: ${expressNeed.trim()}\n• Selected Package: ${expressPackage}\n• Commercial Terms: 30% advance split, 70% upon delivery approval\n\nPlease share the proposal details and kickoff invoice link!`;

    const url = getWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsExpressQuoteOpen(false);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isStreaming) return;

    setInput('');
    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    // Add user message to state
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: textToSend },
      { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true },
    ]);

    setIsStreaming(true);
    setActiveThought('Thinking...');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const historyPayload = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      let response: Response | null = null;

      // 1. Primary call: Vercel Serverless Endpoint /api/chat (HTTPS, same-origin)
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: textToSend, history: historyPayload }),
          signal: abortController.signal,
        });
        if (res.ok) {
          response = res;
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') throw e;
      }

      // 2. Localhost fallback (if developing locally)
      if (!response && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        try {
          const res = await fetch('http://localhost:8000/api/v1/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: textToSend, history: historyPayload }),
            signal: abortController.signal,
          });
          if (res.ok) {
            response = res;
          }
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') throw e;
        }
      }

      // 3. Direct Groq API fallback with active, high-quota models
      if (!response) {
        setActiveThought('Thinking...');
        const groqMessages = [
          { role: 'system', content: KAIZEN_SYSTEM_PROMPT },
          ...historyPayload.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
          { role: 'user', content: textToSend },
        ];

        const clientModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
        for (const model of clientModels) {
          try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model,
                messages: groqMessages,
                temperature: 0.1,
                stream: true,
                max_tokens: 1500,
              }),
              signal: abortController.signal,
            });
            if (res.ok) {
              response = res;
              break;
            }
          } catch (e) {
            if (e instanceof Error && e.name === 'AbortError') throw e;
          }
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Chat service error: ${response?.statusText || 'Unable to connect'}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported by browser.');

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          if (trimmed === 'data: [DONE]') continue;

          const jsonStr = trimmed.replace('data: ', '').trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            // Handle Groq delta chunks
            if (event.choices?.[0]?.delta) {
              const delta = event.choices[0].delta;
              if (delta.content) {
                accumulatedContent += delta.content;
                setActiveThought('');
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedContent, isStreaming: true }
                      : msg
                  )
                );
              } else if (delta.reasoning) {
                setActiveThought('Thinking...');
              }
            }
            // Handle custom SSE events
            else if (event.type === 'token') {
              accumulatedContent += event.content || '';
              setActiveThought('');
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: accumulatedContent, isStreaming: true }
                    : msg
                )
              );
            } else if (event.type === 'thought' || event.type === 'tool_call') {
              setActiveThought('Thinking...');
            } else if (event.type === 'done') {
              setIsStreaming(false);
              setActiveThought('');
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
                )
              );
            }
          } catch {
            // Partial JSON buffer ignored until complete
          }
        }
      }

      // Safety check: ensure accumulated content is not empty
      if (!accumulatedContent.trim()) {
        const fallbackText =
          "Welcome to Kaizen Software Agency. I am your Senior Technical Sales Director.\n\n" +
          "We engineer bespoke digital systems with zero financial risk: **30% advance to start**, and **70% balance strictly payable only after you approve** the live deployment.\n\n" +
          "### 📊 Flagship Turnkey Packages\n\n" +
          "| Package | Best Suited For | Deliverables | Investment | 30% Advance | 70% Balance | Turnaround |\n" +
          "|---|---|---|---|---|---|---|\n" +
          "| **Starter Bundle** | Local shops, solo brands, portfolios | 1-Page landing page, responsive layout, WhatsApp lead chat | **₹4,999** | ₹1,500 | ₹3,499 | 3–5 Days |\n" +
          "| **Shop & Cafe Bundle** | Cafes, bakeries, restaurants, retail | QR digital menu, 1-click WhatsApp order engine, review booster | **₹6,999** | ₹2,100 | ₹4,899 | 5–7 Days |\n" +
          "| **Growth Engine Bundle** | Clinics, salons, gyms, webapps | Multi-page webapp, 24/7 WhatsApp bot, client dashboard | **₹11,999** | ₹3,600 | ₹8,399 | 7–10 Days |\n\n" +
          "Every package includes **2 full revision rounds**, **100% full code ownership**, and **free hypercare support**. Tell me about your business or project to lock in your scope!";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: fallbackText, isStreaming: false }
              : msg
          )
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setActiveThought('');
        setIsStreaming(false);
        return;
      }

      const errorMessage =
        "\n\n*(Unable to reach the consultation service right now. Please message us directly on WhatsApp.)*";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: msg.content + errorMessage,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      setActiveThought('');
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setActiveThought('');
  };

  const handleReset = () => {
    if (isStreaming) handleStopStreaming();
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "**Conversation reset.**\n\nWhat kind of business or project are you looking to launch? Tell me your goals and I will configure a tailored solution with itemized deliverables, timelines, and 30/70 payment terms.",
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      {/* Outer Dismiss Backing */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Slide-Over Drawer Container (Zen Smoked Glass & Twilight Ink) */}
      <div
        className="relative w-full sm:w-[500px] h-[92dvh] sm:h-[95dvh] sm:max-h-[850px] sm:mr-6 rounded-t-3xl sm:rounded-3xl bg-[#0d1117]/92 border border-white/10 flex flex-col overflow-hidden backdrop-blur-2xl transition-transform"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 1px 1px rgba(255,255,255,0.08) inset',
        }}
      >
        {/* 1. Header Bar: Studio Architecture & Minimalist Controls */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.015] shrink-0">
          <div className="flex items-center gap-3">
            {/* Geometric Studio Mark */}
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-200">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-semibold text-sm text-white tracking-tight">
                  KAIZEN ARCHITECT
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400">
                Bespoke Solutions & Quotations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpressQuoteOpen(!isExpressQuoteOpen)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all flex items-center gap-1 cursor-pointer ${
                isExpressQuoteOpen
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-semibold'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-neutral-300 hover:text-white'
              }`}
              title="Quick Express Quote to WhatsApp"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Quick Quote</span>
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Reset Chat"
              aria-label="Reset Chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Drawer"
              aria-label="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Studio Capacity Status Line */}
        <div className="px-5 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400 select-none shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-breath" />
            <span className="text-neutral-300">
              Studio capacity: <strong className="font-medium text-emerald-300">1 Client Slot Open for Nov</strong>
            </span>
          </div>
          <span className="text-neutral-400 hidden sm:inline text-[10px]">
            30% Advance · 24h Kickoff
          </span>
        </div>

        {/* 3. Express WhatsApp Quote Card (Collapsible) */}
        {isExpressQuoteOpen && (
          <div className="px-5 py-3.5 bg-[#121722]/95 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-mono font-medium text-white uppercase tracking-wider">
                  Express WhatsApp Quotation Handoff
                </span>
              </div>
              <button
                onClick={() => setIsExpressQuoteOpen(false)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSendExpressQuote} className="space-y-2">
              <input
                type="text"
                placeholder="Business Name (e.g. Apex Dental / Coffee Hub)"
                value={expressBusiness}
                onChange={(e) => setExpressBusiness(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 font-sans"
              />
              <input
                type="text"
                placeholder="Primary Need (e.g. WhatsApp order bot + admin dashboard)"
                value={expressNeed}
                onChange={(e) => setExpressNeed(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 font-sans"
              />
              <div className="flex gap-2">
                <select
                  value={expressPackage}
                  onChange={(e) => setExpressPackage(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-2 rounded-lg bg-[#0d1117] border border-white/10 text-neutral-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                >
                  <option value="Growth Engine Bundle (₹11,999)">Growth Engine (₹11,999)</option>
                  <option value="Shop & Cafe Bundle (₹6,999)">Shop & Cafe (₹6,999)</option>
                  <option value="Starter Bundle (₹4,999)">Starter Bundle (₹4,999)</option>
                  <option value="Custom Modular Solution">Custom Scope</option>
                </select>
                <button
                  type="submit"
                  disabled={!expressBusiness.trim() || !expressNeed.trim()}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-neutral-950 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  <span>Dispatch ↗</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 font-sans text-sm scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1.5`}
              >
                {/* Understated Role Marker */}
                <div className="flex items-center gap-1.5 px-1 text-[10px] font-mono tracking-wider uppercase text-neutral-300">
                  {isUser ? (
                    <span>Client</span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Kaizen Studio
                    </span>
                  )}
                </div>

                {/* Message Surface */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl max-w-[94%] leading-relaxed ${
                    isUser
                      ? 'bg-white/[0.08] text-white rounded-tr-sm border border-white/10'
                      : 'bg-white/[0.03] text-neutral-200 rounded-tl-sm border border-white/[0.08] shadow-sm'
                  }`}
                >
                  {/* Markdown Content Renderer */}
                  <div className="space-y-2 whitespace-pre-wrap break-words text-[13.5px]">
                    {formatMessageContent(msg.content)}
                  </div>

                  {/* Actions on Assistant Message */}
                  {!isUser && !msg.isStreaming && msg.content && (
                    <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
                      {(() => {
                        const isDealClosing =
                          msg.content.includes('OFFICIAL PROJECT BRIEF') ||
                          msg.content.toLowerCase().includes('ready to initiate') ||
                          msg.content.toLowerCase().includes('ready to proceed') ||
                          msg.content.toLowerCase().includes('lock in');
                        const waText = buildWhatsAppHandoffMessage(msg.content, messages);

                        return (
                          <a
                            href={getWhatsAppUrl(waText)}
                            onClick={(e) => handleWhatsAppInstantClick(e, waText)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all active:scale-95 cursor-pointer ${
                              isDealClosing
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold shadow-sm'
                                : 'bg-emerald-500/90 hover:bg-emerald-400 text-neutral-950 font-semibold'
                            }`}
                          >
                            <span>Discuss on WhatsApp</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        );
                      })()}

                      <button
                        onClick={() => handlePrintProposal(msg.content)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="Print / Save Official PDF Proposal"
                      >
                        <Printer className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Print Quote</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Scope</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Active Thought / Reasoning Indicator */}
          {activeThought && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-neutral-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-breath" />
              <span>Formulating solution...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 5. Quick Inquiry Chips */}
        <div className="px-4 py-2 bg-white/[0.015] border-t border-white/[0.06] overflow-x-auto scrollbar-none flex gap-2 shrink-0">
          {QUICK_INQUIRIES.map((qi, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qi.query)}
              disabled={isStreaming}
              className="shrink-0 px-3.5 py-1.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-xs font-mono text-neutral-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {qi.label}
            </button>
          ))}
        </div>

        {/* 6. Input Area */}
        <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-[#070a0f] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about pricing, packages, or describe your project..."
                rows={2}
                className="w-full resize-none rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans"
              />
            </div>

            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStreaming}
                className="h-[48px] px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-xs font-medium uppercase tracking-wider flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="h-[48px] px-4 rounded-xl bg-neutral-200 hover:bg-white disabled:bg-white/5 text-neutral-950 disabled:text-neutral-500 font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center transition-all active:scale-95 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed"
                title="Send inquiry"
                aria-label="Send inquiry"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Understated Commercial Trust Footnote */}
          <div className="mt-2.5 flex items-center justify-center gap-2.5 text-[10.5px] font-mono text-neutral-400 select-none">
            <span>30% Advance</span>
            <span>·</span>
            <span>70% on Approval</span>
            <span>·</span>
            <span>Full Source Code Ownership</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generates an executive, highly structured WhatsApp handoff dispatch message.
 */
function buildWhatsAppHandoffMessage(content: string, allMessages?: Message[]): string {
  if (!content) return '';

  let clientWanted = '';
  if (allMessages && allMessages.length > 0) {
    const userMsgs = allMessages
      .filter((m) => m.role === 'user')
      .map((m) => m.content.trim())
      .filter((text) => {
        const lower = text.toLowerCase();
        return !['ok', 'okay', 'ready', 'yes', "let's do it", 'lets do it', 'deal', 'lock in', 'i am ready', "i'm ready"].includes(lower);
      });

    if (userMsgs.length > 0) {
      clientWanted = userMsgs[0];
    }
  }

  // Check if there is an explicit copy-ready brief block
  const briefMatch = content.match(/🚀\s*OFFICIAL PROJECT BRIEF[\s\S]*?(?=```|$)/i);
  if (briefMatch) {
    const briefClean = briefMatch[0].trim();
    let intro = 'Hi Kaizen Team! I spoke with your Solutions Architect on your website and I am ready to initiate my project:\n\n';

    if (clientWanted && !briefClean.toLowerCase().includes('what you wanted') && !briefClean.toLowerCase().includes('what i wanted')) {
      intro += `🎯 What I Wanted & Needed:\n• ${clientWanted.slice(0, 220)}\n\n`;
    }

    return `${intro}${briefClean}\n\nI am ready to proceed! Please share the invoice & 30% advance link so we can secure the engineering queue!`;
  }

  // Parse package, what was liked, and pricing details
  const lines = content.split('\n');
  let selectedPackage = 'Custom Turnkey Solution';
  let advanceAmount = '';
  let balanceAmount = '';
  let turnaround = '';
  const featuresLiked: string[] = [];

  for (const line of lines) {
    const t = line.trim();
    const lower = t.toLowerCase();

    if (lower.includes('growth engine')) selectedPackage = 'Growth Engine Bundle (₹11,999)';
    else if (lower.includes('shop & cafe') || lower.includes('shop and cafe')) selectedPackage = 'Shop & Cafe Bundle (₹6,999)';
    else if (lower.includes('starter bundle')) selectedPackage = 'Starter Bundle (₹4,999)';

    if (t.includes('₹') && lower.includes('advance')) {
      advanceAmount = t.replace(/[\*\_\|]/g, '').trim();
    }
    if (t.includes('₹') && lower.includes('balance')) {
      balanceAmount = t.replace(/[\*\_\|]/g, '').trim();
    }
    if (lower.includes('turnaround') || lower.includes('business days')) {
      turnaround = t.replace(/[\*\_\|]/g, '').trim();
    }
    if (
      (t.startsWith('•') || t.startsWith('-') || t.startsWith('*')) &&
      (lower.includes('bot') ||
        lower.includes('dashboard') ||
        lower.includes('menu') ||
        lower.includes('portal') ||
        lower.includes('ownership') ||
        lower.includes('page') ||
        lower.includes('app') ||
        lower.includes('support'))
    ) {
      if (featuresLiked.length < 3) {
        featuresLiked.push(t.replace(/^[\*\-•]\s*/, '').replace(/[\*\_]/g, '').trim());
      }
    }
  }

  let msg = `Hi Kaizen Team! I reviewed the proposal from your Solutions Architect on your website and I would like to move forward:\n\n`;

  if (clientWanted) {
    msg += `🎯 What I Wanted & Needed:\n• ${clientWanted.slice(0, 220)}\n\n`;
  } else {
    msg += `🎯 What I Wanted & Needed:\n• Turnkey software solution tailored for my business with transparent 30/70 payment terms\n\n`;
  }

  if (featuresLiked.length > 0) {
    msg += `⭐ What I Liked in Your Solution:\n${featuresLiked.map((f) => `• ${f}`).join('\n')}\n\n`;
  } else {
    msg += `⭐ What I Liked in Your Solution:\n• 100% full source code ownership, zero hidden fees, and rapid turnaround\n\n`;
  }

  msg += `💰 Agreed Package & Commercials:\n• Selected Package: ${selectedPackage}\n`;
  if (advanceAmount) msg += `• 30% Advance: ${advanceAmount}\n`;
  if (balanceAmount) msg += `• 70% Balance: ${balanceAmount}\n`;
  if (turnaround) msg += `• Timeline: ${turnaround}\n`;

  msg += `\nPlease share the official invoice and 30% advance link so we can initiate development immediately!`;
  return msg;
}

/**
 * Editorial formatting helper for markdown tokens in assistant proposal memos
 */
function formatMessageContent(content: string) {
  if (!content) return null;

  const cleaned = content.replace(/\u202f/g, ' ').replace(/<br\s*\/?>/gi, '\n');
  const rawLines = cleaned.split('\n');

  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  let inCodeBlock = false;
  let codeLines: string[] = [];

  const flushTable = (tableKey: string) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const bodyRows = tableRows.slice(1);

    elements.push(
      <div key={tableKey} className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              {headerRow.map((col, cIdx) => (
                <th key={cIdx} className="px-3 py-2 font-mono font-medium text-neutral-300 tracking-wider uppercase text-[11px] whitespace-nowrap">
                  {col.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] font-sans">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2 text-neutral-300">
                    {renderInlineMarkdown(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  const flushCodeBlock = (codeKey: string) => {
    if (codeLines.length === 0) return;
    const blockContent = codeLines.join('\n');
    const isBrief = blockContent.includes('OFFICIAL PROJECT BRIEF');
    const isDiagram = blockContent.includes('┌') || blockContent.includes('──►') || blockContent.includes('│');

    elements.push(
      <div
        key={codeKey}
        className={`my-3 p-4 rounded-xl overflow-x-auto ${
          isBrief
            ? 'bg-emerald-950/20 border border-emerald-500/30'
            : isDiagram
            ? 'bg-black/60 border border-white/10'
            : 'bg-black/50 border border-white/10'
        }`}
      >
        {isDiagram && (
          <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-white/10 text-[10px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>System Architecture & Workflow Diagram</span>
          </div>
        )}
        <pre className={`font-mono text-xs leading-relaxed whitespace-pre select-text ${isBrief ? 'text-emerald-300 font-medium' : 'text-neutral-300'}`}>
          {blockContent}
        </pre>
      </div>
    );
    codeLines = [];
    inCodeBlock = false;
  };

  rawLines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Code fences
    if (trimmed.startsWith('```')) {
      if (inTable) flushTable(`table-${idx}`);
      if (inCodeBlock) {
        flushCodeBlock(`code-${idx}`);
      } else {
        inCodeBlock = true;
        codeLines = [];
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    // Markdown tables
    if (trimmed.startsWith('|')) {
      const endsWithPipe = trimmed.endsWith('|');
      const inner = endsWithPipe ? trimmed.slice(1, -1) : trimmed.slice(1);
      if (/^[\s\-:|]+$/.test(inner)) {
        inTable = true;
        return;
      }
      const cols = inner.split('|');
      tableRows.push(cols);
      inTable = true;
      return;
    } else if (inTable) {
      flushTable(`table-${idx}`);
    }

    if (!trimmed) {
      elements.push(<div key={`empty-${idx}`} className="h-2" />);
      return;
    }

    // Headings
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={idx} className="font-sans font-semibold text-white text-base mt-4 mb-1.5 pb-1 border-b border-white/[0.08]">
          {trimmed.replace(/^#+\s*/, '')}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={idx} className="font-sans font-medium text-emerald-300 text-sm mt-3 mb-1">
          {trimmed.replace('### ', '')}
        </h4>
      );
      return;
    }

    if (trimmed === '---' || trimmed === '***') {
      elements.push(<div key={idx} className="my-2.5 border-t border-white/[0.08]" />);
      return;
    }

    // Bullet points
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const bulletContent = trimmed.replace(/^[\*\-•]\s*/, '');
      elements.push(
        <div key={idx} className="flex items-start gap-2 pl-1 my-1 text-neutral-300">
          <span className="text-emerald-400 text-xs leading-none mt-1.5 select-none">●</span>
          <div className="flex-1">{renderInlineMarkdown(bulletContent)}</div>
        </div>
      );
      return;
    }

    // Numbered lists
    if (/^\d+\.\s+/.test(trimmed)) {
      const numContent = trimmed.replace(/^\d+\.\s+/, '');
      const numMatch = trimmed.match(/^(\d+)\./);
      const num = numMatch ? numMatch[1] : '1';
      elements.push(
        <div key={idx} className="flex items-start gap-2 pl-1 my-1 text-neutral-300">
          <span className="text-neutral-400 font-mono text-xs font-semibold leading-none mt-1 select-none">{num}.</span>
          <div className="flex-1">{renderInlineMarkdown(numContent)}</div>
        </div>
      );
      return;
    }

    // Paragraph
    elements.push(
      <div key={idx} className="my-0.5 text-neutral-300 leading-relaxed font-sans">
        {renderInlineMarkdown(trimmed)}
      </div>
    );
  });

  if (inTable) flushTable('table-final');
  if (inCodeBlock) flushCodeBlock('code-final');

  return elements;
}

function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith('**') && bPart.endsWith('**')) {
      return (
        <strong key={bIdx} className="font-semibold text-white">
          {bPart.slice(2, -2)}
        </strong>
      );
    }
    return bPart;
  });
}
