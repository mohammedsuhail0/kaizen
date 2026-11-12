import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowUpRight,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  FileText,
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

interface AgenticChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const QUICK_PROMPTS = [
  { label: '🚀 Lock In Order / Deal', query: "I'm ready to proceed with the Growth Engine Bundle (₹11,999) for my WhatsApp order bot and dashboard. What are the kickoff steps and advance payment?" },
  { label: '💬 WhatsApp Bot + Dashboard', query: "I have a website and need an automated WhatsApp order bot and an admin dashboard. How much will it cost, monthly fees, and is the first year free?" },
  { label: '☕ Cafe & Bakery Bundle', query: 'What package do you recommend for a cafe and bakery with QR menu and WhatsApp ordering?' },
  { label: '🏥 Clinic Appointment Portal', query: 'I run a dental / doctor clinic. What are the deliverables and pricing for an online appointment booking system?' },
  { label: '⚡ Starter Package Breakdown', query: 'What is included in the ₹4,999 Starter Bundle, turnaround time, and payment terms?' },
  { label: '🏋️ Gym & Fitness Portal', query: 'What system do you have for a gym with membership tracking and fee dues?' },
];

export const AgenticChatModal: React.FC<AgenticChatModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "**Welcome to Kaizen Solutions.**\n\nI am your **AI Technical Sales Architect**, directly integrated with our official engineering and pricing catalog. \n\nAsk me any question about our services, turnarounds, and pricing, or tell me about your business (cafe, clinic, gym, salon, startup) and I will configure a complete, transparent turnkey package with exact 30/70 payment terms for you.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeThought, setActiveThought] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      // Build conversation history payload
      const historyPayload = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      let response: Response | null = null;

      // 1. First attempt: call Vercel Serverless Endpoint /api/chat (HTTPS, same-origin)
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

      // 2. Localhost fallback: if developing locally on port 8000
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

      // 3. Direct Groq API fallback (guaranteed to work from any browser worldwide via CORS)
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

        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: groqMessages,
            temperature: 0.1,
            stream: true,
            max_tokens: 1500,
          }),
          signal: abortController.signal,
        });
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

            // Handle standard Groq delta chunks
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end bg-black/70 backdrop-blur-md transition-opacity duration-300">
      {/* Outer Dismiss Backing */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Slide-Over Drawer Container */}
      <div
        className="relative w-full sm:w-[500px] h-[92dvh] sm:h-[95dvh] sm:max-h-[850px] sm:mr-6 rounded-t-3xl sm:rounded-3xl bg-[#090e17]/95 border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_35px_rgba(0,245,255,0.08)] flex flex-col overflow-hidden backdrop-blur-2xl"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 1px 1px rgba(255,255,255,0.12) inset',
        }}
      >
        {/* 1. Header Bar with Architectural Badges & Close Button */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,245,255,0.2)]">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-white tracking-tight">
                  AI Solutions Architect
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Instant Pricing & Turnkey Solutions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Reset Chat"
              aria-label="Reset Chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Chat"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 font-sans text-sm scrollbar-thin scrollbar-thumb-white/15">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1.5`}
              >
                {/* Role Marker */}
                <div className="flex items-center gap-1.5 px-1 text-[11px] font-mono text-slate-400">
                  {isUser ? (
                    <>
                      <span>You</span>
                      <User className="w-3 h-3 text-cyan-400" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-emerald-400" />
                      <span>Sales Architect</span>
                    </>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl max-w-[92%] leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none shadow-[0_8px_20px_-6px_rgba(0,180,255,0.4)]'
                      : 'bg-[#0f172a]/90 text-slate-100 rounded-tl-none border border-white/10 shadow-lg'
                  }`}
                >
                  {/* Markdown-style Simple Content Renderer */}
                  <div className="space-y-2 whitespace-pre-wrap break-words text-[13.5px]">
                    {formatMessageContent(msg.content)}
                  </div>

                  {/* Assistant Actions: Send to WhatsApp & Copy */}
                  {!isUser && !msg.isStreaming && msg.content && (
                    <div className="mt-3.5 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-2">
                      {(() => {
                        const isDealClosing =
                          msg.content.includes('OFFICIAL PROJECT BRIEF') ||
                          msg.content.toLowerCase().includes('ready to initiate') ||
                          msg.content.toLowerCase().includes('ready to proceed') ||
                          msg.content.toLowerCase().includes('lock in');
                        const waText = buildWhatsAppHandoffMessage(msg.content);

                        return (
                          <a
                            href={getWhatsAppUrl(waText)}
                            onClick={(e) => handleWhatsAppInstantClick(e, waText)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-transform active:scale-95 cursor-pointer ${
                              isDealClosing
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.45)]'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                            }`}
                          >
                            {isDealClosing ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                                <span>⚡ Lock In Project on WhatsApp</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                <span>Discuss on WhatsApp</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </a>
                        );
                      })()}

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
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
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span>Thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Quick Prompt Chips Bar */}
        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 overflow-x-auto scrollbar-none flex gap-2 shrink-0">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.query)}
              disabled={isStreaming}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-cyan-400/40 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* 4. Input Area */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#070b12] shrink-0">
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
                placeholder="Ask about pricing, packages, or describe your business..."
                rows={2}
                className="w-full resize-none rounded-xl bg-white/[0.05] border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/40 transition-all font-sans"
              />
            </div>

            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStreaming}
                className="h-[52px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="h-[52px] px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10 text-slate-950 disabled:text-slate-500 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all active:scale-95 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,245,255,0.25)] disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Footer Commercial Note */}
          <div className="mt-2 text-center text-[10px] font-mono text-slate-400 flex items-center justify-center gap-3">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              30% Advance • 70% on Approval
            </span>
            <span>•</span>
            <span>Direct Engineer Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generates an executive, highly structured WhatsApp handoff dispatch message.
 * Extracts project briefs, pricing agreements, or consultation recaps into clean,
 * copy-ready bullet points without raw markdown pipe syntax.
 */
