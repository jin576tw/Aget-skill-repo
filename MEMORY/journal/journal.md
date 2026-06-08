# Journal — 工作日誌

> `journal.md` 是 journal 入口；`journal/log.md` 記錄 session 日誌，`journal/todo-list.md` 提供跨專案待辦與工作進度總覽。

---

## 入口

- [[journal/log|工作日誌]]
- [[journal/todo-list|Todo List]]

---

## 使用規則

- 所有新的 session 條目一律寫入 `journal/log.md`
- 跨專案待辦與工作進度總覽維護於 `journal/todo-list.md`
- `journal/log.md` 依日期倒序排列，最新條目在上
- 條目格式：`[YYYY-MM-DDThh:mm:ss.SSS+08:00][專案名] 描述`
- 多專案操作可並列標籤，如 `[POS-UI][PA-UI]`
- 超過 90 天的條目需先蒸餾，再依規則清理

---

## 更新觸發條件

- Session 結束時新增當次完成事項
- `/save` 或 session 結束時，視需要同步更新 `journal/todo-list.md` 的對應專案區塊
- 每三個月清理過期條目（蒸餾後刪除）
- 調整 journal 結構時，需同步更新引用 `journal/` 路徑的 Hub、知識檔與 workspace 指引
