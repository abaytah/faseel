import type { Variants, Transition } from 'framer-motion';

// --- Spring presets ---
export const springPresets = {
  gentle: { type: 'spring', stiffness: 120, damping: 14 } as Transition,
  snappy: { type: 'spring', stiffness: 300, damping: 20 } as Transition,
  bouncy: { type: 'spring', stiffness: 400, damping: 10 } as Transition,
};

// --- Fade ---
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const fadeOut: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0, transition: { duration: 0.2 } },
};

// --- Slide ---
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: springPresets.gentle },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: springPresets.gentle },
};

/** RTL-aware: slides from the start edge (right in RTL) */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: springPresets.gentle },
};

// --- Stagger ---
export const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// --- Interactive ---
export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)' },
  hover: {
    y: -4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08)',
    transition: springPresets.snappy,
  },
};

export const buttonPress = {
  rest: { scale: 1 },
  pressed: { scale: 0.97, transition: { duration: 0.1 } },
};

// --- Loading ---
export const shimmer: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};
