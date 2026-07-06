import React from 'react';
import { cn } from '../../lib/cn';

type Accent = 'primary' | 'info' | 'success' | 'warn' | 'danger' | 'accent';

const accentClasses: Record<Accent, string> = {
    primary: 'border-t-primary text-primary',
    info: 'border-t-info text-info',
    success: 'border-t-success text-success',
    warn: 'border-t-warn text-warn',
    danger: 'border-t-danger text-danger',
    accent: 'border-t-accent text-accent',
};

interface TileProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: React.ReactNode;
    unit?: string;
    hint?: string;
    accent?: Accent;
    className?: string;
}

export function Tile({ icon: Icon, label, value, unit, hint, accent = 'primary', className }: TileProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center text-center bg-surface border border-border rounded-2xl shadow-sm p-4 border-t-[3px]',
                'transition-all hover:-translate-y-0.5 hover:shadow-md',
                accentClasses[accent],
                className,
            )}
        >
            <Icon size={26} className="mb-2" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
            <span className="text-2xl font-extrabold tracking-tight text-ink mt-0.5">
                {value}
                {unit && <small className="text-sm font-medium text-ink-muted ml-0.5">{unit}</small>}
            </span>
            {hint && <span className="text-[10.5px] mt-1 text-ink-muted font-medium">{hint}</span>}
        </div>
    );
}
