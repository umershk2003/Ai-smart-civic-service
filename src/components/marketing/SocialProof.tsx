import React from 'react';

const DEPARTMENTS = [
  'Department of Public Works',
  'Water & Sanitation Authority',
  'Urban Drainage Division',
  'Electrical Engineering & Utilities',
  'Parks & Horticulture',
  'Public Safety & Emergency Ops',
];

export const SocialProof: React.FC = () => {
  return (
    <section aria-label="Trusted by municipal departments" className="border-y border-slate-100 bg-slate-50/60 py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Powering operations for municipal departments
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {DEPARTMENTS.map((dept) => (
            <li
              key={dept}
              className="text-sm font-semibold tracking-tight text-slate-400 transition-colors hover:text-slate-600"
            >
              {dept}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
