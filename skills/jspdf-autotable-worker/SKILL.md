---
name: jspdf-autotable-worker
description: jsPDF + jspdf-autotable 報表 PDF 產生慣例（多在 Angular Web Worker 內執行）。TRIGGER when 使用者要調整 *-pdf-worker.ts、autoTable 欄寬/換行/對齊、PDF 報表版面跑版、表頭多行文字、或回報「PDF 欄位置中/靠左」「欄寬不自然」「換行怪異」「PDF 截圖看不到線」等症狀。
---

# jsPDF + jspdf-autotable Worker 報表慣例

## Overview

本 skill 整理在瀏覽器端（常見於 Angular Web Worker，`*-pdf-worker.ts`）用 jsPDF + jspdf-autotable
產生表格式報表 PDF 時反覆出現的版面問題與正確做法。核心原則：**先相信 autoTable 已經做掉的事，
不要重造輪子**；表頭手動文字與 autoTable 表格是兩套不同的排版機制，混用時最容易出錯。

## Quick Start：從零建立一支報表 PDF Worker

### 1. 最小可動的 jsPDF + autoTable 範例

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const doc = new jsPDF({
  orientation: 'landscape',  // 'portrait' | 'landscape'
  unit: 'mm',                // 座標/寬度單位，後續 cellWidth、margin 都用這個單位
  format: 'a4',
});

autoTable(doc, {
  columns: [
    { header: '姓名', dataKey: 'name' },
    { header: '金額', dataKey: 'amount' },
  ],
  body: [
    { name: '王小明', amount: 1000 },
    { name: '陳大文', amount: 2000 },
  ],
  startY: 20,               // 表格從哪個 Y 座標開始畫（上方留給標題/表頭文字）
  margin: { left: 10, right: 10 },
});

const bloburl = doc.output('bloburl'); // 或 doc.save('file.pdf') 直接下載
```

`columns`/`body` 用 `dataKey` 對應是最推薦的寫法（比 `head`/`body` 陣列寫法更不容易欄位錯位）。

### 2. 中文字型載入（一般字型，非難字字型）

瀏覽器/Worker 內建字型不含中文，畫中文前必須手動載入字型檔：

```typescript
fetch('assets/font/YourFont.TTF')
  .then((response) => response.arrayBuffer())
  .then((fontData) => {
    doc.addFileToVFS('YourFont.TTF', arrayBufferToBase64(fontData));
    doc.addFont('YourFont.TTF', 'YourFont', 'normal');
    doc.setFont('YourFont');
    // ...接著才能呼叫 doc.text() / autoTable()
  });

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
```

若專案另有「難字」/罕見字擴充字型需求（例如姓名罕見字），那是另一套 FontFace API +
外部字型伺服器降級的機制，屬於專案特定規範，不在本 skill 範圍內（core-ui 專案見
`.github/instructions/pdf-worker.instructions.md`）。

### 3. 包成 Angular Web Worker

```typescript
/// <reference lib="webworker" />
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

