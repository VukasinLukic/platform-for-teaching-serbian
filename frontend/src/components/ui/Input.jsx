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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <LeftIcon className="w-5 h-5" />
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl border-2
              ${LeftIcon ? 'pl-12' : ''}
              ${RightIcon ? 'pr-12' : ''}
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-200 focus:border-[#BFECC9] focus:ring-[#BFECC9]/20'
              }
              focus:ring-4 focus:outline-none
              transition-all duration-200
              placeholder:text-gray-400
              disabled:bg-gray-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />

          {RightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <RightIcon className="w-5 h-5" />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
