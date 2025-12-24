import React from 'react';

/**
 * Spinner/Loader Component
 * Design: Mint green spinner following the Nauči Srpski brand
 * Usage: <Spinner size="sm|md|lg" text="Loading..." />
 */
const Spinner = ({ size = 'md', text = 'Učitavanje...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinnerClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div
        className={`${spinnerClass} border-[#BFECC9] border-t-[#003366] rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Fullscreen Spinner Variant
export const FullScreenSpinner = ({ text = 'Učitavanje...' }) => {
  return (
    <div className="fixed inset-0 bg-[#F5F3EF]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
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
      aria-label="Loading"
    />
  );
};

export default Spinner;
