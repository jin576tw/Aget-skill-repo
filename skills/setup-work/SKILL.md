---
name: setup-work
description: 首次準備、更新或修復 Aget 工具、CLAUDE.md／AGENTS.md 與選用 hooks；不是日常開發啟動步驟。
---

# setup-work

## 完成目標

目標專案具有可發現的 skills、可執行 Node 工具及薄規範；保留人工設定及其他工具。

使用 plugin 根目錄的 `node scripts/setup-work.mjs --target <project> --platform both`；檢查用 `--check`。user scope 加 `--scope user --target <user-home>`，使用各宿主的使用者規範位置。只有需要紀錄事件時加 `--hooks`。Node >=18，核心不需 npm 依賴；缺 Node 時使用環境既有受信任套件管理器，不另安裝私有 runtime 或修改整機 PATH。文件轉換的選用依賴僅在需求確立時安裝到專案，不預設全域 npm install。

## 驗收與邊界

檢查模式可核對完整受管理檔案與發現位置。重跑不重複區塊或 hooks；手動修改的受管理檔案報衝突，不覆蓋。更新移除的項目只按上一份安裝清單處理；首次遇到無清單的舊工具，先核對來源 hash 再移除，不能整個清空使用者工具目錄。

Codex 與 Claude 使用自己的 hook 設定；Codex 的專案信任與 hook 信任仍由宿主處理。新增設定要在新 session 生效；檔案可見不代表模型一定觸發。

參考 [安裝及 runtime](../../docs/runtime.md)。Aget 專業 Agent 定義供 Claude 使用；Codex 可由主會話或宿主內建 Agent 配合相同 skills，不安裝不相容的 Agent 格式。
