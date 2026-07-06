import { cn } from '../../lib/cn';

interface SegmentedOption<T extends string> {
    value: T;
    label: string;
}

interface SegmentedProps<T extends string> {
    options: SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    'aria-label'?: string;
    className?: string;
}

export function Segmented<T extends string>({ options, value, onChange, className, ...rest }: SegmentedProps<T>) {
    return (
        <div className={cn('inline-flex gap-1 bg-surface-3 p-1 rounded-xl', className)} role="group" {...rest}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    aria-pressed={value === opt.value}
                    className={cn(
                        'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all',
                        value === opt.value ? 'bg-primary text-white shadow-sm' : 'text-ink-muted hover:text-ink',
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
