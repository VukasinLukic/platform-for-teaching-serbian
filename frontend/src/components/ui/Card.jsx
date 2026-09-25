/**
 * Card surface. Use by role: `default` for content blocks, `elevated` for
 * featured items, `muted` for secondary info, `outline` for lists/forms.
 */
const cardVariants = {
  default: 'bg-white border border-ink-100 shadow-card',
  elevated: 'bg-white border border-ink-100 shadow-lift',
  bordered: 'bg-white border border-ink-100',
  outline: 'bg-white border border-ink-100',
  muted: 'bg-paper-100 border border-paper-300/60',
  gradient: 'bg-gradient-to-br from-paper-50 to-white border border-ink-100 shadow-card',
  glass: 'bg-white/85 backdrop-blur-xl border border-white/60 shadow-card',
};

export default function Card({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${cardVariants[variant] || cardVariants.default} ${
        hover ? 'transition-[box-shadow,transform] duration-300 hover:shadow-lift motion-safe:hover:-translate-y-1' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 border-b border-ink-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`p-6 sm:p-8 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-6 border-t border-ink-100 ${className}`} {...props}>
      {children}
    </div>
  );
}