addEventListener('message', async ({ data }) => {
  const req = data as YourPdfReq;         // { uid: string; data: YourRow[] }
  // ...載字型、產生 doc、跑迴圈畫內容...
  postMessage({
    progress: req.data.length,
    url: doc.output('bloburl').toString(),
    uid: req.uid,
  } as YourPdfRes);
});
```

- Worker 檔要能被 `tsconfig.worker.json` 編到：檔名符合該 config 的 `include` glob
  （常見慣例是 `*-worker.ts` 放在 `src/app/services/` 下），且該 tsconfig 的 `lib`
  通常只有 `es2018`/`webworker`（**沒有 `dom`**）——worker 內不能用 `document`/`window`
  等 DOM 全域，共用的純函式 util 檔也要避免依賴 DOM。
- 主執行緒啟動 worker、顯示進度、觸發下載，通常包在一個共用對話框元件裡
  （例如 core-ui 的 `ProgressBoxComponent`：傳入 `workerFactory`、監聽
  `postMessage` 回報的 `progress`/`url`，`url` 有值時啟用下載按鈕），
  不要在每個呼叫點各自 `new Worker()` 重複接線邏輯。

---

## 兩套排版機制，不要搞混

| 位置 | API | 是否自動換行 `\n` | 是否自動依寬度換行 |
|------|-----|-------------------|---------------------|
| 表頭手動文字（`doc.text(...)`） | jsPDF 原生 | ❌ 不會，必須手動 `.split('\n')` 逐行畫 | ❌ 不會，需自行量測寬度 |
| 表格內容（autoTable body cell） | jspdf-autotable | ✅ 自動處理 | ✅ 自動處理（`overflow:'linebreak'` 為預設值） |

### 表頭多行文字：手動 split + row 計數器

```typescript
const writeOffUserText = `建檔人員：${formatAcceptorNames(names)}`; // 內部已用 \n 分行
const lines = writeOffUserText.split('\n');
lines.forEach((line, idx) => {
  doc.text(line, borderWidth, borderWidth + lineSpacing * (row + idx));
});
row += lines.length; // 累加行數，後續內容（含 autoTable startY）才不會被蓋到
// ...
const tableStartY = borderWidth + lineSpacing * row + 2;
```

驗證重點：當來源資料有「多筆不重複姓名/欄位值」需要合併顯示時（例如多個建檔人員），
用足夠多筆不同值的 mock 資料觸發實際換行（見下方「驗證流程」），確認 `tableStartY`
真的跟著往下推、沒有跟表頭文字重疊。

### 表格欄位換行：不要重新發明 autoTable 已有的邏輯

jspdf-autotable 的 `fitContent()`（`overflow:'linebreak'`，預設值）本來就會依 `cellWidth`
自動換行：`textSpace = cell.width - cell.padding('horizontal')`，
`cell.text = doc.splitTextToSize(text, textSpace + 1/scaleFactor, {fontSize})`。

❌ 不要為了「換行」自己寫固定字數斷行（例如「每 6 個字強制換行」）——這會在短文字上
產生不必要的換行，也會在長文字上於錯誤的字數邊界斷行，跟欄位實際寬度脫鉤。
✅ 直接把原始字串塞進 body cell，交給 autoTable 依 `columnStyles.cellWidth` 自動換行。

## 依換行結果動態決定對齊（單行置中、換行靠左）

需求常見於「短內容置中比較好看、長內容換行後靠左比較好讀」。做法是用 `willDrawCell`
hook（不是 `didParseCell`——後者在欄寬計算完成前執行，不可靠），因為 `cell.text` 在繪製前
一定已經是 `string[]`（autoTable 完成換行後的結果），直接看陣列長度就知道有沒有換行：

```typescript
import type { CellHookData } from 'jspdf-autotable';

