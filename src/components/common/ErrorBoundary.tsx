import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, ShieldAlert, LifeBuoy, Terminal } from 'lucide-react';
import { logger } from '../../services/loggerService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    logger.log('ERROR', `React ErrorBoundary Caught: ${error.message}`, 'ErrorBoundary', {
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-400 tracking-wider uppercase">Runtime Shield Triggered</span>
                <h2 className="text-2xl font-black text-white tracking-tight">System Exception Intercepted</h2>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Teethly OS isolated a component rendering issue to preserve patient data integrity and session stability.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-rose-300 overflow-x-auto">
                <p className="font-bold text-white mb-1">Error Message:</p>
                <code>{this.state.error.toString()}</code>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1d5bd8] hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>

              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
              >
                Try Component Recovery
              </button>

              <button
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                {this.state.showDetails ? 'Hide Details' : 'View Stack'}
              </button>
            </div>

            {this.state.showDetails && this.state.errorInfo && (
              <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto max-h-48 leading-relaxed">
                <p className="text-slate-200 font-bold mb-1">Component Stack Trace:</p>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
