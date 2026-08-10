import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string | null;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  hint,
  id,
  required,
  className = '',
  ...rest
}) => {
  const autoId = useId();
  const inputId = id || autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
      >
        {label}
        {required && <span className="ml-0.5 text-primary-600">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            'h-11 w-full rounded-xl border-0 bg-white text-sm text-slate-900 shadow-sm ring-1 ring-inset transition-shadow',
            'placeholder:text-slate-400 focus:ring-2',
            icon ? 'pl-10 pr-3.5' : 'px-3.5',
            error
              ? 'ring-red-300 focus:ring-red-500'
              : 'ring-slate-300 focus:ring-primary-500',
            className,
          ].join(' ')}
          {...rest}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
