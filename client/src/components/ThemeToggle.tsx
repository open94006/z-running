import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import clsx from 'clsx';

interface ThemeToggleProps {
    showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = true }) => {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        return document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            aria-pressed={isDark}
            aria-label={isDark ? '切換為明亮模式' : '切換為暗黑模式'}
            className={clsx(
                'flex items-center gap-2.5 h-11 rounded-lg cursor-pointer t-surface',
                'bg-rail-2 text-rail-ink-muted border border-rail-border [@media(hover:hover)]:hover:text-rail-ink',
                showLabel ? 'w-full px-3' : 'w-11 justify-center',
            )}
        >
            {isDark ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
            {showLabel && <span className="text-xs font-semibold whitespace-nowrap">{isDark ? '暗黑模式' : '明亮模式'}</span>}
        </button>
    );
};

export default ThemeToggle;
