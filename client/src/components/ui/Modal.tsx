import React from 'react';
import { cn } from '../../lib/cn';

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
    zIndex?: number;
    className?: string;
}

export function Modal({ onClose, children, maxWidth = 'max-w-md', zIndex = 110, className }: ModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex }}>
            <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="關閉彈窗" />
            <div className={cn('relative bg-surface w-full rounded-2xl shadow-2xl p-5 animate-in fade-in zoom-in duration-200', maxWidth, className)}>
                {children}
            </div>
        </div>
    );
}
