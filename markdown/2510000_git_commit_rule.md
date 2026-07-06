# Git Commit Rules for AI Agent

> 本文件定義 AI agent 執行 `git add` 與 `git commit` 的所有規則與判斷條件。
> 如果判斷條件沒問題，則執行 `git push`
> **在執行任何 git 操作前，必須完整閱讀並遵守本文件。**
>
> ⚠️ **絕對禁止** 使用 `git push --force` 或 `git push -f` 等任何形式的強制推送。
> 如遇到 push 被拒絕，應停止操作並回報，由人工確認後再行處理。

---

## 1. 何時可以 commit

只有在以下條件**全部成立**時，才允許執行 commit：

- [ ] 本次被指派的功能或任務已**完整實作完成**
- [ ] 相關功能的程式碼已可正常運作，不存在明顯的執行錯誤
- [ ] 所有與本次任務相關的檔案修改均已納入暫存區（`git add`）
- [ ] 尚未對此功能執行過 commit（避免重複提交）

> **禁止**在功能做到一半、或僅完成部分子任務時 commit。
> 若任務尚未完成，請繼續實作，不要提前 commit。

---

## 2. git add 規則

### 2.1 允許加入暫存區的檔案

只加入與本次任務**直接相關**的檔案：

- 新增或修改的程式碼檔案（`.ts`、`.tsx`、`.js` 等）
- 新增或修改的設定檔（需確認無敏感資訊）
- 新增或修改的樣式檔、型別定義、測試檔
- 本次任務新增的靜態資源

### 2.2 絕對禁止加入暫存區的檔案

以下檔案**永遠不得**執行 `git add`：

```text
.env
.env.local
.env.*.local
.env.development
.env.production
.env.test
*.pem
*.key
*.cert
*.p12
*secret*
*credential*
```

### 2.2.1 例外白名單

以下項目屬於既有憑證資源白名單，**可通過檢查**：

- `xxx`

> 上述白名單僅適用於既有專案路徑，不得延伸到其他目錄或新命名的敏感檔案。
> 若發現上述檔案已被追蹤（tracked），應立即停止操作並回報，不可自行處理。

### 2.3 加入前的自我檢查

執行 `git add` 前，必須先執行 `git status` 確認變更清單，逐一核對每個檔案是否符合規則。

---

## 3. commit message 規則

### 3.1 格式

嚴格遵守 **Conventional Commits** 規範，並符合 `.husky` 的 commit 規定：

```text
<type>(<scope>): <subject>

[optional body]
```

- `type` 與 `scope` 使用英文小寫
- `subject` 使用**繁體中文**描述本次變更內容
- subject 結尾不加句號
- 若有必要說明背景或細節，在 body 補充（空一行後撰寫）

### 3.2 type 對照表

| type       | 使用時機               |
| ---------- | ---------------------- |
| `feat`     | 新增功能               |
| `fix`      | 修復 bug               |
| `refactor` | 重構（不影響功能）     |
| `style`    | 格式調整（不影響邏輯） |
| `chore`    | 設定、依賴、工具調整   |
| `docs`     | 文件更新               |
| `test`     | 新增或修改測試         |
| `perf`     | 效能優化               |
| `revert`   | 還原先前 commit        |

### 3.3 scope 建議值

依照專案模組命名，例如：

`order`、`product`、`auth`、`cart`、`shipping`、`email`、`api`、`ui`、`db`

### 3.4 commit message 範例

```text
feat(order): 新增訂單狀態自動更新功能

當訂單狀態變更時，同步觸發 webhook 通知並更新快取。
```

```text
fix(cart): 修正購物車數量計算在邊界值的錯誤
```

```text
refactor(api): 將訂單查詢邏輯抽離為獨立 service
```

---

## 4. 敏感資訊檢查

在執行 commit 之前，必須對本次所有暫存檔案進行以下確認：

- 程式碼中不含任何 API Key、Token、Password 的明文字串
- 不含任何資料庫連線字串（含帳號密碼）
- 不含任何內部 IP 位址或私有端點 URL
- 設定值應透過環境變數引用（`process.env.XXX`），而非寫死

> 若發現任何疑似敏感資訊，**立即停止 commit 並回報**，等待人工確認。

---

## 5. commit 前 code-review 文件規格

在確認程式碼與暫存內容皆無問題後、執行 `git commit` 之前，必須先在專案根目錄的 `code-review/` 建立一份給工程師閱讀的變更說明 Markdown。

### 5.1 檔名命名規則

