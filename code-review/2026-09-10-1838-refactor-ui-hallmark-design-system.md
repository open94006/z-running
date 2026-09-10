# refactor(ui)：導入 Hallmark 編輯風設計系統

## 變更目的與背景

原本的 UI 色彩散落在各元件的 Tailwind arbitrary value（`from-[#16a34a]`、`text-[#333]` 之類）中，改一次配色要掃過十幾個檔案，深色模式也是各處手寫 `dark:` 補丁。

這次以 `hallmark redesign` 產出一套鎖定的設計系統（editorial genre／Sport roman theme），把顏色、間距、字級全部收斂成 CSS 變數 token，元件只引用 token 名稱。同時建立 `design.md` 作為後續改版的唯一依據，`tokens.css` 作為可攜出的 token 匯出檔。

## 主要修改檔案與模組

| 範圍         | 檔案                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 設計系統文件 | `design.md`（新增）、`tokens.css`（新增）                                                                                                                     |
| Token 定義   | `client/src/index.css`（+592/-…，light + dark 全套 token、utility class）                                                                                     |
| 版面         | `client/src/layouts/AppLayout.tsx`、`client/src/components/Footer.tsx`、`client/src/components/ThemeToggle.tsx`、`client/src/components/AlertContext.tsx`     |
| UI 元件庫    | `client/src/components/ui/` 下 13 個元件（Badge、Button、Chip、EmptyState、GuideCard、Modal、Notice、Readout、ScrollPicker、Segmented、Tag、TextField、Tile） |
| 頁面         | `client/src/pages/WeatherChecker.tsx`、`BadmintonScoreboard.tsx`、`UiKit.tsx`                                                                                 |
| 邏輯         | `client/src/lib/runningCondition.ts`（僅回傳的 class 名稱）                                                                                                   |
| 其他         | `client/index.html`（字型／meta）、`.gitignore`（忽略 `.hallmark/`）、刪除未使用的 `client/src/App.css`、`client/src/assets/react.svg`                        |

## 核心邏輯調整說明

- **色彩全面 token 化**：所有顏色改以 oklch 定義於 `:root` 與深色模式覆寫，元件端只寫語意名稱（`bg-surface`、`text-ink-muted`、`bg-score-good`）。每個實心底色都配一個對應的 `-ink` 前景 token，確保對比不靠 text-shadow 硬撐。
- **跑步評分色帶改實心**：`runningCondition.ts` 的 `color` 由漸層字串（`from-[#16a34a] to-[#34d399]`）改為單一 class（`bg-score-excellent` 等四級）。**純呈現層變更，評分計算、門檻、`brightness` 全部未動。**
- **深色模式**：由各元件手寫 `dark:` 改為在 token 層一次切換，元件不再感知主題。
- **編輯風規範**：移除玻璃擬態、漸層藥丸按鈕、卡中卡等寫法；標題以字重與字寬表現而非斜體。
- **UiKit 頁面**：改寫為此設計系統的實際展示頁，每個 section 標註對應 token。

## 測試與驗證方式

- `npm run build`（`tsc -b && vite build`）於 `client/` 執行通過，1745 modules transformed，無型別錯誤。
- 產出：`index.css` 56.62 kB（gzip 10.36 kB）、`index.js` 352.83 kB（gzip 111.93 kB）。
- 敏感資訊掃描：對本次 diff 與新增檔案掃 API key／secret／password／連線字串／內部 IP，命中項全為設計系統的「design token」字樣，無實際敏感資訊。

## 可能影響範圍與注意事項

- **全站視覺變更**，非單一頁面。建議合併後在淺色與深色模式下各走一遍 WeatherChecker、BadmintonScoreboard、UiKit 三頁。
- 顏色使用 **oklch**，需要現代瀏覽器支援；舊版 Safari／Chrome 會 fallback 失色。
- `runningCondition.ts` 的 `color` 欄位語意改變：**不再是 gradient stop，而是完整的 background class**。若有其他地方把它拼進 `bg-gradient-to-r` 使用，需一併調整（本次已檢查現有呼叫端）。
- 刪除了 `App.css` 與 `react.svg`，若有未追蹤的分支引用需注意。
- 後續改版請**先讀 `design.md`**，需要新增樣式時是擴充該文件，而不是在元件內寫死數值。
