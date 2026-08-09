import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider transition-colors';

  const variants = {
    primary: 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/20',
    secondary: 'bg-slate-800 text-slate-300 border border-slate-700/50',
    success: 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-950/40 text-amber-400 border border-amber-500/20',
    destructive: 'bg-rose-950/40 text-rose-400 border border-rose-500/20',
    info: 'bg-sky-950/40 text-sky-400 border border-sky-500/20',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      {...props}
    >
      {children}
    </span>
  );
};
