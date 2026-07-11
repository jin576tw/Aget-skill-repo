# Git 慣例（分支 / Commit / 衝突 / 歷程追查）

## Commit 格式

```
[單號][type] 變更說明
```

- 有 Jira 單號：`[BMPPOS-20][feat] 調整變更文件調整`
- 無單號：以日期取代，`[20260620][infra] update dockerfile`
- 變更說明繁體中文為主（infra/工具類允許英文）、長度 ≤ 50 字、type 全小寫
- Breaking change：說明後加 `[BREAKING]`，PR 描述補影響範圍

| Type | 用途 |
|------|------|
| `feat` | 新增功能 / 業務邏輯異動 |
| `fix` | 修復 bug |
| `style` | 外觀變更（不影響邏輯） |
| `refactor` | 重構 |
| `infra` | Dockerfile、CI/CD、CLAUDE.md、env |
| `spec` | 規格文件 |
| `docs` | 說明文件（README 等） |
| `test` | 測試 |
| `chore` | 套件升級、版本號等雜務 |

⚠️ **某些專案（如 ADP 系）明文禁止 conventional commits 的 `type(scope): msg` 格式**，必須用上述 `[單號][type]` 格式——先查 vault `knowledge/conventions.md` 該專案段落。

## 分支

- 命名與來源分支為專案特定規則，權威來源：vault `projects/{family}/status.md` Decisions 段
- 通用模式：開發前 `git fetch origin && git checkout {來源分支} && git pull`，再拉工作分支；例：`{員編}/TGL-{Jira單號}`

## Merge / Rebase 衝突

### 規格文件「變更歷程」表格衝突（append-only 型）

- 預防：`.gitattributes` 對 `specs/**/*.md` 啟用 `merge=union`
- 手動解法：以欄位最多的表頭為準 → 舊列補 `—` 占位 → 按日期合併兩側歷程列 → 刪 conflict marker → `git add`

### 程式碼衝突（同欄位 setter 型）

ours/theirs 各有一行對同名欄位的 `setXxx()` 時：

1. 先判斷兩行是否針對**不同物件**（如 `insuredUwCmd` vs `insuredCmd`）——是則兩行都保留
2. 順序以**業務邏輯連續性**為優先（如必須連續的賦值 pattern 不可被插行拆開），不以行數為優先
3. 解完衝突重跑該區塊相關測試

## 歷程追查

- **`git log -S "<字串>" --oneline`**：列出所有新增或刪除該字串的 commit——比 `git log --grep`（只搜 message）更精確。典型場景：確認某卡控條件何時引入、是否曾被移除。
- 再用 `git show <hash>` 看完整 diff 確認是新增還是刪除。
