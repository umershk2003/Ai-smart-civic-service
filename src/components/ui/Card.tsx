import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enables a soft lift + border tint on hover */
  hover?: boolean;
  /** Padding scale: none | sm (p-5) | md (p-6) | lg (p-8) */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Render as a dark surface (used on dark bands) */
  dark?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-5',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  hover = false,
  padding = 'md',
  dark = false,
  className = '',
  children,
  ...rest
}) => {
  const base = dark
    ? 'bg-slate-900/70 ring-1 ring-inset ring-white/10'
    : 'bg-white ring-1 ring-inset ring-slate-200';
  const hoverClasses = hover
    ? dark
      ? 'transition-all duration-300 hover:-translate-y-1 hover:ring-white/20 hover:shadow-popover'
      : 'transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:ring-slate-300'
    : '';

  return (
    <div className={['rounded-2xl shadow-card', base, hoverClasses, paddingClasses[padding], className].join(' ')} {...rest}>
      {children}
    </div>
  );
};