// 抽成純函式，可被多個 worker 共用，也方便 unit test（不依賴 DOM/jsPDF 實例）
export function centerShortLeftWrapped(data: CellHookData): void {
  if (data.section !== 'body') return;
  data.cell.styles.halign = data.cell.text.length > 1 ? 'left' : 'center';
}
```

```typescript
autoTable(doc, {
  // ...
  columnStyles: {
    hname: { cellWidth: 44 },        // 只給寬度，不要寫死 halign
    // 其餘欄位同理，只設 cellWidth
  },
  willDrawCell: centerShortLeftWrapped, // 套用到所有欄位，一次寫死、全部欄位一致
});
```

不要在部分欄位手動判斷「這欄可能會換行所以特別處理」，其餘欄位又寫死 `halign:'center'`——
用同一個 hook 蓋到全部欄位最穩定，也最容易單元測試（見下方）。

## 欄寬配置：不要用 `cellWidth: 'auto'` 吃剩餘空間

`'auto'` 會把所有未分配寬度塞給該欄，版面觀感常常「其中一欄特別寬、很不自然」。

正確做法：算出可用寬度，把它顯式分配到每一欄，加總對齊：

```
可用寬度 = 頁寬 − margin.left − margin.right
（A4 橫式 297mm，margin 各 10mm → 可用 277mm）
```

把 277mm 依欄位語意（日期/案號類窄、名稱/備註類寬）按比例分配成固定 `cellWidth`，
每欄都給明確數字，不要留 `'auto'`。

## `margin.left/right` 要跟表頭手動文字的起始 X 對齊

表頭用 `doc.text(line, borderWidth, y)` 畫，autoTable 若沒有同步設定
`margin: { left: borderWidth, right: borderWidth }`，表格會用預設 margin 起始，
跟表頭文字對不齊，視覺上像「多了一塊奇怪的空白」。兩者的水平起點必須共用同一個變數。

## 表頭底線粗細：先確認不是快取問題，再調粗細

`headStyles.lineWidth.bottom` 抓 0.3~0.5mm 是常見報表觀感；除非有實測證據，
不要單靠使用者「螢幕看起來線不見了」就一路調到 1mm 以上（會顯得過粗）。

先排除下面這個常見假警報，再決定要不要動樣式：

> **Angular dev server 的 Web Worker 不吃一般 HMR。** `*-worker.ts`（`tsconfig.worker.json`
> 編譯）改完程式碼後，瀏覽器分頁若沒有整頁強制重整，可能還在跑舊版 worker bundle。
> 使用者回報「這個功能改的東西沒生效／樣式跟我認知的不一樣」時，先用下方驗證流程產生一份
> **保證吃到目前程式碼**的 PDF 自行比對，如果一致，再請使用者整頁強制重整
> （Ctrl+Shift+R）後重測，而不是直接改程式碼「碰運氣」。

## 驗證流程：Playwright 攔截下載 + Read 工具直接看 PDF

不依賴使用者截圖，自己產生並檢視實際渲染結果：

1. `page.addInitScript` 攔截 `Node.prototype.appendChild`，抓下 `<a download>` 建立瞬間的
   `href`（blob: URL）。
2. `page.route(...)` mock 掉查詢/清單 API。
3. 驅動 UI：勾選資料 → 點列印 → 等待下載按鈕變為可用（worker 完成）→ 點擊觸發下載
   → `page.waitForFunction(() => window.__capturedBlobUrl !== null)`。
4. `page.evaluate(async () => { const buf = await (await fetch(blobUrl)).arrayBuffer(); ...轉 base64 })`，
   用 Node `fs.writeFileSync` 存成 `.pdf`。
5. 用 Claude Code 的 `Read` 工具直接開那個 `.pdf`，肉眼核對版面（欄寬、換行、對齊、間距）。

完整可複用範本見 [verification-harness.md](verification-harness.md)。

**⚠️ 這個技巧只解決「AI 自己怎麼驗證」，不等於使用者看得到畫面。** Claude Code 是 CLI，
`Read` 一份 PDF 只會把畫面餵給模型自己看，終端機不會把圖片顯示給使用者。使用者若明確要求
「讓我看截圖」，正確做法是：
- 直接告訴使用者本機上產出的 PDF 檔案路徑，讓對方自己開；或
- 用 `Artifact` 工具把截圖包成網頁連結。

**已知死路，不要重試**：想用 Playwright/Chromium 把 PDF 轉成 PNG 給使用者看
（`page.goto(blobUrl 或 file://xxx.pdf)` 再 `page.screenshot()`）——Playwright 內建的 Chromium
會把導覽到 PDF 一律當「下載」處理，不會走內建 PDF viewer 渲染，`page.goto` 會直接丟
`Download is starting` 錯誤而不是完成導覽。且此類 Windows 開發機通常也沒有
`pdftoppm`/ImageMagick 可用。遇到「PDF 轉截圖」需求，直接跳到上一段的兩個替代方案。

## 換行壓力測試（多筆不同值）

驗證「表頭某欄會依資料筆數換行」時，mock 資料要放**足夠多的不重複值**才會真的觸發多行，
不要只放 1~2 筆：

```typescript
// 假設 formatAcceptorNames(names, maxPerLine=5) 每 5 筆換一行
const NAMES = ['王小明', '陳大文', '林美玲', /* ...共 12 筆不重複姓名 */];
// 12 筆 / maxPerLine 5 → 應換行成 3 行，可驗證下方內容有沒有正確往下推
```

## 單元測試：抽成純函式才測得動

`willDrawCell` hook 這類邏輯要能單元測試，必須寫成不依賴真實 jsPDF 實例的純函式
（輸入輸出只用 `CellHookData` 的最小 shape），放在 worker 也能 import 的純 TS 檔案
（`tsconfig.worker.json` 通常沒有 `"dom"` lib，避免用到 DOM 全域）：

```typescript
function makeCellHookData(section: 'head' | 'body' | 'foot', text: string[]): CellHookData {
  return { section, cell: { text, styles: { halign: 'center' } } } as unknown as CellHookData;
}

it('should left-align when cell text wraps to multiple lines', () => {
  const data = makeCellHookData('body', ['第一行', '第二行']);
  centerShortLeftWrapped(data);
  expect(data.cell.styles.halign).toBe('left');
});
```

## Checklist（改動 PDF worker 版面前後）

- [ ] 表頭多行文字：`.split('\n')` 逐行畫 + `row` 累加，沒有跳過任何一行
- [ ] `tableStartY`（或下一段內容 Y 座標）用累加後的 `row` 算，不是寫死的常數
- [ ] `columnStyles` 每欄都給明確 `cellWidth`（mm），沒有任何一欄是 `'auto'`
- [ ] 對齊邏輯統一用單一 `willDrawCell` hook 處理，沒有各欄各自寫死 `halign`
- [ ] `margin.left/right` 跟表頭手動文字的起始 X 是同一個變數
- [ ] 沒有自己重寫固定字數斷行邏輯，交給 autoTable 的 `overflow:'linebreak'`
- [ ] 改完用驗證流程（Playwright 擷取 + Read）自己先看過一次，不是先丟給使用者測
- [ ] 使用者回報「沒生效/跟我看到的不一樣」時，先懷疑 dev server worker 快取，
      而不是先懷疑自己的程式碼
