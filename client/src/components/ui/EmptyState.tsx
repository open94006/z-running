import React from 'react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    message: string;
    /** What the user can do about it. An empty state without an exit is a dead end. */
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, message, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center text-center p-10 border border-dashed border-border-strong rounded-2xl text-ink-subtle', className)}>
            <Icon size={32} className="mb-3 opacity-60" aria-hidden />
            <p className="text-sm font-medium">{message}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn('h-3.5 rounded-pill bg-surface-3 motion-safe:animate-pulse', className)} aria-hidden />;
}
