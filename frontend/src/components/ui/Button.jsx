import { forwardRef } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

const variants = {
  // Primary - Orange/Red gradient button (main CTA)
  primary: 'bg-[#FF6B35] text-white hover:bg-[#E55A28] shadow-lg hover:shadow-xl',

  // Secondary - Dark blue button
  secondary: 'bg-[#003366] text-white hover:bg-[#002244] shadow-lg hover:shadow-xl',

  // Outline - Transparent with border
  outline: 'border-2 border-[#003366] text-[#003366] bg-transparent hover:bg-[#003366] hover:text-white',

  // Outline white - For dark backgrounds
  outlineWhite: 'border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#003366]',

  // Green - Using primary color
  green: 'bg-[#BFECC9] text-[#003366] hover:bg-[#A8DCBA] shadow-lg hover:shadow-xl',

  // Ghost - Minimal button
  ghost: 'text-[#003366] hover:bg-[#BFECC9]/20',

  // Danger
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      showArrow = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          font-semibold rounded-full transition-all duration-300
          inline-flex items-center justify-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:-translate-y-1 active:translate-y-0
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {children}
        {showArrow && !loading && <ArrowRight className="w-5 h-5" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
