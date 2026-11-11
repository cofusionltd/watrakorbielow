import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Phone } from 'lucide-react';

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
    console.error('Watra Korbielów UI Error Boundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/home';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9F8F6] text-[#222222] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D4A373]/15 flex items-center justify-center text-[#D4A373]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-bold text-[#1E3A2B]">
                Przepraszamy, coś poszło nie tak
              </h1>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Wystąpił nieoczekiwany problem podczas wyświetlania strony. Nasz zespół techniczny został powiadomiony.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Odśwież stronę</span>
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = '#/home';
                }}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Strona Główna</span>
              </button>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-center space-x-2 text-xs text-neutral-500">
              <Phone className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Recepcja: <a href="tel:+48511660511" className="font-bold text-[#1E3A2B] hover:underline">+48 511 660 511</a></span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
