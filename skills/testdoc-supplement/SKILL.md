---
name: testdoc-supplement
description: 依既有 BSD／測試文件與環境截圖，補產「[單號]_[後綴]」測試文件：先產 md 與紅框截圖供使用者確認，確認後再批次轉 docx。來源資料夾、單號、範本、狀態字、標題後綴、截圖與圖說全為參數，不綁專案或檔名。
---

# testdoc-supplement

## 完成目標

每個單號有 `[單號]_[後綴].md`（含紅框截圖與圖說，供使用者逐一確認）；使用者確認後才輸出 `[單號]_[後綴].docx`。工具只新增檔案，輸出已存在即拒絕覆蓋；不寫 repo、不上傳、不碰憑證。

## 兩步分離與彈性

1. **產 md＋截圖**（可先對全部單號做完）：BSD → spec 骨架 → 截圖 → md。
2. **md → docx**（使用者確認所有 md 後，一次轉一或多單）：以確認過的 md 為唯一來源，使用者在 md 內的手改直接反映到 docx。
3. **（選用）清理**：使用者確認 docx 後，才刪該單 md 與其引用的圖。

彈性設計：
- 資料夾名稱不必等於單號：`--root` 掃描第一層子資料夾內所有 `<單號>_<後綴>.md`，`--tickets` 只是過濾。
- 狀態字可整份一行（`document`）或每項一行（`per-item`），個別項目可用 `status` 覆寫。
- 範本可用預設靜態 XML（bsd-report `docx-structure.md`）或任一份完成的 docx（`--template`）。
- 標題後綴、狀態字、圖說皆為 spec 欄位；文字中不得出現的詞用 `--forbid` 檢查。
- 步驟互相獨立，可只用其中一段（例如只用 md → docx，或只用截圖 helper）。

```
node scripts/bsd-to-spec.mjs <BSD.docx> --out <spec.json> [--ticket T] [--source-dir D] [--title-suffix S] [--status-text X] [--status-mode per-item|document]
   讀 BSD docx，輸出 spec 骨架（項目標題、BSD 原文、圖說清單、佔位圖檔名）；圖說判斷為啟發式，產出後人工修改。

scripts/shot-helpers.mjs   截圖用 helper：launchChrome / settle / trackWrites / injectStyle / snap / plain / annotateImage
   登入、網址、帳號屬各專案，由呼叫的腳本處理；helper 不含連線資訊或憑證。

node scripts/make-md.mjs <spec.json> [--out-dir D] [--dry-run]
   spec + 截圖 → <outDir>/<單號>_<後綴>.md；圖放 <單號>_<後綴>_images/（shot.source 會複製進去）。

node scripts/check-md.mjs <a.md> … | --root <dir> --suffix <後綴> [--tickets A,B] [--forbid 詞1,詞2]
   唯讀：md 可解析、引用的圖存在且為 PNG、docx 會收錄的文字不含禁用詞。

node scripts/make-docx.mjs <a.md> [b.md …] [--template <docx|structure.md>] [--out-dir D] [--forbid …] [--dry-run] [--keep-parts]
node scripts/make-docx.mjs --root <dir> --suffix <後綴> [--tickets A,B] …
   md → docx，輸出在 md 旁（或 --out-dir）。每單獨立成敗，輸出 JSON 摘要，任一失敗 exit 1。
   打包呼叫 plugin 的 scripts/pack-docx.mjs；打包後讀回檢查（XML 結構、關聯與圖片部件、png content type）。

node scripts/clean-md.mjs <a.md> … | --root <dir> --suffix <後綴> [--tickets A,B] [--yes]
   預設只預覽。只在該單 docx 存在、讀回檢查通過且圖片數等於 md 引用數時，才（加 --yes）刪 md 與其引用的圖；其他檔案不動。

node scripts/compare-docx.mjs <expected.docx> <actual.docx> [--parts]
   比對段落與 media 數量／大小／md5；--parts 另比每個 part 的 md5。
```

## spec.json

範例見 [examples/spec-example.json](examples/spec-example.json)。欄位：

- `ticket`、`sourceDir`、`titleSuffix`、`statusText`（必填）；`statusMode`：`per-item`（預設，每個項目標題下一行）或 `document`（PCR 行下只放一行）。
- `items[]`：`title`、`text`（字串或陣列，一個元素一段）、可選 `status`（覆寫該項目狀態字，僅 per-item）、`shots[]`（`label` 圖說、`image` 檔名、可選 `source` 複製來源，相對於 spec 檔）。
- `notes[]`：只進 md 的確認備註（環境、帳號、圖片出處、偏差），不輸出到 docx。
- 項目編號依順序自動產生；圖限 PNG，寬度固定 5274310 EMU、高度依比例。

## md 格式（step 2 的解析依據）

```
# 單號_後綴
**[PCR單 : 單號]**
（document 模式：一行狀態字）
## 項目一：標題
（per-item 模式：狀態字）
說明段落
圖說：
![alt](<單號>_<後綴>_images/item1.png)
---
> 備註（不進 docx）
```

各行之間以空行分隔；圖說行必須以全形「：」結尾並緊接圖片；第一個 `---` 起為備註，不進 docx。手動編輯 md 時維持這個結構即可。

## 截圖慣例

- 一個欄位的標題與輸入包在同一個紅框（`snap` 的群組陣列），不拆成兩框；一張圖只框需要的重點。
- 只顯示「沒有某區塊」或單純現況的圖不加框（`plain`）。
- 無法重現的畫面可改用舊圖加框（`annotateImage`），出處只寫在 md 備註，不進 docx；用 `--forbid` 把關。
- 只讀環境：用 `trackWrites` 記錄非 GET 請求，並把結果寫入備註作為證據。
- 交付前逐張看圖確認紅框位置與內容；截圖需對應已核准的異動範圍與真實畫面元素。
- 登入憑證與 token 不寫入腳本、md 或 board；腳本於執行期以環境變數取得。

## 驗證

- 單元測試：`node --test tests/testdoc.test.mjs`（兩步流程、資料夾名不等於單號、逐項狀態字、document 模式、`--forbid`、範本 docx、拒絕覆蓋、清理預覽與實刪、BSD 讀回）。
- 以實際批次交付回歸：同一組 md 重轉後與既有 docx 全部 part 逐位元組相同（含 `--template` 模式）。
- `shot-helpers.mjs` 已用本機 HTML 頁在 Chrome 實跑（合框、舊圖加框、覆蓋拒絕、無殘留框）。

## 限制

- 截圖步驟是各單號專屬的 Playwright 腳本（登入與操作流程因單而異），不由工具自動產生；helper 只提供紅框、等待與唯讀偵測。
- 讀回檢查只確認結構，不等於 Word 渲染；交付前仍需使用者開啟確認，`--template` 模式尤其如此。
- 實作為 Node（沿用 pack-docx 與 Playwright），不新增 Python 依賴。
- 路徑預設相對於 plugin 目錄；可用環境變數覆寫：`PACK_DOCX`、`DOCX_STRUCTURE`、`CHROME_PATH`。
