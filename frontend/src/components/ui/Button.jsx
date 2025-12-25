import { forwardRef } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

const variants = {
  // Primary - Срце црвена (главни CTA)
  primary: 'bg-[#D62828] text-white hover:bg-[#B91F1F] shadow-lg hover:shadow-xl',

  // Secondary - Тамно сива
  secondary: 'bg-[#1A1A1A] text-white hover:bg-black shadow-lg hover:shadow-xl',

  // Outline - Прозирна са ивицом
  outline: 'border-2 border-[#D62828] text-[#D62828] bg-transparent hover:bg-[#D62828] hover:text-white',

  // Outline white - За тамне позадине
  outlineWhite: 'border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#D62828]',

  // Gold - Топло златна
  gold: 'bg-[#F2C94C] text-[#1A1A1A] hover:bg-[#E0B739] shadow-lg hover:shadow-xl',

  // Ghost - Минимални дугме
  ghost: 'text-[#1A1A1A] hover:bg-[#F7F7F7]',

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
