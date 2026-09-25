import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/ui/Toast'
import { IS_LATIN } from './seo/script'
import { startLatinMode } from './seo/latinMode'

// Latin-script mirror (/lat/...): transliterate the rendered DOM.
if (IS_LATIN) startLatinMode()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>,
)
