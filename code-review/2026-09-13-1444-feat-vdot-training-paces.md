# feat(weather)：配速建議改為 Daniels VDOT 訓練配速

## 變更目的與背景

原本的「配速建議」只依「溫度+露點總和」把目標配速放慢 1–10%，資訊量低，且對不同距離的跑者一律套同一比例。

改為 Jack Daniels 的 VDOT 模型：由使用者的目標距離＋配速反推 VDOT，再換算輕鬆跑（E）／節奏跑（T）／間歇（I）三個訓練配速區間。溫度+露點分級保留，但降級為「悶熱分級」，只用於補水量與「建議日落後再跑」判斷。

## 主要修改檔案與模組

| 檔案                                      | 變更                                                                                                                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `client/src/lib/runningCondition.ts`      | 移除 `getPaceAdjustment`／`applyPaceToAdjustment`／`PaceAdjustment`；新增 `getHeatStressLevel`、`getTrainingPaces`、`HeatStressLevel`、`PaceRange`、`TrainingPaces`                                          |
| `client/src/lib/runningCondition.test.ts` | 對應改寫：悶熱四切點合併為一個 test；新增 VDOT 反推與 E>T>I 順序、10K 比賽配速落在 T 與 I 之間、距離越長 VDOT 越高                                                                                           |
| `client/src/lib/runnerAdvice.ts`          | `getHydrationAdvice` 改用 `getHeatStressLevel`，行為不變                                                                                                                                                     |
| `client/src/pages/WeatherChecker.tsx`     | 跑者設定由內嵌 Card 改為 Modal；新增「目標距離」Segmented（5K／10K／半馬／全馬）並持久化到 localStorage；配速卡改顯示 VDOT 與三區間；日出日落自配速卡拆出成獨立 GuideCard；地點搜尋結果加 focus-visible 樣式 |
| `client/src/index.css`                    | 四個評分色帶 L 由 46–50% 提到 53–58%，維持 `--score-ink` 對比 ≥ 4.6:1                                                                                                                                        |

## 核心邏輯調整說明

- **VDOT 反推**：Daniels–Gilbert（1979）公式，`VO2 = -4.6 + 0.182258v + 0.000104v²`，`%max = 0.8 + 0.1894393e^(-0.012778t) + 0.2989558e^(-0.1932605t)`，`VDOT = VO2 / %max`（v 為 m/min，t 為分鐘）。
- **訓練配速**：對目標 %VDOT 反解二次式取正根得速度，再轉秒/公里。區間依 Daniels' Running Formula：E 59–74%、T 83–88%、I 95–100%。
- **localStorage 相容**：舊版設定沒有 `targetDistanceKm` 時 fallback 到 10K，不會讀取失敗。
- **悶熱分級**：切點（≤37／≤43／≤49）與原本完全一致，只是不再回傳百分比與文案。

## 測試與驗證方式

- `npm test`：3 files、49 tests 全數通過。
- 驗證點：10K @ 5'00"/km → VDOT ≈ 40（Daniels 表 VDOT 40 ≈ 10K 49:48）；T 慢於比賽配速、I 快於比賽配速；全馬同配速的 VDOT 高於 5K。
- `npm run build`：tsc + vite 通過。

## 可能影響範圍與注意事項

- **API 移除**：`getPaceAdjustment`／`applyPaceToAdjustment` 已刪除，全案唯二呼叫端（WeatherChecker、runnerAdvice）已改寫；若有其他分支引用需同步。
- VDOT 是以「目標配速」而非「實際比賽成績」反推，若使用者填的是期望配速而非現況能力，區間會偏快——UI 文案已標示「目標」。
- 評分色帶變亮屬全站視覺變更，但只影響 WeatherChecker 的評分卡。
