import React from 'react';
import { cn } from '../../lib/cn';

type Accent = 'primary' | 'info' | 'warn' | 'accent';

const accentClasses: Record<Accent, string> = {
    primary: 'border-l-primary [&_.gc-ic]:bg-primary/15 [&_.gc-ic]:text-primary',
    info: 'border-l-info [&_.gc-ic]:bg-info/15 [&_.gc-ic]:text-info',
    warn: 'border-l-warn [&_.gc-ic]:bg-warn/15 [&_.gc-ic]:text-warn',
    accent: 'border-l-accent [&_.gc-ic]:bg-accent/15 [&_.gc-ic]:text-accent',
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
        <div className={cn('flex items-start gap-3 bg-surface border border-border border-l-4 rounded-xl p-3.5 shadow-sm', accentClasses[accent])}>
            <div className="gc-ic w-[34px] h-[34px] rounded-full shrink-0 grid place-items-center">
                <Icon size={18} />
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
