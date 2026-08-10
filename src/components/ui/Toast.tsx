import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastInput, 'title' | 'variant' | 'duration'>> {
  id: number;
  description?: string;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

const VARIANT_META: Record<ToastVariant, { icon: React.ElementType; iconClass: string; barClass: string }> = {
  success: { icon: CheckCircle2, iconClass: 'text-emerald-400', barClass: 'bg-emerald-400' },
  error: { icon: XCircle, iconClass: 'text-red-400', barClass: 'bg-red-400' },
  warning: { icon: AlertTriangle, iconClass: 'text-amber-400', barClass: 'bg-amber-400' },
  info: { icon: Info, iconClass: 'text-sky-400', barClass: 'bg-sky-400' },
};

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = ++toastCounter;
      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? 'info',
        duration: input.duration ?? 4500,
      };
      setToasts((prev) => [...prev.slice(-3), item]);
      const timer = setTimeout(() => dismiss(id), item.duration);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast stack */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-2.5"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const meta = VARIANT_META[t.variant];
            const Icon = meta.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="pointer-events-auto relative overflow-hidden rounded-xl bg-slate-900 p-4 pr-10 shadow-popover ring-1 ring-white/10"
                role={t.variant === 'error' ? 'alert' : 'status'}
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${meta.barClass}`} aria-hidden="true" />
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${meta.iconClass}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{t.title}</p>
                    {t.description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{t.description}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(t.id)}
                  className="absolute right-2 top-2 rounded-md p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
