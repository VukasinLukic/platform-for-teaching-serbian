import { Component } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import { clearChunkRetryFlags, isChunkLoadError } from '../lazyWithRetry';

/**
 * Error Boundary
 * Catches render errors in the tree below and shows a friendly screen instead of a
 * white page. Chunk load errors (stale tab after a deploy) get a dedicated message.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, componentStack: '' };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ componentStack: errorInfo?.componentStack || '' });
  }

  handleReload = () => {
    clearChunkRetryFlags();
    window.location.reload();
  };

  handleGoHome = () => {
    clearChunkRetryFlags();
    window.location.assign('/');
  };

  render() {
    const { error, componentStack } = this.state;
    if (!error) return this.props.children;

    const isUpdate = isChunkLoadError(error);
    const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'profesorka.marinalukic@gmail.com';

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-white flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 max-w-lg w-full text-center">
          <img
            src="/mascot/alano-reading.webp"
            alt=""
            width="160"
            height="160"
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto mb-4"
          />

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3">
            {isUpdate ? 'Сајт је управо ажуриран' : 'Упс, нешто је пошло наопако'}
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {isUpdate
              ? 'Објавили смо нову верзију платформе. Освежи страницу да би учитао најновију верзију — твој налог и напредак су сачувани.'
              : 'Дошло је до неочекиване грешке. Твоји подаци су безбедни. Покушај да освежиш страницу или се врати на почетну.'}
          </p>

          {import.meta.env.DEV && (
            <details className="mb-6 text-left p-4 bg-red-50 border border-red-200 rounded-xl">
              <summary className="cursor-pointer font-semibold text-red-900">Детаљи грешке (само у развоју)</summary>
              <p className="mt-2 text-sm font-mono text-red-800 break-words">{String(error)}</p>
              <pre className="mt-2 text-xs whitespace-pre-wrap text-red-800">{componentStack}</pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D62828] text-white rounded-full font-bold shadow-md hover:bg-[#B91F1F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D62828]/30 transition-colors"
            >
              <RefreshCw className="w-5 h-5" aria-hidden="true" />
              Освежи страницу
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-[#1A1A1A] rounded-full font-bold hover:border-[#1A1A1A] focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-300 transition-colors"
            >
              <Home className="w-5 h-5" aria-hidden="true" />
              Почетна страница
            </button>
          </div>

          <p className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
            Ако се проблем понавља, пиши нам на{' '}
            <a href={`mailto:${contactEmail}`} className="text-[#D62828] font-semibold hover:underline break-all">
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
