import React from 'react';

/**
 * Spinner/Loader Component
 * Design: brand-red spinner
 * Usage: <Spinner size="sm|md|lg" text="Loading..." />
 */
const Spinner = ({ size = 'md', text = 'Учитава се...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const spinnerClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div
        className={`${spinnerClass} border-brand/15 border-t-brand rounded-full animate-spin`}
        role="status"
        aria-label={text || 'Учитава се'}
      />
      {text && (
        <p className="text-ink-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );
};

// Fullscreen Spinner Variant
export const FullScreenSpinner = ({ text = 'Учитава се...' }) => {
  return (
    <div className="fixed inset-0 bg-paper/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-lift p-8">
        <Spinner size="lg" text={text} />
      </div>
    </div>
  );
};

// Inline Spinner Variant (for buttons)
export const InlineSpinner = ({ className = '' }) => {
  return (
    <div
      className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Учитава се"
    />
  );
};

export default Spinner;
