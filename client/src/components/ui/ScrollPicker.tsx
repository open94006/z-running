import { useRef, useState } from 'react';

interface ScrollPickerProps {
    value: string;
    onChange: (val: string) => void;
    items: string[];
    label: string;
}

/** 每格高度（px）—— inline style 直接使用，避免 Tailwind 類名與實際渲染高度不一致 */
const ITEM_H = 56;

/**
 * Drum-roll 選擇器（transform 定位模式）
 * 以 translateY 精確移動項目清單，不依賴 scrollTop / scroll-snap，
 * 消除浮點偏移造成的數字錯位。支援觸控拖曳、點擊與方向鍵。
 */
export function ScrollPicker({ value, onChange, items, label }: ScrollPickerProps) {
    const [dragDy, setDragDy] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startRef = useRef<{ y: number; idx: number } | null>(null);

    const currentIdx = Math.max(0, items.indexOf(value));

    // 拖曳中實時高亮中央格對應的項目索引
    const displayIdx = isDragging ? Math.max(0, Math.min(Math.round(currentIdx - dragDy / ITEM_H), items.length - 1)) : currentIdx;

    // translateY：將 currentIdx 的項目置於第 1 格（0-indexed）中央
    const translateY = ITEM_H - currentIdx * ITEM_H + dragDy;

    const handleTouchStart = (e: React.TouchEvent) => {
        startRef.current = { y: e.touches[0].clientY, idx: currentIdx };
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!startRef.current) return;
        const dy = e.touches[0].clientY - startRef.current.y;
        // 限制超出頭尾
        const maxDy = startRef.current.idx * ITEM_H;
        const minDy = -(items.length - 1 - startRef.current.idx) * ITEM_H;
        setDragDy(Math.max(minDy, Math.min(maxDy, dy)));
    };

    const handleTouchEnd = () => {
        if (!startRef.current) return;
        const snapIdx = Math.max(0, Math.min(Math.round(startRef.current.idx - dragDy / ITEM_H), items.length - 1));
        onChange(items[snapIdx]);
        setDragDy(0);
        setIsDragging(false);
        startRef.current = null;
    };

    // 方向鍵操作：拖曳是觸控專屬，鍵盤使用者需要等價路徑
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const delta = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
        if (!delta) return;
        e.preventDefault();
        const next = Math.max(0, Math.min(currentIdx + delta, items.length - 1));
        if (next !== currentIdx) onChange(items[next]);
    };

    return (
        <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-ink-muted font-semibold">{label}</span>
            {/* 容器高度由 JS 計算，確保與 ITEM_H 完全對齊 */}
            <div
                role="listbox"
                aria-label={label}
                aria-activedescendant={`${label}-${displayIdx}`}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="relative overflow-hidden rounded-xl bg-surface border border-border shadow-sm select-none touch-none"
                style={{ width: 80, height: ITEM_H * 3 }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* 上下漸層遮罩 —— 功能性淡出，非裝飾 */}
                <div className="absolute inset-x-0 top-0 bg-linear-to-b from-surface to-transparent z-raised pointer-events-none" style={{ height: ITEM_H }} />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-surface to-transparent z-raised pointer-events-none" style={{ height: ITEM_H }} />
                {/* 中央選取高亮帶 */}
                <div className="absolute inset-x-1.5 rounded-lg bg-primary/10 border border-primary/25 z-raised pointer-events-none" style={{ top: ITEM_H, height: ITEM_H }} />
                {/* 項目清單（translateY 控制定位） */}
                <div
                    style={{
                        transform: `translateY(${translateY}px)`,
                        transition: isDragging ? 'none' : 'transform var(--dur-short) var(--ease-out)',
                        willChange: isDragging ? 'transform' : 'auto',
                    }}
                >
                    {items.map((item, idx) => (
                        <button
                            key={item}
                            type="button"
                            id={`${label}-${idx}`}
                            role="option"
                            aria-selected={idx === displayIdx}
                            tabIndex={-1}
                            className={`w-full flex items-center justify-center tabular-nums font-display font-black cursor-pointer t-press ${
                                idx === displayIdx ? 'text-primary text-3xl' : 'text-ink opacity-30 text-2xl [@media(hover:hover)]:hover:opacity-50'
                            }`}
                            style={{ height: ITEM_H }}
                            onClick={() => {
                                if (idx !== currentIdx) onChange(item);
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
