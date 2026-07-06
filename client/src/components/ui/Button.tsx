import React from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warn' | 'soft' | 'soft-success' | 'soft-danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    /** Icon-only button: forces a fixed square footprint instead of sizing from padding. */
    iconOnly?: boolean;
    block?: boolean;
}

const variantClasses: Record<Variant, string> = {
    primary: 'bg-primary text-white shadow-sm hover:bg-primary-hover',
    secondary: 'bg-surface text-ink border border-border shadow-sm hover:border-border-strong',
    ghost: 'bg-transparent text-ink-muted hover:bg-surface-3 hover:text-ink',
    danger: 'bg-danger text-white shadow-sm',
    warn: 'bg-warn text-white shadow-sm',
    soft: 'bg-primary-soft text-primary hover:bg-primary/20',
    'soft-success': 'bg-success-soft text-success hover:bg-success/20',
    'soft-danger': 'bg-danger-soft text-danger hover:bg-danger/20',
};

// icon-only buttons use a fixed square footprint per size — padding-based sizing
// makes lg/sm combined with icon-only non-square, so width/height wins here.
const iconSizeClasses: Record<Size, string> = {
    sm: 'w-8 h-8 rounded-lg [&_svg]:size-[15px]',
    md: 'w-[38px] h-[38px] rounded-xl [&_svg]:size-[18px]',
    lg: 'w-[46px] h-[46px] rounded-2xl [&_svg]:size-[21px]',
};

const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-1.5',
    lg: 'px-5 py-3 text-base rounded-2xl gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'secondary', size = 'md', iconOnly = false, block = false, className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center font-semibold cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none',
                    variantClasses[variant],
                    iconOnly ? iconSizeClasses[size] : sizeClasses[size],
                    block && 'w-full',
                    className,
                )}
                {...props}
            />
        );
    },
);
Button.displayName = 'Button';
