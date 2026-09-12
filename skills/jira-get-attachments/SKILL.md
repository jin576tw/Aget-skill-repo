---
name: jira-get-attachments
description: 讀取任務相關的 Jira 附件、截圖與文件，核對實際功能入口及問題證據。
---

# jira-get-attachments

## 完成目標

取得相關附件並辨識它支持的畫面、入口、訊息或資料；檔名與票務摘要是線索，不等於實際功能證據。

## 驗收與邊界

使用可用 Jira connector 或已配置且受信任的附件端點。需要本機下載時以 HTTP 狀態、content type 及 magic bytes 排除 HTML 登入頁；TLS 預設驗證，不帶憑證追蹤到未核准主機。不輸出 token 或將其寫入知識庫。

只下載相關附件；圖片用視覺工具讀取，Word／PDF／表格用對應能力。不可取得或讀取失敗時回報缺口，不以推測冒充看過。沒有設定 connector 或認證時處理缺失，不假設固定 PAT 檔案及本機路徑。
