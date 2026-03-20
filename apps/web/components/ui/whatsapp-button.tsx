'use client';

import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface WhatsAppButtonProps {
  phone: string;       // e.g., "966551234567"
  message: string;     // Arabic pre-filled text
  label?: string;      // button text (default: "واتساب")
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { button: 'px-3 py-1.5 text-xs gap-1.5', icon: 'h-3.5 w-3.5', iconOnly: 'h-8 w-8' },
  md: { button: 'px-4 py-2 text-sm gap-2', icon: 'h-4 w-4', iconOnly: 'h-10 w-10' },
  lg: { button: 'px-5 py-2.5 text-base gap-2.5', icon: 'h-5 w-5', iconOnly: 'h-12 w-12' },
} as const;

export function WhatsAppButton({
  phone,
  message,
  label = 'واتساب',
  variant = 'primary',
  className,
  size = 'md',
}: WhatsAppButtonProps) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const s = sizeMap[size];

  if (variant === 'icon') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-[#25D366] text-white',
          'transition-transform duration-150 hover:scale-105 active:scale-95',
          'shadow-sm hover:shadow-md',
          s.iconOnly,
          className,
        )}
        title={label}
      >
        <MessageCircle className={s.icon} />
      </a>
    );
  }

  const base = cn(
    'inline-flex items-center justify-center rounded-xl font-medium',
    'transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]',
    'shadow-sm hover:shadow-md',
    s.button,
  );

  const variants = {
    primary: 'bg-[#25D366] text-white hover:bg-[#20bd5a]',
    secondary: 'bg-white text-[#25D366] border-2 border-[#25D366] hover:bg-[#25D366]/5',
  } as const;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(base, variants[variant], className)}
    >
      <MessageCircle className={s.icon} />
      {label}
    </a>
  );
}
