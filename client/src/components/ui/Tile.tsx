import React from 'react';
import { cn } from '../../lib/cn';

type Accent = 'primary' | 'info' | 'success' | 'warn' | 'danger' | 'accent';

// The accent rides the icon and the value, not a thick edge stripe. A 3px coloured
// border on one side is the side-stripe card — a named tell, banned by the system.
const accentClasses: Record<Accent, string> = {
    primary: 'text-primary',
    info: 'text-info',
    success: 'text-success',
    warn: 'text-warn',
    danger: 'text-danger',
    accent: 'text-accent',
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
                'group flex flex-col bg-surface border border-border rounded-2xl shadow-sm p-4 t-raise',
                '[@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:border-border-strong',
                className,
            )}
        >
            {/* Icon sits inline with the label rather than centred above it — the
                centred icon-over-heading-over-copy tile is the universal template. */}
            <div className="flex items-center gap-1.5 min-w-0">
                <Icon size={15} className={cn('shrink-0', accentClasses[accent])} />
                <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-muted truncate">{label}</span>
            </div>
            <span className="font-display text-3xl font-extrabold tracking-tight text-ink tabular-nums leading-none mt-2">
                {value}
                {unit && <small className="font-body text-sm font-medium text-ink-muted ml-0.5">{unit}</small>}
            </span>
            {hint && <span className="text-2xs mt-1.5 text-ink-subtle font-medium">{hint}</span>}
        </div>
    );
}
