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
            className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer',
                selected ? 'bg-primary text-white' : 'bg-primary-soft text-primary hover:bg-primary/20',
                className,
            )}
            {...props}
        />
    );
}
