---
name: jira-fix-comment
description: 依 Bug Fix 完成後的 spec.md 與 git 紀錄，產生並張貼「【Bug Fix 完成】」格式的 Jira 留言。TRIGGER when 使用者要求「留言到 Jira」「Jira 留言」「貼到 Jira 牌卡」「幫我留言這次修正」，且已有完成的 bug fix（spec.md + commit）。DO NOT TRIGGER 於 BSD 測報產出後（該情境依既有慣例不主動留言，見 P:\MEMORY feedback_no_jira_comment）除非使用者明確要求。
---

# Jira Bug Fix 留言產生器

依 ADP 專案既有留言風格（範例：James Wu 吳晉宇 於 ADPSITUAT-4799 的留言），把一次 bug fix 的根因、修改項目、commit 資訊整理成結構化留言，張貼到對應 Jira 票。

## 何時使用

- 使用者明確要求「幫我把這次修正留言到 Jira」「留言在 Jira 牌卡」等
- 前提：該 JIRA_ID 已有 `specs/feature/{JIRA_ID}/spec.md`（含根因分析）且已完成 commit（可能已 push）
- **不要**在 `/bsd-report` 或 `/adp-test-verify` 流程結束後自動觸發——ADP 慣例是使用者自行管理 Jira 留言，只有被明確要求才執行

## 執行步驟

### STEP 1 — 蒐集素材

1. 讀取 `specs/feature/{JIRA_ID}/spec.md`：取得根因分析、AC、修改項目、變更歷程
2. 在相關 repo（`adp-gi-ui` / `adp-policy` / `adp-knowledge`）執行 `git log --oneline -5` 與 `git show --stat <commit>` 取得：
   - Commit hash（短碼）
   - Branch 名稱
   - 異動檔案清單與行號（若 spec 已有精確位置就優先用 spec）
3. 若 session 過程有經歷除錯轉折（例如假設被推翻、多輪迭代才找到真因），從 spec 變更歷程或對話中萃取「最終根因」與「排除過程摘要」（**只寫最終結論，不要把每一輪失敗嘗試都寫進 Jira 留言**——Jira 留言面向團隊/PM，需要精簡結論；完整除錯過程留在 `P:\MEMORY\knowledge\lessons-learned.md`，不重複贴到 Jira）

### STEP 2 — 套用留言範本

```markdown
【Bug Fix 完成】{JIRA_ID} — {簡短標題（一行描述 bug 本質）}

根因
{用 1-3 段文字說明根因；若根因涉及多層/資料流，可用箭頭流程圖輔助，例如：
來源 X → 轉換/處理 Y → 觸發點 Z → 具體錯誤現象}

{若有明確觸發條件（如特定資料狀態、特定操作路徑），另起一行：}
觸發條件：{條件描述}

修改項目
| # | 位置 | 說明 |
|---|------|------|
| 1 | `{檔案路徑}`（line {行號}） | {這處修改做了什麼} |
| 2 | ... | ... |

Commit：`{commit_hash}`（branch: `{branch_name}`）
```

**風格要求**（比照範例）：
- 標題行固定用 `【Bug Fix 完成】{JIRA_ID} — {標題}` 開頭
- 根因段落用完整句子說明因果，技術術語可以出現（Jira 留言的讀者是技術同事/PM，跟 BSD 測報的「禁用技術術語」規則不同，這裡**可以**寫類別名稱、方法名稱、規則 ID）
- 修改項目一定用表格，欄位固定「# / 位置 / 說明」
- 結尾一定附 commit hash + branch，若已 push 到多個 repo，逐一列出

### STEP 3 — 確認後才張貼（人工把關）

1. 先把組好的留言內容完整輸出給使用者看（不要直接送出）
2. 明確詢問使用者是否確認張貼（這是會被團隊看到的公開留言，不可未經確認就送出）
3. 使用者確認後，用 `mcp__atlassian-jira-dc__jira_postIssueComment`（若工具尚未載入，先用 `ToolSearch` 搜尋 `select:mcp__atlassian-jira-dc__jira_postIssueComment`）張貼留言
4. 張貼成功後回報留言連結或確認訊息；若 MCP 顯示未連線，比照 `P:\MEMORY\knowledge\jira-mcp.md` 的踩雷清單，提示使用者可執行 `/mcp` 重新連線

## 注意事項

- 若同一個 bug 橫跨多個 repo（例如本次 ADPSITUAT-2066 只動 `adp-gi-ui`，但 ADPSITUAT-4799 動了 `adp-policy` 三個檔案），修改項目表格要涵蓋所有 repo 的異動，不要遺漏
- 不要在留言中貼入完整程式碼片段，只描述「做了什麼」，程式碼細節留在 commit diff 本身
- 若 bug fix 過程中有走過失敗的嘗試方向（如本次 ADPSITUAT-2066 的 3 輪迭代），Jira 留言只寫**最終根因與最終修法**，不需要交代中間嘗試過哪些方案——那是內部除錯記錄，不是對外溝通的內容
