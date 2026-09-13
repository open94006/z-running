# fix(badminton)：修正記分板直向手機的排版

## 變更目的與背景

記分板固定 `grid-cols-2`，直向手機上兩隊各只有半個螢幕寬，分數字級被壓到 `text-4xl`，站遠看不清；外層又套 `max-w-4xl` + padding，在 AppLayout 已有內距的情況下形成雙重留白。

## 主要修改檔案與模組

- `client/src/pages/BadmintonScoreboard.tsx`（僅 className 調整，無邏輯變更）

## 核心邏輯調整說明

- 外層容器移除 `max-w-4xl mx-auto p-*`，改 `w-full`，由 AppLayout 統一控制邊距。
- 記分板 grid：直向 `grid-cols-1`、橫向或 md 以上 `grid-cols-2`；直向加 `min-h-[70dvh]` 讓兩隊區塊撐滿高度。
- 直向分數字級提到 `text-7xl`，隊名與雙打選手區塊間距同步放大（`portrait:mb-4`、`portrait:mt-6`）。
- 發球提示 Notice 改置中對齊，icon 去掉頂部偏移。

## 測試與驗證方式

- `npm run build` 通過。
- 純 Tailwind class 變更，無單元測試對應；建議在直向手機、橫向手機、桌機三種尺寸實機確認。

## 可能影響範圍與注意事項

- 使用 Tailwind v4 的 `portrait:`／`landscape:` variant，桌機視窗若寬 < 高也會走直向排版，屬預期行為。
- `70dvh` 在舊版 iOS Safari 會 fallback，最多只是高度略短，不影響操作。
