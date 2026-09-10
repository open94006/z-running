import React from 'react';
import { cn } from '../../lib/cn';

type Accent = 'primary' | 'info' | 'warn' | 'accent';

// The accent is a small filled square beside the heading, not a 4px left stripe.
// The side-stripe card is a named tell; a hairline border all round plus one
// anchored colour block reads as considered instead.
const accentClasses: Record<Accent, string> = {
    primary: '[&_.gc-ic]:bg-primary [&_.gc-ic]:text-primary-ink',
    info: '[&_.gc-ic]:bg-info [&_.gc-ic]:text-info-ink',
    warn: '[&_.gc-ic]:bg-warn [&_.gc-ic]:text-warn-ink',
    accent: '[&_.gc-ic]:bg-accent [&_.gc-ic]:text-accent-ink',
};

interface GuideCardProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    desc: string;
    accent?: Accent;
    /** Optional trailing controls (e.g. duration quick-picker) rendered next to the title. */
    action?: React.ReactNode;
}

export function GuideCard({ icon: Icon, title, desc, accent = 'primary', action }: GuideCardProps) {
    return (
        <div className={cn('flex items-start gap-3 bg-surface border border-border rounded-xl p-3.5 shadow-sm', accentClasses[accent])}>
            <div className="gc-ic w-8 h-8 rounded-md shrink-0 grid place-items-center">
                <Icon size={17} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-ink">{title}</h4>
                    {action}
                </div>
                <p className="text-xs text-ink-muted leading-relaxed mt-0.5">{desc}</p>
            </div>
        </div>
    );
}
