import React from 'react';

interface SectionProps {
  id?: string;
  /** Small uppercase label above the title */
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  align?: 'center' | 'left';
  /** Extra classes for the outer <section> (e.g. bg utilities) */
  className?: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  id,
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
  children,
}) => {
  const isCenter = align === 'center';

  return (
    <section id={id} className={['py-20 sm:py-24 lg:py-28', className].join(' ')}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || description) && (
          <div className={isCenter ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-400">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
                {description}
              </p>
            )}
          </div>
        )}
        <div className={eyebrow || title || description ? 'mt-12 sm:mt-16' : ''}>{children}</div>
      </div>
    </section>
  );
};
