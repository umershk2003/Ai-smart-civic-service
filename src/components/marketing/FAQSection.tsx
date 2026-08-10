import React from 'react';
import { Section } from '../ui/Section';
import { FAQ, FAQItemData } from '../ui/FAQ';

const FAQ_ITEMS: FAQItemData[] = [
  {
    question: 'How does the AI complaint classification actually work?',
    answer:
      'Every report is analyzed by a server-side Gemini model that reads the description and any attached photos. It returns the category, subcategory, priority score (1–100), estimated SLA, and the department responsible. If an API key is not configured, the platform falls back to a built-in rule engine so nothing breaks.',
  },
  {
    question: 'Is our municipal data secure?',
    answer:
      'Yes. All API keys stay server-side and are never exposed to the browser. Every action is written to an audit log — status changes, category overrides, officer assignments, and their justifications. The platform is designed to meet SOC 2 expectations, with role-based access enforced on every endpoint.',
  },
  {
    question: 'Can we migrate our existing complaint backlog?',
    answer:
      'Absolutely. Our onboarding team will import your historical complaints in CSV or Excel format, including categories, statuses, and officer assignments, so your analytics start with real history instead of a blank slate.',
  },
  {
    question: 'How long does deployment take?',
    answer:
      'A pilot city is typically live within a week. Since AI Smart Civic runs as a web platform, there is no hardware to install — your teams just need a browser, and citizens can report from any phone.',
  },
  {
    question: 'Do you provide training for field officers and supervisors?',
    answer:
      'Yes. Onboarding includes live walkthrough sessions for your supervisors and admins, plus on-site team training for field officers and a dedicated success manager who helps you tune categories and SLAs to your city’s workflows.'
  },
  {
    question: 'Can citizens track their complaints without an account?',
    answer:
      'Yes. Each report receives a unique tracking ID, and citizens can look up their ticket status any time — no login required. Accounts are optional and add features like reopening resolved tickets and leaving feedback.',
  },
];

export const FAQSection: React.FC = () => {
  return (
    <Section
      id="faq"
      eyebrow="FAQ"
      title="Frequently asked questions"
      description="Everything you need to know about deploying AI Smart Civic in your community. Can't find your answer? Reach out to our team."
    >
      <FAQ items={FAQ_ITEMS} />
    </Section>
  );
};
