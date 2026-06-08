# 領域名詞表

> 收錄跨專案、跨 session 會反覆出現的名詞。專案專屬術語若只在單一 family 使用，優先留在對應 `projects/` 頁面。

## 專案與結構

- **Project family**：Vault 目前採用的專案分層單位，如 `Core`、`PA`、`POS`、`ESP`。Session 啟動時先定位 family，再視需要進入 leaf page。
  - **CORE** = 理賠（JIRA prefix: `BMPCORE-*`）
  - **PA** = 保費（JIRA prefix: `BMPPA-*`）
  - **POS** = 保全（JIRA prefix: `BMPPOS-*`）
  - **ESP** = 外部服務平台（無固定 JIRA prefix）
- **Leaf page**：family 底下的子專案頁，例如 `projects/pos/pos-ui.md`、`projects/core/core-api.md`。
- **Folder Notes**：以資料夾同名 `.md` 當作入口 Hub 的 Obsidian 結構模式，例如 `projects/pos/pos.md`、`knowledge/knowledge.md`。

## 開發與流程

- **Spec-Kit**：以 spec → clarify → plan → tasks → analyze/checklist → implement 為主軸的規格驅動工作流；主要成熟度在 POS family。
- **BSD 測報**：給非技術業務 User 閱讀的測試報告，描述需以畫面元素與使用情境為主，不用技術術語。
- **Knowledge-first routing**：session 開始時先讀 `knowledge/knowledge.md` 與對應 knowledge map，再讀 family `status.md`；目的是先建立背景理解，再補工作狀態。
- **Operational notes**：可直接支援 session 啟動與任務追蹤的工作筆記，例如 family status、leaf page 的查找重點與狀態摘要。

## 資安掃描工具

> 專案弱點掃描（弱掃）採用三類工具，每次掃描週期需分別提交修正。

- **Checkmarx One SAST**（白箱 / 靜態分析）：掃描原始碼結構與資料流，偵測常見安全弱點（如 SQL Injection、XSS）。掃描速度快、可整合 CI/CD 管線，支援 AI 輔助修補建議。
- **Checkmarx One SCA**（套件掃描 / 軟體組成分析）：掃描第三方開源套件弱點（CVE）、授權合規、惡意套件，具傳遞依賴（transitive dependency）與可達路徑（reachability）分析。資料庫含 41 萬筆惡意套件紀錄。
- **WebInspect**（黑箱 / DAST 動態測試）：同一產品歷經 HP → Micro Focus → OpenText 三次易主，別名有 Fortify WebInspect、OpenText DAST，本質相同，統一稱 **WebInspect**。在應用程式執行期模擬真實攻擊，偵測執行時期弱點，透過 tracko 系統設定掃描 URL 與 port（UAT 環境）。

## 環境與交付

- **SIT / UAT**：測試環境階段縮寫；在狀態頁中通常表示部署與驗收進度。
- **releasevX.Y.Z**：版本合併或部署目標標籤，用於記錄 ticket 佈署批次。

## 維護規則

- **知識蒸餾**：把單次工作中可重用的經驗升級到 `knowledge/`；情境性經驗寫 `lessons-learned.md`，持久規則寫 `conventions.md`。
- **非刪除式整併**：重構 IA 時，先收斂活文件與回指，再移除舊入口；原始 session 歷史統一保留於 `journal/log.md`。
- **活文件與歷史分離**：operational notes（如 status.md）只保留當前狀態；已完成事項移至 `journal/`，長期脈絡放 `history.md`。

## 更新觸發條件

- 新增跨專案高頻名詞。
- 現有名詞的定義、用途或適用範圍改變。
- 某個名詞已退場或被新術語取代。