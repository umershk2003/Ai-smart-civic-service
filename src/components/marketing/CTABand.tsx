import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Button } from '../ui/Button';

interface CTABandProps {
  onSignIn: () => void;
}

export const CTABand: React.FC<CTABandProps> = ({ onSignIn }) => {
  return (
    <section aria-label="Get started" className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-center shadow-popover sm:px-12 sm:py-20"
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 0%, rgba(16,185,129,0.22) 0%, transparent 70%)',
          }}
        />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to turn complaints into resolutions?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400">
            Join 14 municipal teams already closing the loop faster. Set up your city in minutes —
            no card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={onSignIn}
            >
              Start free today
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              leftIcon={<CalendarDays className="h-5 w-5 text-primary-400" />}
              onClick={onSignIn}
            >
              Book a live demo
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
