# refactor(ui): 微調跑步條件與主題色彩

## 變更目的與背景

本次調整屬於視覺與可讀性微調，目的在讓運動條件與介面主色在整個應用中更一致，並讓跑步條件卡片的色階更貼近目前的設計語言。

---

## 主要修改檔案與模組

| 檔案                                  | 說明                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| `client/src/index.css`                | 更新 `blue/red/orange` 的 700 色階，以及 `--primary-hover`，讓主題色在 hover 與語意色上更一致 |
| `client/src/lib/runningCondition.ts`  | 調整 `excellent` / `good` / `fair` / `poor` 的 gradient 色票                                  |
| `client/src/pages/UiKit.tsx`          | 同步更新跑步條件展示範例的配色                                                                |
| `client/src/pages/WeatherChecker.tsx` | 對應目前的條件色階與 UI 展示調整                                                              |

---

## 核心邏輯調整說明

- `index.css` 的主題色階從較偏藍紫的 hover 色，改為更接近主色的 `#174feb`。
- `runningCondition.ts` 的各等級顏色改為更鮮明、對比更高的組合：
  - `excellent`: 綠色系改為 `#16a34a` → `#34d399`
  - `good`: 藍色系改為 `#174feb` → `#60a5fa`
  - `fair`: 橘色系改為 `#da6627` → `#fb923c`
  - `poor`: 紅色系改為 `#c82929` → `#f87171`
- `UiKit` 與 `WeatherChecker` 的展示資料同步，避免實際功能與示範頁面色彩不一致。

---

## 測試或驗證方式與結果

- 已確認目前只涉及 4 個檔案，且沒有新增敏感資訊。
- 變更屬色彩字串調整，未引入新的控制流程或 API 依賴。

---

## 可能影響範圍與注意事項

- 所有依賴 `--primary-hover` 或 `runningCondition.color` 的畫面都會受到視覺變化影響。
- 若後續要再微調 UI 對比，應優先同步 `UiKit` 與實際頁面，避免展示與功能脫鉤。
