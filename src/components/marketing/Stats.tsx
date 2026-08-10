import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';

interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  decimals?: number;
  label: string;
}

const STATS: Stat[] = [
  { value: 12400, suffix: '+', label: 'Complaints resolved' },
  { value: 96, suffix: '%', label: 'SLA compliance rate' },
  { value: 4.8, suffix: '/5', decimals: 1, label: 'Average citizen rating' },
  { value: 3, suffix: '×', label: 'Faster routing with AI' },
];

function CountUp({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(stat.value * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, stat.value]);

  const formatted =
    stat.decimals !== undefined
      ? display.toFixed(stat.decimals)
      : Math.round(display).toLocaleString();

  return (
    <span ref={ref}>
      {stat.prefix}
      {formatted}
      {stat.suffix}
    </span>
  );
}

export const Stats: React.FC = () => {
  return (
    <section aria-label="Platform metrics" className="bg-slate-950 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            >
              <dt className="text-sm font-medium text-slate-400">{stat.label}</dt>
              <dd className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                <CountUp stat={stat} />
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
};
