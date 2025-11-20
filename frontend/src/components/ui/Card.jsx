const cardVariants = {
  default: 'bg-white border-2 border-gray-100 shadow-xl',
  elevated: 'bg-white border-2 border-gray-100 shadow-2xl',
  bordered: 'bg-white border-2 border-[#BFECC9]/30',
  gradient: 'bg-gradient-to-br from-[#BFECC9]/10 to-white border-2 border-[#BFECC9]/20',
  glass: 'bg-white/80 backdrop-blur-xl border-2 border-white/40 shadow-xl',
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
      className={`
        rounded-3xl overflow-hidden
        ${cardVariants[variant]}
        ${hover ? 'hover:shadow-2xl hover:-translate-y-2 transition-all duration-300' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 border-b-2 border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-6 border-t-2 border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
}
