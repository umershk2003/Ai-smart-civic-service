import React, { useState } from 'react';
import { MapPin, Check, Copy } from 'lucide-react';
import { LocationData } from '../../types';
import { formatLocation, LOCATION_CONFIG } from '../../data/locations';

interface LocationCardProps {
  location: LocationData | undefined;
  /** Render on a dark surface (default) or light */
  dark?: boolean;
}

/** Structured, copy-friendly location card. No maps — pure administrative data. */
export const LocationCard: React.FC<LocationCardProps> = ({ location, dark = true }) => {
  const [copied, setCopied] = useState(false);
  const rows = formatLocation(location);

  if (rows.length === 0) {
    return (
      <div
        className={[
          'rounded-xl border p-4 text-xs text-slate-500',
          dark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50',
        ].join(' ')}
      >
        No location recorded for this ticket.
      </div>
    );
  }

  const handleCopy = async () => {
    const text = rows.map((r) => `${r.label}: ${r.value}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div
      className={[
        'rounded-xl border p-4',
        dark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span className={['flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider', dark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          Location · {LOCATION_CONFIG.countryName}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy location details"
          className={[
            'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors cursor-pointer',
            dark
              ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
              : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800',
          ].join(' ')}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>

      <dl className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-2 text-xs">
            <dt className={['w-24 shrink-0 pt-px text-[10px] font-semibold uppercase tracking-wide', dark ? 'text-slate-500' : 'text-slate-400'].join(' ')}>
              {row.label}
            </dt>
            <dd className={['font-medium leading-relaxed', dark ? 'text-slate-200' : 'text-slate-700'].join(' ')}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
