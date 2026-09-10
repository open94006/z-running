import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warn' | 'soft' | 'soft-success' | 'soft-danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    /** Icon-only button: forces a fixed square footprint instead of sizing from padding. */
    iconOnly?: boolean;
    block?: boolean;
    /** Shows an inline spinner in place of any leading icon and blocks input. */
    loading?: boolean;
    /** Failed action — pairs the danger tone with aria-invalid, never colour alone. */
    error?: boolean;
    /** Completed action. Quiet by design; success doesn't deserve celebration. */
    success?: boolean;
}

// Every filled variant pairs its background with the matching -ink token.
// Hardcoding text-white here is the bug --warn-ink exists to prevent: --warn is
// light enough that white text fails contrast on it.
const variantClasses: Record<Variant, string> = {
    primary: 'bg-primary text-primary-ink shadow-sm hover:bg-primary-hover',
    secondary: 'bg-surface text-ink border border-border shadow-sm hover:border-border-strong hover:bg-surface-2',
    ghost: 'bg-transparent text-ink-muted hover:bg-surface-3 hover:text-ink',
    danger: 'bg-danger text-danger-ink shadow-sm hover:brightness-110',
    warn: 'bg-warn text-warn-ink shadow-sm hover:brightness-110',
    soft: 'bg-primary-soft text-primary-on-soft hover:bg-primary/20',
    'soft-success': 'bg-success-soft text-success-on-soft hover:bg-success/20',
    'soft-danger': 'bg-danger-soft text-danger-on-soft hover:bg-danger/20',
};

// icon-only buttons use a fixed square footprint per size — padding-based sizing
// makes lg/sm combined with icon-only non-square, so width/height wins here.
const iconSizeClasses: Record<Size, string> = {
    sm: 'w-9 h-9 rounded-lg [&_svg]:size-[15px] hit-44',
    md: 'w-11 h-11 rounded-xl [&_svg]:size-[18px]',
    lg: 'w-12 h-12 rounded-2xl [&_svg]:size-[21px]',
};

// Heights match TextField so a button never sits shorter than the input beside it.
const sizeClasses: Record<Size, string> = {
    sm: 'min-h-9 px-3 py-1.5 text-xs rounded-lg gap-1.5 hit-44',
    md: 'min-h-11 px-4 py-2 text-sm rounded-xl gap-1.5',
    lg: 'min-h-12 px-5 py-3 text-base rounded-2xl gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { variant = 'secondary', size = 'md', iconOnly = false, block = false, loading = false, error = false, success = false, className, children, disabled, ...props },
        ref,
    ) => {
        const isBlocked = disabled || loading;

        return (
            <button
                ref={ref}
                disabled={isBlocked}
                aria-busy={loading || undefined}
                aria-invalid={error || undefined}
                data-state={loading ? 'loading' : error ? 'error' : success ? 'success' : undefined}
                className={cn(
                    // Labels never wrap to two lines — the row reflows, the label doesn't.
                    'inline-flex items-center justify-center whitespace-nowrap font-semibold cursor-pointer t-press',
                    'disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none',
                    // Press-tick and hover-raise are pointer-only so touch devices
                    // don't get stuck in a hover state after a tap.
                    '[@media(hover:hover)]:active:translate-y-px',
                    variantClasses[variant],
                    iconOnly ? iconSizeClasses[size] : sizeClasses[size],
                    error && 'ring-2 ring-danger',
                    success && 'ring-2 ring-success',
                    block && 'w-full',
                    className,
                )}
                {...props}
            >
                {loading && <Loader2 aria-hidden className="animate-spin shrink-0" size={size === 'lg' ? 20 : 16} />}
                {children}
            </button>
        );
    },
);
Button.displayName = 'Button';
