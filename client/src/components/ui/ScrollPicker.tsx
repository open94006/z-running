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
 * 消除浮點偏移造成的數字錯位。支援觸控拖曳及點擊。
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

    return (
        <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-ink-muted font-semibold">{label}</span>
            {/* 容器高度由 JS 計算，確保與 ITEM_H 完全對齊 */}
            <div
                className="relative overflow-hidden rounded-xl bg-surface border border-border shadow-sm select-none touch-none"
                style={{ width: 80, height: ITEM_H * 3 }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* 上漸層遮罩 */}
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-surface to-transparent z-10 pointer-events-none" style={{ height: ITEM_H }} />
                {/* 下漸層遮罩 */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface to-transparent z-10 pointer-events-none" style={{ height: ITEM_H }} />
                {/* 中央選取高亮帶 */}
                <div className="absolute inset-x-1.5 rounded-lg bg-primary/10 border border-primary/20 z-10 pointer-events-none" style={{ top: ITEM_H, height: ITEM_H }} />
                {/* 項目清單（translateY 控制定位） */}
                <div
                    style={{
                        transform: `translateY(${translateY}px)`,
                        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        willChange: 'transform',
                    }}
                >
                    {items.map((item, idx) => (
                        <div
                            key={item}
                            className={`w-full flex items-center justify-center tabular-nums font-black transition-colors duration-100 ${
                                idx === displayIdx ? 'text-primary text-2xl' : 'text-ink opacity-25 text-xl cursor-pointer hover:opacity-40'
                            }`}
                            style={{ height: ITEM_H }}
                            onClick={() => {
                                if (idx !== currentIdx) onChange(item);
                            }}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
