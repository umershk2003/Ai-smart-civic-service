import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Megaphone,
  ClipboardCheck,
  Wrench,
  BarChart3,
  Users,
  Sparkles,
} from 'lucide-react';
import { Section } from '../ui/Section';
import { Tabs, TabItem } from '../ui/Tabs';
import { Card } from '../ui/Card';

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
}

const STEPS: Record<string, Step[]> = {
  citizens: [
    {
      icon: Megaphone,
      title: 'Report in under a minute',
      description: 'Describe the issue and drop a photo. No account juggling, no department guessing — just a quick, guided form.',
    },
    {
      icon: ClipboardCheck,
      title: 'Track every status change',
      description: 'Get a unique tracking ID and follow your ticket from Submitted to In Progress to Resolved, with an SLA countdown included.',
    },
    {
      icon: Wrench,
      title: 'Rate the outcome',
      description: 'When the work is done, share feedback or reopen the ticket if the fix did not hold. Your voice stays in the loop.',
    },
  ],
  operations: [
    {
      icon: Sparkles,
      title: 'AI triages the queue',
      description: 'New complaints are classified, scored for priority, and routed to the correct department — before anyone reads them.',
    },
    {
      icon: Wrench,
      title: 'Dispatch and verify',
      description: 'Supervisors assign officers, who log before/after photos, materials, and costs directly from the field.',
    },
    {
      icon: ClipboardCheck,
      title: 'Close with evidence',
      description: 'Quality assurance sign-off keeps a full audit trail of every action, override, and justification.',
    },
  ],
  leadership: [
    {
      icon: BarChart3,
      title: 'Monitor SLAs live',
      description: 'A command-center view of at-risk tickets, officer workloads, and ward hotspots — refreshed as work happens.',
    },
    {
      icon: Sparkles,
      title: 'Spot trends early',
      description: 'Category and ward analytics reveal repeat problems, so budgets go where they matter.',
    },
    {
      icon: Users,
      title: 'Optimize the model',
      description: 'Adjust categories, SLAs, and priorities centrally. Your operational playbook, codified.',
    },
  ],
};

const TABS: TabItem[] = [
  { id: 'citizens', label: 'For citizens', content: <StepList steps={STEPS.citizens} /> },
  { id: 'operations', label: 'For operations teams', content: <StepList steps={STEPS.operations} /> },
  { id: 'leadership', label: 'For leadership', content: <StepList steps={STEPS.leadership} /> },
];

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {steps.map((step, i) => (
        <motion.li
          key={step.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.1, ease: 'easeOut' }}
        >
          <Card className="relative h-full">
            <span className="absolute right-5 top-5 text-4xl font-black leading-none text-slate-100">
              {i + 1}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-200">
              <step.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
          </Card>
        </motion.li>
      ))}
    </ol>
  );
}

export const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState('citizens');

  return (
    <Section
      id="how-it-works"
      eyebrow="How it works"
      title="One platform, three perspectives"
      description="Citizens get transparency. Teams get triage. Leaders get control. The same tickets flow through every view."
      className="bg-slate-50/70"
    >
      <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} label="Choose your perspective" />
    </Section>
  );
};
