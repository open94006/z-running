import React from 'react';
import { cn } from '../../lib/cn';

type Variant = 'neutral' | 'success' | 'warn' | 'danger' | 'solid';

const variantClasses: Record<Variant, string> = {
    neutral: 'bg-surface-3 text-ink-muted border-border',
    success: 'bg-success-soft text-success-on-soft border-success/30',
    warn: 'bg-warn-soft text-warn-on-soft border-warn/30',
    danger: 'bg-danger-soft text-danger-on-soft border-danger/30',
    solid: 'bg-primary text-primary-ink border-transparent',
};

export function Badge({ variant = 'neutral', className, ...props }: { variant?: Variant } & React.HTMLAttributes<HTMLSpanElement>) {
    return <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-bold border leading-tight', variantClasses[variant], className)} {...props} />;
}
