import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Route,
  Timer,
  BarChart3,
  ShieldCheck,
  Camera,
} from 'lucide-react';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';

const FEATURES = [
  {
    icon: Sparkles,
    color: 'bg-primary-500/15 text-primary-300 ring-primary-500/30',
    title: 'AI complaint classification',
    description:
      'Gemini reads the description and photos of every report to detect the category, subcategory, and the exact department responsible — no forms to guess through.',
  },
  {
    icon: Route,
    color: 'bg-teal-500/15 text-teal-300 ring-teal-500/30',
    title: 'Smart auto-routing',
    description:
      'Tickets are routed to the right team and officer instantly, with recommended actions and context attached, so field crews arrive prepared.',
  },
  {
    icon: Timer,
    color: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
    title: 'SLA automation',
    description:
      'Every issue gets a priority score and a resolution deadline. Supervisors see at-risk tickets before they slip, and citizens see honest ETAs.',
  },
  {
    icon: BarChart3,
    color: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
    title: 'Real-time analytics',
    description:
      'Ward-by-ward density, category trends, SLA compliance, and cost tracking — dashboards that turn operational data into decisions.',
  },
  {
    icon: ShieldCheck,
    color: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
    title: 'Role-based access',
    description:
      'Citizen, Field Officer, Supervisor, Admin, and Super Admin — five roles with strict, audited permissions enforced on every action.',
  },
  {
    icon: Camera,
    color: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
    title: 'Field verification',
    description:
      'Officers capture before/after photos, log costs and materials, and close tickets with evidence — a complete audit trail from report to resolution.',
  },
];

export const Features: React.FC = () => {
  return (
    <Section
      id="features"
      eyebrow="Features"
      title="Everything your city needs to close the loop"
      description="From the first citizen report to the final verified repair, AI Smart Civic keeps every step visible, accountable, and fast."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: 'easeOut' }}
          >
            <Card hover dark className="h-full">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset ${feature.color}`}
              >
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base font-bold tracking-tight text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};
