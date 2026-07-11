# 交付檢查清單（開發完成 → 交 QA）

> 完成 feature / fix 後主動執行，不等 user 詢問。純 spec / infra / chore 類 commit 或 user 明說跳過時不觸發。

## 1. 本地驗證收尾

- [ ] 相關 unit / IT 測試通過；測試風格符合專案慣例（先查 vault：有的專案禁止新增 `@SpringBootTest`，只用純 Mockito）
- [ ] formatter 自動改寫的格式 diff 已隨 commit 進（`[{票號}][chore] apply code formatter`）
- [ ] commit 格式符合 [git-conventions.md](git-conventions.md)

## 2. 測試報告

依 spec 的 AC 清單產出：

| AC | 說明 | 測試層級 | 實作 commit | 狀態 |
|----|------|---------|------------|------|
| AC-XX | 驗收條件簡述 | Unit / Manual / N/A | `commitHash` | ✅/❌/⬜ |

- 報告末尾提示哪些 AC 需手動驗收、哪些 Unit test 未補
- 需要正式 BSD 測報 docx 時用 `/bsd-report` skill（閱讀者為非技術 user，禁技術術語）

## 3. 手動測試說明

- 一律以**選單名稱、頁籤、按鈕文字**描述步驟；禁止 DB ID、API endpoint、query param、元件名
- 先查知識庫對應功能的流程文件（如 FLOWCHART.md / SA.md）找畫面流程再寫

## 4. 推送與 MR

- [ ] push 工作分支（force push 用 `--force-with-lease`）
- [ ] 建立 MR，指向專案規定的目標分支（查 vault Decisions）

## 5. Jira 收尾

- [ ] 測報/證據附件上傳（見 [jira-ops.md](jira-ops.md)）
- [ ] Bug fix 留言（`/jira-fix-comment` skill）
- [ ] 依專案流程 transition 票況（交 QA / 待驗）

## 6. 知識庫回寫

- [ ] 踩坑/新確認的事實蒸餾回 vault（lessons-learned / conventions / status.md）
- [ ] 功能缺分析文件時至少補修正摘要（BUSINESS-RULES.md）
