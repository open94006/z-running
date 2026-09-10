import React from 'react';
import { cn } from '../../lib/cn';

type Tone = 'info' | 'success' | 'warn';

const toneClasses: Record<Tone, string> = {
    info: 'bg-info-soft border-info/30 text-ink [&_.n-ic]:text-info-on-soft [&_strong]:text-info-on-soft',
    success: 'bg-success-soft border-success/30 text-ink [&_.n-ic]:text-success-on-soft [&_strong]:text-success-on-soft',
    warn: 'bg-warn-soft border-warn/30 text-ink [&_.n-ic]:text-warn-on-soft [&_strong]:text-warn-on-soft',
};

interface NoticeProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    tone?: Tone;
    children: React.ReactNode;
    className?: string;
}

export function Notice({ icon: Icon, tone = 'info', children, className }: NoticeProps) {
    return (
        <div className={cn('flex items-start gap-2.5 rounded-xl p-3.5 text-sm leading-relaxed border text-ink', toneClasses[tone], className)}>
            <Icon size={18} className="n-ic shrink-0 mt-0.5" aria-hidden />
            <div>{children}</div>
        </div>
    );
}
