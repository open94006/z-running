# refactor(ui): 重構 AppLayout 導覽列、色彩系統更新與跑步條件亮度擴充

## 變更目的與背景

本次提交以三個相互關聯的調整為核心：

1. **色彩系統更新**：將設計 token 從「低彩、霧藍基調」調整為「高彩、運動感」風格，使介面視覺層次更清晰。
2. **AppLayout 全面重構**：統一縮排風格（double-quote → single-quote、4 space indent），並精簡導覽列結構。
3. **runningCondition `brightness` 欄位**：回傳值新增 `brightness` 動態亮度數值，供前端依分數在同等級內呈現深淺變化。

---

## 主要修改檔案與模組

| 檔案                                      | 類型 | 說明                                                                                    |
| ----------------------------------------- | ---- | --------------------------------------------------------------------------------------- |
| `client/src/index.css`                    | 修改 | 色彩 token 全面更新（primary 改 #2563eb、success 改 #16a34a 等，dark mode 同步調整）    |
| `client/src/layouts/AppLayout.tsx`        | 修改 | 縮排與引號風格統一，ShuttlecockIcon SVG 結構精簡                                        |
| `client/src/lib/runningCondition.ts`      | 修改 | 各等級回傳值新增 `brightness`（0.85–1.10 浮點，依分數線性插值）；函式簽名改為單行格式   |
| `client/src/components/ThemeToggle.tsx`   | 修改 | justify-start、移除過渡動畫 class、隱藏文字標籤（改為僅顯示 icon）                      |
| `client/src/pages/PitchingCalculator.tsx` | 修改 | 響應式修正（padding、font-size、ArrowRightLeft 旋轉移至 class）                         |
| `client/src/pages/UiKit.tsx`              | 修改 | 擴充 UI 元件展示頁（新增色彩、元件示範區塊）                                            |
| `client/src/pages/WeatherChecker.tsx`     | 修改 | 移除 AqiLegend 元件、移除未使用的 import（Zap、Notice）、新增 skeleton 隨機數量工具函式 |

---

## 核心邏輯調整說明

### 色彩 token 更新

- **Light mode**：primary `#2563eb`（原 `#35748f`）、success `#16a34a`（原 `#4f9a72`）、app-bg `#f9fafb`（原 `#eef1f4`）
- **Dark mode**：對應調整為更飽和的暗色版本
- 所有頁面透過 CSS 變數自動套用，無需逐頁修改

### runningCondition brightness

```ts
const calcBrightness = (s: number, min: number, max: number) =>
  parseFloat((0.85 + ((s - min) / (max - min)) * 0.25).toFixed(2));
```

- excellent（80–100）→ brightness 0.85–1.10
- good（60–79）→ brightness 0.85–1.10
- fair（40–59）→ brightness 0.85–1.10
- poor（0–39）→ brightness 0.85–1.10

前端可用 `filter: brightness(result.brightness)` 讓同等級卡片依實際分數呈現深淺差異。

### WeatherChecker 清理

- 移除 `AqiLegend` inline 元件（已有其他展示方式）
- 新增 `getRandomLoadingSkeletonCount()`：依裝置寬度回傳 mobile/desktop 適量 skeleton 數量

---

## 測試或驗證方式與結果

- 本機執行 `npm run client` 驗證各頁面色彩顯示正確
- 人工驗證 dark mode 切換後色彩 token 正常套用
- PitchingCalculator 在 mobile viewport 確認響應式排列正確

---

## 可能影響範圍與注意事項

- `index.css` 色彩 token 全站生效，若有任何頁面使用硬碼顏色（非 token）可能出現視覺不一致
- `runningCondition.ts` 回傳值新增 `brightness` 欄位，呼叫方不需修改（新增欄位不 breaking），但若要使用需自行讀取
- `ThemeToggle` 移除文字標籤，若其他地方有用到 `showLabel` prop 的地方需確認 UI 仍可接受
- UiKit 頁面為開發展示用，不影響正式功能
