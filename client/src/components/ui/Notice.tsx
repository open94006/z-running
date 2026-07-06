import React from 'react';
import { cn } from '../../lib/cn';

type Tone = 'info' | 'success' | 'warn';

const toneClasses: Record<Tone, string> = {
    info: 'bg-info-soft border-info/30 [&_.n-ic]:text-info [&_strong]:text-info',
    success: 'bg-success-soft border-success/30 [&_.n-ic]:text-success [&_strong]:text-success',
    warn: 'bg-warn-soft border-warn/30 [&_.n-ic]:text-warn [&_strong]:text-warn',
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
            <Icon size={18} className="n-ic shrink-0 mt-0.5" />
            <div>{children}</div>
        </div>
    );
}
