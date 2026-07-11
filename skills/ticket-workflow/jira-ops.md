# Jira 工具操作（Data Center + MCP）

## MCP 可用工具範圍

`@atlassian-dc-mcp/jira` 提供：getIssue / searchIssues / createIssue / updateIssue / postComment / getComments / getTransitions / transitionIssue。**不含附件上傳與圖片讀取**。

## 附件下載（看截圖）

用既有 `/jira-get-attachments` skill（PAT + curl + Read tool，含 PNG magic bytes 驗證與 PAT 失效判斷）。

## 附件上傳（MCP 沒有 addAttachment，走 REST API）

```
POST <JIRA_BASE_URL>/rest/api/2/issue/{issueKey}/attachments
Header: X-Atlassian-Token: no-check   ← 必要，缺少則 CSRF 保護回 403
Header: Authorization: Bearer <PAT>
Content-Type: multipart/form-data
Body: file=@<本地檔案路徑>
```

curl 範例（單行執行，禁止換行）：

```bash
curl -k -L -X POST -H "X-Atlassian-Token: no-check" -H "Authorization: Bearer $PAT" -F "file=@<路徑>" "<JIRA_BASE_URL>/rest/api/2/issue/{issueKey}/attachments"
```

- PAT 取得方式與保護原則同 `/jira-get-attachments` skill（只用於 curl，不輸出、不寫檔、不入記憶庫）

## Bug fix 完成留言

用既有 `/jira-fix-comment` skill（從 spec.md + git history 組「【Bug Fix 完成】」留言）。

## 疑難排解

| 症狀 | 處理 |
|---|---|
| ToolSearch 找不到 Jira MCP 工具（顯示未連線） | 先請使用者執行 `/mcp` 重連（偶發斷線很常見），恢復後重試；再不行才排查 `claude mcp add` 設定/憑證 |
| MCP Server `fetch failed: unable to verify the first certificate` | Jira DC 自簽憑證；`claude mcp add` 時以 `-e NODE_TLS_REJECT_UNAUTHORIZED=0` 傳入（僅限可信內部 host） |
| `claude mcp add` 後 args 解析異常 | 指令必須單行執行，換行會使 `-y`/套件名脫離 args |
| 上傳回 403 | 缺 `X-Atlassian-Token: no-check` header |
