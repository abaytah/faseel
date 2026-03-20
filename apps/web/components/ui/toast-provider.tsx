'use client';

import { createContext, useCallback, useContext, useState, useRef } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

// ============================================================
// Types
// ============================================================

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// ============================================================
// Context
// ============================================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}

// ============================================================
// Standalone toast (non-hook, event-driven)
// ============================================================

type ToastListener = (message: string, type: ToastType) => void;
let _listener: ToastListener | null = null;

/** Fire-and-forget toast from anywhere (even non-component code). */
export function showToast(message: string, type: ToastType = 'info') {
  if (_listener) {
    _listener(message, type);
  } else {
    // Fallback: queue until provider mounts
    _queue.push({ message, type });
  }
}

const _queue: { message: string; type: ToastType }[] = [];

// ============================================================
// Style config
// ============================================================

const typeConfig: Record<ToastType, { icon: typeof CheckCircle2; bg: string; border: string; iconColor: string }> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 dark:bg-emerald-950/80',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-950/80',
    border: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  info: {
    icon: Info,
    bg: 'bg-sky-50 dark:bg-sky-950/80',
    border: 'border-sky-200 dark:border-sky-800',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
};

// ============================================================
// Provider
// ============================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((message: string, type: ToastType) => {
    counterRef.current += 1;
    const id = `toast-${counterRef.current}-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register standalone listener
  _listener = addToast;

  // Flush any queued toasts
  if (_queue.length > 0) {
    const queued = [..._queue];
    _queue.length = 0;
    // Use setTimeout to avoid setState during render
    setTimeout(() => queued.forEach((q) => addToast(q.message, q.type)), 0);
  }

  const ctx: ToastContextValue = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={ctx}>
      <ToastPrimitive.Provider swipeDirection="up" duration={3000}>
        {children}

        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const config = typeConfig[toast.type];
            const Icon = config.icon;

            return (
              <ToastPrimitive.Root
                key={toast.id}
                asChild
                forceMount
                onOpenChange={(open) => {
                  if (!open) dismiss(toast.id);
                }}
              >
                <motion.li
                  layout
                  initial={{ opacity: 0, y: -40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={cn(
                    'pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg',
                    'backdrop-blur-sm min-w-[280px] max-w-[420px]',
                    config.bg,
                    config.border,
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', config.iconColor)} />
                  <ToastPrimitive.Description className="flex-1 text-sm font-medium text-[var(--foreground)]">
                    {toast.message}
                  </ToastPrimitive.Description>
                  <ToastPrimitive.Close aria-label="إغلاق">
                    <X className="h-4 w-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" />
                  </ToastPrimitive.Close>
                </motion.li>
              </ToastPrimitive.Root>
            );
          })}
        </AnimatePresence>

        <ToastPrimitive.Viewport
          className="fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2 outline-none"
          style={{ listStyle: 'none' }}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
