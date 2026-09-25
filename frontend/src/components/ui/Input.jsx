import { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      required = false,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-sm font-semibold text-ink mb-2">
            {label} {required && <span className="text-brand" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
              <LeftIcon className="w-5 h-5" />
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full h-12 px-4 rounded-xl border bg-white text-ink
              ${LeftIcon ? 'pl-12' : ''}
              ${RightIcon ? 'pr-12' : ''}
              ${error
                ? 'border-danger-500 focus:border-danger focus:ring-danger/15'
                : 'border-ink-200 hover:border-ink-300 focus:border-brand focus:ring-brand/15'
              }
              focus:ring-4 focus:outline-none
              transition-all duration-200
              placeholder:text-ink-400
              disabled:bg-surface disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />

          {RightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400">
              <RightIcon className="w-5 h-5" />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-danger" role="alert">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-xs text-ink-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
