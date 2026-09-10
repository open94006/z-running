import React from 'react';
import { cn } from '../../lib/cn';

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
    className?: string;
    /** Accessible name. Falls back to a generic label when the caller renders its
     *  own heading. */
    label?: string;
}

/** Native <dialog> + showModal(): focus trap, Escape, backdrop and scroll lock
 *  come from the platform. Hand-rolling those four is how overlays end up
 *  announcing nothing and leaking tab order into the page behind them. */
export function Modal({ onClose, children, maxWidth = 'max-w-md', className, label = '彈出視窗' }: ModalProps) {
    const ref = React.useRef<HTMLDialogElement>(null);

    React.useEffect(() => {
        const el = ref.current;
        if (!el || el.open) return;
        el.showModal();
        // showModal() locks the dialog's own scroll but not the document's.
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
            if (el.open) el.close();
        };
    }, []);

    return (
        <dialog
            ref={ref}
            aria-label={label}
            onCancel={(e) => {
                e.preventDefault(); // let the caller own unmounting
                onClose();
            }}
            onClick={(e) => {
                // Backdrop click: the dialog element itself fills the viewport, so a
                // click landing on it rather than on the panel is a backdrop click.
                if (e.target === ref.current) onClose();
            }}
            className={cn(
                'fixed inset-0 m-auto w-[calc(100%-2rem)] h-fit max-h-[min(85dvh,44rem)] overflow-y-auto',
                'bg-surface text-ink rounded-2xl shadow-2xl p-5 border border-border',
                'backdrop:bg-black/60 backdrop:backdrop-blur-sm',
                'a-pop',
                maxWidth,
                className,
            )}
        >
            {children}
        </dialog>
    );
}
