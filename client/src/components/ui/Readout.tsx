import type React from 'react';
import { cn } from '../../lib/cn';

interface ReadoutProps {
    label: string;
    value: React.ReactNode;
    className?: string;
}

export function Readout({ label, value, className }: ReadoutProps) {
    return (
        <div className={cn('bg-surface-2 border border-border rounded-2xl p-4', className)}>
            <div className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-subtle">{label}</div>
            <div className="font-display text-4xl font-extrabold text-primary tracking-tight leading-none mt-1.5 tabular-nums">{value}</div>
        </div>
    );
}
