import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertTriangle className="w-16 h-16 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-[#003366] text-center mb-4">
              Ups! Nešto je pošlo naopako
            </h1>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">
              Došlo je do neočekivane greške. Ne brinite, vaši podaci su bezbedni.
              Možete pokušati ponovo ili se vratiti na početnu stranicu.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <summary className="cursor-pointer font-semibold text-red-900 mb-2">
                  Detalji greške (samo u dev modu)
                </summary>
                <div className="text-sm text-red-800 font-mono overflow-auto">
                  <p className="font-bold mb-2">{this.state.error.toString()}</p>
                  <pre className="text-xs whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-full font-semibold shadow-lg hover:bg-[#E55A28] transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5" />
                Pokušaj ponovo
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#003366] text-[#003366] rounded-full font-semibold hover:bg-[#003366] hover:text-white transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                Početna stranica
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Ako problem i dalje postoji, kontaktirajte nas na:{' '}
                <a
                  href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'kontakt@naucisprski.com'}`}
                  className="text-[#FF6B35] hover:underline font-semibold"
                >
                  {import.meta.env.VITE_CONTACT_EMAIL || 'kontakt@naucisprski.com'}
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