function buildWhatsAppHandoffMessage(content: string): string {
  if (!content) return '';

  // 1. Check if there is an explicit copy-ready brief block
  const briefMatch = content.match(/🚀\s*OFFICIAL PROJECT BRIEF[\s\S]*?(?=```|$)/i);
  if (briefMatch) {
    const briefClean = briefMatch[0].trim();
    return `Hi Kaizen Team! I spoke with your AI Technical Consultant on your website and I am ready to initiate my project:\n\n${briefClean}\n\nPlease share the invoice & 30% advance link so we can secure the engineering queue!`;
  }

  // 2. Check for key pricing or bundle mentions
  const lines = content.split('\n');
  const summaryBullets: string[] = [];

  for (const line of lines) {
    const t = line.trim();
    if (
      (t.includes('₹') || t.toLowerCase().includes('bundle') || t.toLowerCase().includes('advance') || t.toLowerCase().includes('turnaround')) &&
      !t.startsWith('|') &&
      !t.startsWith('#')
    ) {
      summaryBullets.push(t.replace(/[\*\#]/g, '').trim());
      if (summaryBullets.length >= 4) break;
    }
  }

  if (summaryBullets.length > 0) {
    return `Hi Kaizen Team! I received this proposal from your AI Consultant on your website:\n\n${summaryBullets.join('\n')}\n\nI would like to proceed with this scope. Could you share the next steps and 30% advance details?`;
  }

  // 3. Fallback clean snippet
  const cleanSnippet = content
    .replace(/\[Source:[^\]]+\]/g, '')
    .replace(/\|[^\n]+\|/g, '')
    .replace(/[\#\*\_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);

  return `Hi Kaizen Team! I was chatting with your AI Consultant regarding:\n"${cleanSnippet}..."\n\nCould we connect to discuss finalizing the project scope and kickoff?`;
}

/**
 * Production formatting helper for markdown tokens in streaming assistant bubbles
 * Supports: code fences (```) for diagrams and project slips, bold (**), headers (#, ##, ###),
 * bullet lists (- or *), numbered lists, citations ([Source: ...]), clean responsive glass tables.
 */
function formatMessageContent(content: string) {
  if (!content) return null;

  // Clean unicode thin spaces and convert <br> tags to standard newlines
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
      <div key={tableKey} className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] shadow-inner">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.05]">
              {headerRow.map((col, cIdx) => (
                <th key={cIdx} className="px-3 py-2 font-display font-semibold text-cyan-300 tracking-wider uppercase text-[11px]">
                  {col.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2 text-slate-200">
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

    elements.push(
      <div
        key={codeKey}
        className={`my-3 p-3.5 rounded-xl overflow-x-auto shadow-inner ${
          isBrief
            ? 'bg-gradient-to-br from-emerald-950/40 to-slate-950/80 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
            : 'bg-black/70 border border-cyan-500/25'
        }`}
      >
        <pre className={`font-mono text-xs leading-relaxed whitespace-pre select-text ${isBrief ? 'text-emerald-300 font-medium' : 'text-cyan-300/90'}`}>
          {blockContent}
        </pre>
      </div>
    );
    codeLines = [];
    inCodeBlock = false;
  };

  rawLines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check for code fences (```)
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

    // Check if this line is part of a markdown table (starts and ends with |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // Ignore separator rows e.g. |---|---|
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        inTable = true;
        return;
      }
      const cols = trimmed.slice(1, -1).split('|');
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

    // Heading 1 & 2
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={idx} className="font-display font-bold text-white text-base mt-4 mb-1.5 pb-1 border-b border-white/10">
          {trimmed.replace(/^#+\s*/, '')}
        </h3>
      );
      return;
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={idx} className="font-display font-semibold text-cyan-300 text-sm mt-3 mb-1">
          {trimmed.replace('### ', '')}
        </h4>
      );
      return;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<div key={idx} className="my-2.5 border-t border-white/10" />);
      return;
    }

    // Bullet points
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const bulletContent = trimmed.replace(/^[\*\-•]\s*/, '');
      elements.push(
        <div key={idx} className="flex items-start gap-2 pl-1.5 my-1 text-slate-200">
          <span className="text-cyan-400 text-sm leading-none mt-1 select-none">•</span>
          <div className="flex-1">{renderInlineMarkdown(bulletContent)}</div>
        </div>
      );
      return;
    }

    // Numbered lists e.g. 1. 2.
    if (/^\d+\.\s+/.test(trimmed)) {
      const numContent = trimmed.replace(/^\d+\.\s+/, '');
      const numMatch = trimmed.match(/^(\d+)\./);
      const num = numMatch ? numMatch[1] : '1';
      elements.push(
        <div key={idx} className="flex items-start gap-2 pl-1.5 my-1 text-slate-200">
          <span className="text-cyan-400 font-mono text-xs font-bold leading-none mt-1 select-none">{num}.</span>
          <div className="flex-1">{renderInlineMarkdown(numContent)}</div>
        </div>
      );
      return;
    }

    // Default paragraph
    elements.push(
      <div key={idx} className="my-0.5 text-slate-200 leading-relaxed">
        {renderInlineMarkdown(trimmed)}
      </div>
    );
  });

  if (inTable) {
    flushTable('table-final');
  }
  if (inCodeBlock) {
    flushCodeBlock('code-final');
  }

  return elements;
}

/**
 * Render inline markdown elements: bold (**), inline code, citations
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const citationRegex = /(\[Source:[^\]]+\]|【Source:[^】]+】)/g;
  const parts = text.split(citationRegex);

  return parts.map((part, pIdx) => {
    if (citationRegex.test(part)) {
      return (
        <span
          key={pIdx}
          className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded text-[10.5px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium select-none"
          title={part}
        >
          <FileText className="w-2.5 h-2.5 text-cyan-400" />
          Verified Source
        </span>
      );
    }

    // Format bold markdown (**text**)
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
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
  });
}
