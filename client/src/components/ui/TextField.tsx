import React from 'react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
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
    /** Format hint, not instruction. Replaced by `error` when one is present. */
    helper?: string;
    error?: string;
    success?: boolean;
    loading?: boolean;
}

let uid = 0;

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
    ({ label, unit, leadingIcon, trailing, active, centered, containerClassName, className, helper, error, success, loading, id, disabled, ...props }, ref) => {
        const autoId = React.useMemo(() => `tf-${++uid}`, []);
        const fieldId = id ?? autoId;
        const msgId = `${fieldId}-msg`;
        const message = error ?? helper;

        return (
            <div className={cn('min-w-0', containerClassName)}>
                {label && (
                    <label htmlFor={fieldId} className="block text-xs font-semibold text-ink-muted mb-1.5">
                        {label}
                    </label>
                )}
                <div
                    className={cn(
                        // Border width is 1px in EVERY state. State changes go to
                        // background, outline and colour — never to border-width,
                        // because that shifts layout on focus and the eye catches it.
                        'flex items-center gap-2 min-h-11 bg-surface border rounded-xl shadow-sm px-3.5 t-surface',
                        'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus',
                        '[@media(hover:hover)]:hover:bg-surface-2',
                        error ? 'border-danger' : active || success ? 'border-primary' : 'border-border',
                        disabled && 'opacity-55 cursor-not-allowed',
                    )}
                >
                    {leadingIcon && <span className="text-ink-subtle shrink-0 flex items-center">{leadingIcon}</span>}
                    <input
                        ref={ref}
                        id={fieldId}
                        disabled={disabled}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={message ? msgId : undefined}
                        className={cn(
                            'flex-1 min-w-0 border-0 outline-none bg-transparent text-ink text-base py-2 placeholder:text-ink-subtle tabular-nums',
                            'disabled:cursor-not-allowed',
                            centered && 'text-center',
                            className,
                        )}
                        {...props}
                    />
                    {unit && <span className="text-ink-subtle text-xs font-semibold shrink-0">{unit}</span>}
                    {/* Fixed-width status slot — reserved so the field never reflows
                        when a glyph appears. Empty when there is nothing to say. */}
                    <span className="w-5 shrink-0 grid place-items-center" aria-hidden>
                        {loading ? (
                            <Loader2 size={16} className="animate-spin text-ink-subtle" />
                        ) : error ? (
                            <AlertCircle size={16} className="text-danger" />
                        ) : success ? (
                            <Check size={16} className="text-success" />
                        ) : null}
                    </span>
                    {trailing}
                </div>
                {/* Error replaces helper in the same slot, so validating never pushes
                    the page down. Height is reserved only when the field uses messages. */}
                {(helper || error) && (
                    <p id={msgId} className={cn('mt-1 text-xs min-h-4', error ? 'text-danger' : 'text-ink-subtle')} role={error ? 'alert' : undefined}>
                        {message}
                    </p>
                )}
            </div>
        );
    },
);
TextField.displayName = 'TextField';
