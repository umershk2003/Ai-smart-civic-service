import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'We used to lose a day just sorting complaints into departments. Now the AI routes them before our morning stand-up. Resolution times have dropped by nearly half.',
    name: 'Ahmed Khan',
    role: 'Municipal Admin, Metropolitan City',
    initials: 'AK',
    color: 'bg-primary-600',
  },
  {
    quote:
      'The SLA countdown changed how my team works. Nobody wants a ticket going red on the board. For the first time, leadership can see exactly where we are.',
    name: 'Supv. Khalid Mehmood',
    role: 'Supervisor, Water & Sanitation',
    initials: 'RM',
    color: 'bg-sky-600',
  },
  {
    quote:
      'As a citizen I can report an issue at 11pm and see it accepted, classified, and assigned before I go to bed. That transparency builds real trust in local government.',
    name: 'Zoya Khan',
    role: 'Citizen, Ward 2',
    initials: 'ER',
    color: 'bg-violet-600',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <Section
      id="testimonials"
      eyebrow="Testimonials"
      title="Loved by citizens and city teams alike"
      description="From the citizen filing a report to the supervisor clearing the queue — hear it from the people who use AI Smart Civic every day."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.1, ease: 'easeOut' }}
          >
            <Card hover dark className="flex h-full flex-col">
              <Quote className="h-6 w-6 text-primary-400/40" aria-hidden="true" />
              <div className="mt-3 flex items-center gap-0.5 text-amber-500" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-300">“{t.quote}”</p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-5">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ${t.color}`}
                >
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};