檔名必須使用時間戳與 commit 類型，格式如下：

```text
yyyy-mm-dd-hhmm-<type>-xxx.md
```

- `yyyy-mm-dd-hhmm`：台灣時間 24 小時制時間戳
- `<type>`：對應本次 commit type，使用 3.2 定義的常見類型前綴（例如 `feat`、`fix`、`refactor`、`docs`、`chore`）
- `xxx`：本次功能名稱或修正主題（以 `-` 連接英文關鍵字）

範例：

```text
2026-04-17-1930-feat-member-group-config.md
2026-04-17-2010-fix-member-group-query.md
2026-04-17-2100-refactor-member-group-service.md
```

### 5.2 文件內容要求

文件需以工程師可快速理解為目標，至少包含：

- 變更目的與背景
- 主要修改檔案與模組
- 核心邏輯調整說明
- 測試或驗證方式與結果
- 可能影響範圍與注意事項

### 5.3 格式化文件

code-review markdown 建立後，必須執行一次 prettier 格式化。

格式化完成後，必須確認該檔案已無進一步修改（例如使用 prettier --check 或檢查 git diff）。

若 prettier 有產生變更，需將該 code-review 檔案重新加入暫存區後，才能進行 commit。

---

## 6. 執行流程（SOP）

```Mermaid
1. 確認任務是否已完整完成
        ↓ 是
2. 執行 git status，檢視所有變更檔案
        ↓
3. 逐一確認每個檔案：
   - 是否與本次任務相關？
   - 是否為禁止 commit 的敏感檔案？
        ↓ 全部通過
4. 執行 git add <相關檔案>（禁止使用 git add .）
        ↓
5. 再次執行 git status 確認暫存區正確
        ↓
6. 掃描暫存內容是否含敏感資訊
        ↓ 無異常
7. 在專案根目錄 code-review/ 建立時間戳命名的 markdown 變更說明
        ↓
8. 對該 code-review markdown 執行 prettier
        ↓
9. 確認 prettier 執行後該檔案已無進一步修改
        ↓
10. 若 prettier 有修改，重新執行 git add <code-review 檔案>
        ↓
11. 依照 Conventional Commits 格式撰寫 commit message
        ↓
12. 執行 git commit -m "<message>"
        ↓
13. 回報 commit 完成，附上 commit hash 與 message
```

---

## 7. 禁止行為清單

| 禁止行為                                              | 原因                                       |
| ----------------------------------------------------- | ------------------------------------------ |
| `git add .` 或 `git add -A`                           | 可能誤加敏感檔案或不相關變更               |
| 功能未完成就 commit                                   | 違反大顆 commit 策略                       |
| commit message 使用模糊描述（如 `update`、`fix bug`） | 無法追溯變更意圖                           |
| 在 commit 中包含 `.env` 相關檔案                      | 敏感資訊洩漏風險                           |
| **任何形式的 `git push --force`**                     | **嚴禁。會摧毀他人工作，造成不可逆的後果** |
| **任何形式的 `git push -f`**                          | **嚴禁。會摧毀他人工作，造成不可逆的後果** |
| 未經確認直接推送                                      | 需要確認分支、目標及影響範圍               |

---

## 8. 異常狀況處理

遇到以下情況時，**停止操作並回報給使用者**，不可自行決定：

- 發現敏感資訊已存在於 git 歷史中
- 不確定某個檔案是否應該納入本次 commit
- 任務範圍不明確，無法判斷功能是否完成
- 遇到 merge conflict
- **遇到 push 被拒絕的情況（如 non-fast-forward 錯誤）**

---

## 9. git push --force 零容忍政策

### 9.1 絕對禁止使用

**以下命令絕對禁止執行**：

```bash
git push --force
git push -f
git push --force-with-lease
git push --no-verify
```

### 9.2 為什麼禁止

- 會直接覆蓋遠端分支的提交歷史
- 可能導致他人的本地分支與遠端不同步
- 造成 CI/CD 流程中斷
- 無法追溯被覆蓋的變更紀錄
- 可能誤刪他人工作成果

### 9.3 如果遇到 push 被拒絕

**第一步**：停止操作

**第二步**：執行以下診斷命令

```bash
git status
git log --oneline -5
git pull --dry-run
```

**第三步**：回報以下資訊

- 被拒絕的錯誤訊息完整內容
- 當前分支名稱
- 最近 5 個 commit 的 hash 與 message
- 本次變更涉及的檔案清單

**第四步**：等待人工確認後再執行 `git pull` 或其他操作
