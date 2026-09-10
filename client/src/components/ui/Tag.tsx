import type React from 'react';
import { cn } from '../../lib/cn';

interface TagProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    selected?: boolean;
}

/** Fill-and-forget quick-select pill (e.g. preset distances). Not removable — see Chip for that. */
export function Tag({ selected, className, ...props }: TagProps) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap min-h-9 px-3.5 py-1.5 rounded-pill text-xs font-semibold cursor-pointer t-press hit-44',
                '[@media(hover:hover)]:active:translate-y-px',
                selected ? 'bg-primary text-primary-ink' : 'bg-primary-soft text-primary-on-soft [@media(hover:hover)]:hover:bg-primary/20',
                'disabled:opacity-45 disabled:cursor-not-allowed',
                className,
            )}
            {...props}
        />
    );
}
