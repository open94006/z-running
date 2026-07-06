import type React from 'react';
import { cn } from '../../lib/cn';

interface ReadoutProps {
    label: string;
    value: React.ReactNode;
    className?: string;
}

export function Readout({ label, value, className }: ReadoutProps) {
    return (
        <div className={cn('bg-surface-2 border border-border rounded-2xl p-4 text-center', className)}>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">{label}</div>
            <div className="text-2xl font-extrabold text-primary tracking-tight mt-1 tabular-nums">{value}</div>
        </div>
    );
}
