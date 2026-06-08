# EARS 語法（Easy Approach to Requirements Syntax）

## 語法類型

| 類型 | 語法模式 | 適用場景 |
|------|---------|---------|
| 事件驅動 | When `<觸發事件>`，the system shall `<回應>` | 使用者操作觸發的行為 |
| 狀態驅動 | While `<系統狀態>`，the system shall `<回應>` | 特定狀態下持續的行為 |
| 條件選擇 | If `<條件>`，then the system shall `<回應>` | 依條件分支的行為 |
| 功能選配 | Where `<功能特性>`，the system shall `<回應>` | 僅特定功能啟用時的行為 |
| 複合條件 | While `<狀態>`，when `<觸發>`，the system shall `<回應>` | 狀態 + 事件組合 |

## 範例

### 查詢區行為

```markdown
- When 使用者按下「查詢」按鈕，the system shall 驗證必填欄位後呼叫查詢 API，
  以分頁表格顯示結果，每頁預設 10 筆
- If 必填欄位未填，then the system shall 於該欄位下方顯示紅色錯誤提示，
  不發送 API 請求
- If 結束日早於起始日，then the system shall 顯示 Toastr 警告「結束日不得早於起始日」
```

### 結果區行為

```markdown
- When 查詢 API 回傳成功，the system shall 以分頁表格顯示結果
- When 查詢 API 回傳錯誤，the system shall 清空查詢結果並由攔截器顯示錯誤通知
- While 查詢結果存在，the system shall 顯示分頁元件與操作按鈕
```

### 勾選功能

```markdown
- When 使用者勾選表頭全選 checkbox，the system shall 選取當前分頁所有可選項目
- When 使用者取消表頭全選 checkbox，the system shall 僅移除當前分頁項目，保留其他分頁選取
- Where 項目不符合勾選條件，the system shall 禁用該項目的 checkbox
```

### 離開提示行為

```markdown
- While 表單有未儲存的異動，when 使用者嘗試離開頁面，the system shall 顯示確認對話框
- If 使用者處於唯讀模式，then the system shall 直接放行離開，不顯示提示
```

## 撰寫原則

1. **一個 EARS 語句描述一個行為**，不合併多個行為
2. **回應部分要具體可驗證**：「顯示紅色錯誤提示」而非「顯示提示」
3. **條件要明確**：「結束日早於起始日」而非「日期不正確」
4. **區分事件 vs 狀態**：按鈕點擊用 When、持續狀態用 While
5. **避免重複基底類別行為**：分頁切換、Session 暫存等由基底處理的不寫入
