import { forwardRef } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

/**
 * The single button primitive.
 *
 * Renders a <button> by default. Pass `as={Link}` (react-router) with `to`, or
 * `as="a"` with `href`, to get a link that looks like a button — never nest a
 * <button> inside a link.
 */
export const buttonVariants = {
  primary: 'bg-brand text-white shadow-sm hover:bg-brand-700 hover:shadow-brand active:bg-brand-800',
  secondary: 'bg-ink text-white shadow-sm hover:bg-ink-800 active:bg-black',
  outline: 'border-2 border-brand text-brand bg-white/0 hover:bg-brand-50 active:bg-brand-100',
  outlineWhite: 'border-2 border-white/80 text-white hover:bg-white hover:text-brand',
  gold: 'bg-gold text-ink shadow-sm hover:bg-gold-500 active:bg-gold-600',
  ghost: 'text-ink hover:bg-ink-50 active:bg-ink-100',
  subtle: 'bg-white text-ink border border-ink-100 shadow-sm hover:border-ink-200 hover:bg-paper-50',
  danger: 'bg-danger text-white shadow-sm hover:bg-danger-700',
  link: 'text-brand underline-offset-4 hover:underline hover:text-brand-700 !px-0 !py-0 !h-auto',
};

export const buttonSizes = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-[0.95rem] gap-2',
  lg: 'min-h-[3.25rem] px-7 text-base gap-2',
  xl: 'min-h-[3.75rem] px-9 text-lg gap-2.5',
  icon: 'h-11 w-11 p-0',
};

export function buttonClasses({ variant = 'primary', size = 'md', fullWidth = false, className = '' } = {}) {
  return [
    'inline-flex items-center justify-center rounded-xl font-semibold leading-none select-none',
    'transition-[background-color,color,box-shadow,border-color,transform] duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none',
    'motion-safe:active:translate-y-px',
    buttonVariants[variant] || buttonVariants.primary,
    buttonSizes[size] || buttonSizes.md,
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');
}

const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    showArrow = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    type,
    ...props
  },
  ref
) {
  const isButton = Component === 'button';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <Component
      ref={ref}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...(isButton
        ? { type: type || 'button', disabled: disabled || loading }
        : { 'aria-disabled': disabled || loading || undefined })}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSize} animate-spin`} aria-hidden="true" />
      ) : (
        LeftIcon && <LeftIcon className={iconSize} aria-hidden="true" />
      )}
      {children}
      {!loading && RightIcon && <RightIcon className={iconSize} aria-hidden="true" />}
      {showArrow && !loading && !RightIcon && (
        <ArrowRight className={`${iconSize} transition-transform motion-safe:group-hover:translate-x-0.5`} aria-hidden="true" />
      )}
    </Component>
  );
});

export default Button;
