# feat(ui): 新增 UI 元件庫、跑步條件分析工具與紫外線指數整合

## 變更目的與背景

本次提交涵蓋三個相關聯的功能：

1. **UI 元件庫**：建立統一設計語言的基礎元件集，讓各頁面能複用一致的 Button、Card、Modal 等元件，減少重複 Tailwind class 並統一視覺風格。
2. **跑步條件分析工具**：新增 `runningCondition.ts`、`runnerAdvice.ts`、`sunTimes.ts` 三個工具模組，提供配速建議、水分補充建議、服裝建議、日出日落計算等功能。
3. **WeatherChecker 整合**：將跑步條件分析與 UV 預報整合進天氣查詢頁，讓使用者能在天氣頁直接取得跑步建議。

---

## 主要修改檔案與模組

### 新增檔案

| 檔案                                      | 說明                                                                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `client/src/components/ui/`               | UI 元件庫（Button、Card、Chip、Modal、Notice、Segmented、ScrollPicker、TextField、Tile、GuideCard、EmptyState、Readout、Badge、Tag） |
| `client/src/lib/runningCondition.ts`      | 跑步條件評估邏輯（AQI 分級、PM2.5 breakpoints、配速調整、pickBestSlotIndex）                                                         |
| `client/src/lib/runnerAdvice.ts`          | 跑者建議（水分補充、服裝選擇、風向轉換）                                                                                             |
| `client/src/lib/sunTimes.ts`              | 日出日落時間計算                                                                                                                     |
| `client/src/lib/runningCondition.test.ts` | runningCondition 單元測試                                                                                                            |
| `client/src/lib/runnerAdvice.test.ts`     | runnerAdvice 單元測試                                                                                                                |
| `client/src/lib/sunTimes.test.ts`         | sunTimes 單元測試                                                                                                                    |
| `client/src/pages/UiKit.tsx`              | UI 元件展示頁（開發用）                                                                                                              |

### 修改檔案

| 檔案                                       | 說明                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `server/src/services/cwa.service.ts`       | 新增 UV 指數預報（F-D0047-091）、修正數值型別轉換（Number() 強制轉型） |
| `server/src/services/weather.service.ts`   | 更新天氣資料結構，回傳 uvIndex / uvLevel 欄位                          |
| `client/src/pages/WeatherChecker.tsx`      | 整合跑步條件分析、UV 指數顯示、RunnerProfile 設定                      |
| `client/src/pages/BadmintonScoreboard.tsx` | 改用 UI 元件庫（Button、Card、Modal、Notice、TextField）               |
| `client/src/pages/RunningCalculator.tsx`   | 改用 UI 元件庫（Card、Segmented、Tag、TextField、Button、Readout）     |
| `client/src/pages/PitchingCalculator.tsx`  | 改用 UI 元件庫                                                         |
| `client/src/pages/WeightCalculator.tsx`    | 改用 UI 元件庫                                                         |
| `client/src/App.tsx`                       | 新增 UiKit 路由                                                        |
| `client/src/index.css`                     | 新增設計 token CSS 變數（`--color-*`、`bg-app` 等）                    |
| `client/package.json`                      | 新增依賴（例如 `clsx` 等）                                             |
| `.gitignore`                               | 新增 `.claude/` 至忽略清單                                             |
| `.roo/mcp.json`                            | 刪除（不再使用的 MCP 設定檔）                                          |

---

## 核心邏輯調整說明

### CWA UV 預報

- 使用 `F-D0047-091` 資料集取得各縣市逐 12 小時 UV 預報
- 由於 API 的 `locationName` 查詢參數實測無效（會回傳全部 22 縣市），改為快取整份回應後在程式端比對 `LocationName`
- 快取 TTL 沿用既有的 10 分鐘設定

### CWA 數值型別修正

- 實測發現 CWA API 回傳的 `AirTemperature`、`RelativeHumidity`、`WindSpeed` 執行期為字串（即使型別宣告為 `number`）
- 加入 `Number()` 強制轉型，避免露點公式等下游計算因字串相接而產生錯誤結果

### 跑步條件分析

- `getRunningCondition()`：依氣溫、體感溫度、濕度、風速、PM2.5、UV 計算整體跑步條件等級（優/良/可/差）
- `pickBestSlotIndex()`：從 6 小時預報中挑選最佳出發時間段
- `getPaceAdjustment()` / `applyPaceToAdjustment()`：依條件調整建議配速

---

## 測試或驗證方式與結果

- `client/src/lib/*.test.ts` 涵蓋 runningCondition、runnerAdvice、sunTimes 的單元測試
- 各頁面已在本機透過 `npm run client` 啟動後人工驗證 UI 外觀與互動

---

## 可能影響範圍與注意事項

- `index.css` 新增 CSS 變數（`--color-*` 系列），若有其他頁面使用衝突的 class 名稱需注意
- UV 預報功能需要後端 `CWA_API_KEY` 環境變數已正確設定，否則會靜默跳過（回傳 `null`）
- UiKit 頁面（`/ui-kit`）目前僅供開發展示，未加入主選單導航
- `.roo/mcp.json` 已刪除，若有其他成員使用 Roo 工具需自行重新配置
