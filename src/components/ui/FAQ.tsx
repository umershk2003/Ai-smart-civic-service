import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export interface FAQItemData {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItemData[];
  /** Optional accessible label for the list */
  label?: string;
}

export const FAQ: React.FC<FAQProps> = ({ items, label = 'Frequently asked questions' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-800 rounded-2xl bg-slate-900/70 shadow-card ring-1 ring-inset ring-white/10">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
              >
                <span className="text-sm font-semibold text-slate-100 sm:text-base">{item.question}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={[
                    'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300',
                    isOpen ? 'rotate-180 text-primary-400' : '',
                  ].join(' ')}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-sm leading-relaxed text-slate-400">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default FAQ;
