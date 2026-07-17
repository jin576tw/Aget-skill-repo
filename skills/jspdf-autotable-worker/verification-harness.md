# Playwright PDF 擷取驗證範本

用於自行驗證 `*-pdf-worker.ts` 產出的 PDF 版面（欄寬、換行、對齊、間距），不依賴使用者截圖。
適用於任何「點按鈕 → Web Worker 產生 PDF → `<a download>` 觸發下載」的既有流程
（例如透過 `ProgressBoxComponent` 之類的下載對話框）。

## 前置條件

- 目標頁面走 mock API（`page.route`），不連真實後端
- 已知觸發列印的按鈕文字、下載按鈕的 selector（例如 `#btnDownload`）
- 專案已有可執行的 Playwright harness（`playwright.config.ts` 等）

## 完整範本

```typescript
import { test, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const MOCK_TOKEN_INFO = {
  accessToken: 'MOCK_TOKEN',
  refreshToken: 'MOCK_REFRESH',
  accessFunctionList: ['<TargetRouteGuardName>'],
};

async function setupPage(page: Page): Promise<void> {
  await page.addInitScript((tokenInfo) => {
    sessionStorage.setItem('ENCRYPT_INFO', JSON.stringify(tokenInfo));
  }, MOCK_TOKEN_INFO);

  // 攔截 <a download> 建立的瞬間，把 blob href 存到 window 供 Playwright 讀取
  await page.addInitScript(() => {
    (window as any).__capturedBlobUrl = null;
    const origAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function <T extends Node>(node: T): T {
      const el = node as unknown as HTMLElement;
      if (el && el.tagName === 'A') {
        const href = (el as HTMLAnchorElement).href;
        if (href && href.startsWith('blob:')) {
          (window as any).__capturedBlobUrl = href;
        }
      }
      return origAppendChild.call(this, node) as T;
    };
  });
}

async function mockApis(page: Page): Promise<void> {
  await page.route('**/your/search/api**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ /* mock data */ }) })
  );
}

async function gotoWithRetry(page: Page, url: string, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { timeout: 30000 });
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await page.waitForTimeout(3000);
    }
  }
}

test('capture — 產生 PDF 並存檔供人工/工具檢查', async ({ page }) => {
  await setupPage(page);
  await mockApis(page);

  await gotoWithRetry(page, '/YourRoute');
  await page.waitForLoadState('networkidle');

  // ...UI 操作：查詢、勾選、點列印按鈕...

  // 等待下載按鈕變為可用（worker 已產生 blob）
  await page.locator('#btnDownload:not([disabled])').waitFor({ timeout: 15000 });
  await page.click('#btnDownload');
  await page.waitForFunction(() => (window as any).__capturedBlobUrl !== null, { timeout: 5000 });

  const base64 = await page.evaluate(async () => {
    const url = (window as any).__capturedBlobUrl as string;
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  });

  const outDir = path.resolve(__dirname, '../../captured-pdfs');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'your-report-capture.pdf');
  fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));

  console.log(`PDF saved to: ${outPath}`);
});
```

之後直接對 `outPath` 呼叫 Claude Code 的 `Read` 工具即可視覺核對版面。

## 換行壓力測試變體

要驗證「表頭某欄會依資料筆數換行、下方內容有沒有正確被往下推」，把 mock 資料改成
用迴圈產生足夠多筆不重複值（例如 10~12 筆），而不是固定 1~2 筆：

```typescript
const NAMES = ['王小明', '陳大文', '林美玲', '張志豪', '李佳蓉', '黃俊傑', '吳雅婷', '劉建國', '蔡淑芬', '許文彬', '鄭雅雯', '曾國華'];
const MOCK_ROWS = NAMES.map((nm, i) => buildRow({
  key: { /* 每筆需唯一 key，依專案實際欄位調整 */ },
  createId: `U${String(i + 1).padStart(3, '0')}`,
  createNm: nm,
}));
```

## 已知限制：不要嘗試把 PDF 轉成 PNG 給使用者看

- `page.goto(blobUrl)` 或 `page.goto('file:///xxx.pdf')` 在 Playwright 的 Chromium 上會直接
  拋 `page.goto: Download is starting`，不會走內建 PDF viewer 渲染，因此
  `page.screenshot()` 拿不到畫面。
- Windows 開發機通常沒有 `pdftoppm` / ImageMagick (`magick`) 可用，`convert.exe` 是系統內建
  的檔案系統工具，不是 ImageMagick，不能拿來轉檔。
- 使用者要求「看截圖」時，直接把產出的 PDF 本機路徑給對方自己開，或用 `Artifact` 工具
  另外包一個網頁連結，不要在這條路上重試。

## 驗證完後清理

若是一次性的臨時驗證（非長期回歸測試），驗證完直接刪除臨時 spec 檔與臨時產出的 PDF，
不要留在 repo 裡；只有明確要保留作為回歸測試的 capture spec 才留下並取有意義的檔名。
