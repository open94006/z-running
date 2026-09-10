import { X } from 'lucide-react';
import type React from 'react';

interface ChipProps {
    label: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    onSelect: () => void;
    onRemove: () => void;
    title?: string;
}

/** Removable, tinted pill — e.g. favorite locations. Not to be confused with Tag (fill-and-forget). */
export function Chip({ label, icon: Icon, onSelect, onRemove, title }: ChipProps) {
    return (
        <div className="inline-flex items-center gap-0.5 bg-primary-soft rounded-pill p-1">
            <button
                type="button"
                onClick={onSelect}
                title={title}
                className="inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-1 text-xs font-semibold text-primary-on-soft rounded-pill cursor-pointer t-press hit-44 [@media(hover:hover)]:hover:bg-primary/15"
            >
                {Icon && <Icon size={13} className="opacity-75" />}
                {label}
            </button>
            {/* Visual size stays small; the ::before expands the hit target to 44px
                so it is reachable on touch without bloating the pill. */}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`移除 ${label}`}
                className="relative w-6 h-6 shrink-0 grid place-items-center rounded-pill text-primary-on-soft/70 cursor-pointer t-press before:absolute before:-inset-2.5 before:content-[''] [@media(hover:hover)]:hover:bg-danger/15 [@media(hover:hover)]:hover:text-danger"
            >
                <X size={12} />
            </button>
        </div>
    );
}
