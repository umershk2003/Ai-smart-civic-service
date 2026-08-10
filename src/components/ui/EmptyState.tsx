import React from 'react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-14 text-center',
        className,
      ].join(' ')}
    >
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 ring-1 ring-inset ring-slate-700">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <h3 className="mt-4 text-sm font-bold text-slate-200">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
