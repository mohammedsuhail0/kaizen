import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { RotateCcw, MessageSquare } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Kaizen Agency application:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#05070f] text-slate-100 flex items-center justify-center p-6 selection:bg-cyan-400 selection:text-black">
          <div className="max-w-md w-full border border-white/20 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-mono tracking-widest text-cyan-300 uppercase">
              <span className="w-2 h-2 bg-rose-400 rotate-45 shrink-0" />
              <span>SYSTEM RECOVERY</span>
            </div>

            <h1 className="text-2xl font-serif-luxury font-medium text-white">
              Something went unexpected.
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
              The application encountered a runtime issue. You can reload the page or connect directly with our engineering team on WhatsApp.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <a
                href="https://api.whatsapp.com/send/?phone=916301633463&text=Hi!%20I%20was%20browsing%20your%20website%20and%20noticed%20an%20issue,%20just%20wanted%20to%20let%20you%20know."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 border border-white/20 hover:border-emerald-400 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
