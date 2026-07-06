import React from 'react';
import { cn } from '../../lib/cn';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    unit?: string;
    leadingIcon?: React.ReactNode;
    /** Extra element rendered after the input, e.g. a submit icon button. */
    trailing?: React.ReactNode;
    /** External active state — calculators track "which field is being edited" outside of DOM focus. */
    active?: boolean;
    centered?: boolean;
    containerClassName?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(({ label, unit, leadingIcon, trailing, active, centered, containerClassName, className, ...props }, ref) => {
    return (
        <div className={cn('min-w-0', containerClassName)}>
            {label && <label className="block text-xs font-semibold text-ink-muted mb-1.5">{label}</label>}
            <div
                className={cn(
                    'flex items-center gap-2 bg-surface border rounded-xl shadow-sm px-3.5 transition-all',
                    'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-soft',
                    active ? 'border-primary ring-2 ring-primary-soft' : 'border-border',
                )}
            >
                {leadingIcon && <span className="text-ink-subtle shrink-0 flex items-center">{leadingIcon}</span>}
                <input
                    ref={ref}
                    className={cn('flex-1 min-w-0 border-0 outline-none bg-transparent text-ink text-base py-2 placeholder:text-ink-subtle tabular-nums', centered && 'text-center', className)}
                    {...props}
                />
                {unit && <span className="text-ink-subtle text-xs font-semibold shrink-0">{unit}</span>}
                {trailing}
            </div>
        </div>
    );
});
TextField.displayName = 'TextField';
