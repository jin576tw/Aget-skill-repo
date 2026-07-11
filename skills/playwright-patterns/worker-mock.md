# Web Worker Mock 模式（PDF worker 類）

## Blob URL Worker 內禁再呼叫 `URL.createObjectURL()`

以 `addInitScript` 覆蓋 `window.Worker`、建立 Blob URL Worker 後，若在該 Worker 腳本內再呼叫 `URL.createObjectURL(innerBlob)`，Chromium 因 blob worker origin 為 `null` 拋 `SecurityError` → Worker 整體崩潰、後續 `postMessage()` 全部不執行、主頁面按鈕永遠 disabled。

**修正選項**：
1. 改用 data URL 回傳完成訊息（`data:application/pdf;base64,...`）
2. 只傳假字串 URL（長度滿足頁面判斷條件即可）
3. 需真實下載時，在主頁面 `page.evaluate()` 建 blob URL 再注入

## uid echo 是最常見的靜默失敗

元件的 `onmessage` 常有 `if (res.uid === this.uid)` guard。Mock Worker 若未 echo `e.data.uid`，所有訊息被靜默過濾——按鈕永遠不 enable、測試超時**無任何報錯**。Mock 務必：

```javascript
var uid = e.data && e.data.uid ? e.data.uid : '';
self.postMessage({ ...result, uid: uid });
```

## Worker 檔案的 unit test 策略

- Canvas / JsBarcode 類在 jsdom 無法實例化：資料映射邏輯改在 **service 層**做 unit test；Worker 內純函式加 `export` 後由 spec 具名 import，mock 依賴（如 JsBarcode spy）測 guard 分支
- Worker 頂層 `addEventListener('message', ...)` 在 import 時立即執行的副作用：spec 前 `spyOn(self, 'addEventListener')` 排除

## 認證 guard 時序

`addInitScript` 注入 sessionStorage 後，route guard（canActivate）仍可能在注入生效前執行而重導根路徑。解法：mock guard 本身，或用 `page.route()` 攔截認證 API。

## 真實降級路徑驗證（不 mock Worker）

要驗證「外部資源失敗時 Worker 仍可完成工作」（如字型降級），最有效的是**不注入 Worker mock**，改用 `page.route()` 攔截外部資源 URL 回 500，讓真實 Worker 走完降級鏈，再驗最終 UI 狀態——比 mock 更能保證真實程式碼路徑被覆蓋。
