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
        <div className="inline-flex items-center gap-0.5 bg-primary-soft rounded-full pl-1 pr-1 py-1 transition-colors">
            <button
                type="button"
                onClick={onSelect}
                title={title}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-primary rounded-full hover:bg-primary/15 transition-colors"
            >
                {Icon && <Icon size={13} className="opacity-75" />}
                {label}
            </button>
            <button
                type="button"
                onClick={onRemove}
                aria-label={`移除 ${label}`}
                className="w-[22px] h-[22px] shrink-0 grid place-items-center rounded-full text-primary/55 hover:bg-danger/15 hover:text-danger transition-colors"
            >
                <X size={11} />
            </button>
        </div>
    );
}
