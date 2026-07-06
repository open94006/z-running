import React from 'react';
import { cn } from '../../lib/cn';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('bg-surface border border-border rounded-2xl shadow-sm p-4', className)} {...props} />;
}
