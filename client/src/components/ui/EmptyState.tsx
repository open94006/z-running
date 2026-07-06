import React from 'react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    message: string;
    className?: string;
}

export function EmptyState({ icon: Icon, message, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-border rounded-2xl text-ink-subtle', className)}>
            <Icon size={40} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}

export function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn('h-3.5 rounded-full bg-surface-3 motion-safe:animate-pulse', className)}
        />
    );
}
