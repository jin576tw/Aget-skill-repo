# 開發工作流 Prompt：SDD + TDD + BDD 整合流程

## 背景說明

我是一名 Angular/TypeScript 前端工程師，工作在保險系統領域。

我的開發方法論整合了 SDD（規格驅動）、TDD（測試驅動）與 BDD（行為驅動）。

我使用 code-reviewer agent 在綠燈後執行程式碼邏輯驗證。

## 流程入口建議

- 使用 `/start-work [需求變更描述]` 作為**單一輕量入口**。
- `/start-work` 只負責啟動流程，不應設計成過多子命令。
- 流程中若遇到缺資訊、`/plan` 確認、E2E 環境決策、是否進入收尾等節點，應以**問答方式**向使用者確認後再繼續。

---

## Step 0：Definition of Ready（進入開發前的檢查）

在進入 /plan 之前，請協助我確認以下事項。

**確認清單：**

- [ ]  AC 是否可驗證（能明確判斷通過或失敗）
- [ ]  關鍵名詞是否已定義（例如：「保額」、「承保範圍」的邊界）
- [ ]  API contract 是否已知（欄位名稱、型別、錯誤碼）
- [ ]  空值、邊界值、異常狀態是否已確認
- [ ]  是否涉及金額、日期、精度或時區的特殊處理
- [ ]  是否有影響既有流程的風險

**Open Questions 格式：**

若有尚待確認的問題，請列出，不可自行假設：

```
Open Questions
- OQ-01：[問題描述] → 待確認對象：[PM / SA / 後端]
- OQ-02：...
```

**Open Questions 分級原則：**

- Open Questions 可在 Step 1 一併整理，不阻擋 Spec 撰寫
- 若問題會影響商業規則、API contract、資料流或測試預期，則不得進入 Step 2 /plan
- 不影響核心邏輯的問題可標註待確認，先進行開發

---

## Step 1：更新 Spec + 撰寫 AC（SDD + BDD 層）

請協助我將需求轉化為結構化規格，格式如下：

```markdown
## 功能：[功能名稱]

### 功能描述
（說明這個功能要做什麼、商業背景）

### 商業規則
（列出明確的條件、限制與計算邏輯）

### Acceptance Criteria

- [ ] AC-01
      Given [前置條件]
      When  [觸發動作]
      Then  [預期結果，包含具體的值或狀態]

- [ ] AC-02
      Given ...
      When  ...
      Then  ...

（邊界案例、空值、異常狀態、Loading / Error 狀態也要涵蓋）
（系統內部行為也可描述，例如：Given API 回傳 409，Then 系統保留表單內容並顯示錯誤）

### 非功能需求
（效能、資安、稽核紀錄等，若有的話）
```

**AC 追蹤原則：**

每條 AC 必須至少有一個可追蹤的驗證方式，但不強制 AC 與測試案例維持一對一關係。

請在測試檔中以 `// AC-01` 的方式標註對應關係。

---

## Step 2：/plan 模式

請根據 Spec 與 AC 產出實作計劃，需包含：

**程式結構：**

- 需要建立或修改的 Service / Component / Domain
- 主要邏輯拆分方式（商業規則優先放 Service 或 Domain）

**資料流（保險系統必填）：**

- API DTO → Domain Model → Form Model → Request DTO 的轉換方式
- 後端錯誤碼的對應處理邏輯

**測試層級規劃：**

| 測試層級 | 適合驗證 |
| --- | --- |
| 純函式 / Domain | 金額計算、日期判斷、狀態轉換、商業規則 |
| Service Unit Test | API 資料轉換、錯誤映射、流程協調 |
| Component Test | Input/Output、表單互動、DOM 顯示、按鈕狀態 |
| Playwright E2E | 關鍵使用者旅程、前後端整合後的關鍵結果 |

請明確指出每條 AC 預計在哪個測試層級驗證。

若本次功能不涉及關鍵使用者旅程、跨頁面流程或前後端整合，請在此說明不新增 E2E 的理由。

**影響範圍：**

- 是否影響既有功能或流程
- 需要同步修改的關聯檔案

**/plan 確認規則：**

- `/plan` 產出後，**不得直接進入 Step 3**。
- 必須先用問答方式向我確認這份計畫是否可接受，至少確認：
  - AC 切分是否合理
  - 每條 AC 的測試層級規劃是否合理
  - 資料流與 API contract 理解是否正確
  - 是否需要 E2E，或是否要正式略過
- 只有在我確認計畫後，才可進入 Step 3 ～ Step 6 的單條 AC TDD 循環。

---

## Step 3 ～ Step 6：逐條 AC 執行 TDD 循環

**重要：一次只處理一條 AC，完成 Red → Green → code-reviewer → Refactor 後，再進行下一條。**

不要一次建立所有 AC 的測試，再統一實作。

---

### Step 3：建立測試（紅燈）

針對當前 AC，建立具體描述預期結果的測試案例：

```tsx
// AC-01：[AC 描述摘要]
it('AC-01: should return PREMIUM_REQUIRED when premium is empty', () => {
  // Given
  const input = null;
  // When
  const result = service.validatePremium(input);
  // Then
  expect(result).toEqual({
    valid: false,
    errorCode: 'PREMIUM_REQUIRED',
  });
});
```

**測試骨架規則：**

- 測試名稱必須包含 AC 編號與預期行為，格式：`it('AC-XX: should ...')`
- 測試必須描述具體的預期輸入與輸出，不可使用 `fail('Not implemented')` 製造假紅燈
- 測試應因「功能尚未存在」或「回傳結果不符合預期」而失敗
- 測試應驗證行為結果，不得過度綁定內部實作細節（例如不應測試私有方法是否被呼叫）
- Service 層純函式優先，迫使商業規則從 Component 中分離

---

### Step 4：實作程式碼（綠燈）

以最低限度實作，只求當前 AC 的測試通過：

- 不求完美，先讓紅燈變綠燈
- TypeScript 型別需明確定義，不使用 `any`
- 不超前實作尚未對應測試的邏輯

---

### Step 5：code-reviewer

綠燈後，執行 code-reviewer agent 進行程式碼邏輯驗證。

**這是進入重構的門票：確認邏輯方向正確後，才進行重構。**

code-reviewer 應確認：

- [ ]  實作邏輯是否符合 AC 的預期行為
- [ ]  型別定義是否明確
- [ ]  是否有明顯的設計問題需要在重構前先處理
- [ ]  商業規則是否集中在 Service / Domain，而非散落在 Component
- [ ]  測試是否驗證行為結果，而非過度綁定內部實作細節

若 code-reviewer 發現方向性問題，回到 Step 4 修正後再次執行。

---

### Step 6：重構

code-reviewer 通過後，優化以下面向，確認測試仍全數通過：

- 消除魔術數字，抽出具名常數
- 提升可讀性與維護性
- 確認資料型別與命名是否符合 Domain 語意

重構完成後，回到 Step 3 處理下一條 AC。

---

## Step 7：Integration / E2E 測試（Playwright）

所有 AC 的 TDD 循環完成後，視 Step 2 的規劃決定是否執行 Playwright：

- 關鍵使用者旅程（例如：填寫表單 → 送出 → 顯示結果）
- 前端與 API 整合後的關鍵結果
- 不重複驗證單一純函式的所有輸入組合（那是 Unit Test 的責任）
- 若功能不涉及跨頁面流程或前後端整合，可略過此步驟（需在 Step 2 說明理由）

**共享 Playwright harness 規則：**

- 若目標專案本身**已有** Playwright 環境，優先使用專案內環境。
- 若目標專案**沒有** Playwright 環境，且本次功能仍需要 E2E，請先以問答方式確認是否使用共享 harness：`C:\Users\003689\Desktop\playwright-harness`
- 若同意使用共享 harness，可在該資料夾內協助安裝 Playwright 與必要瀏覽器。
- 若不同意建立或安裝共享 harness，則正式略過 Step 7，並在 Step 2 與 Step 8 記錄略過理由。

---

## Step 8：Definition of Done

合併前確認以下全部完成：

- [ ]  所有 AC 有對應的測試驗證（`// AC-XX` 標註，測試名稱含 AC 編號）
- [ ]  Unit / Component / E2E 測試全數通過
- [ ]  code-reviewer 每條 AC 均已通過
- [ ]  Lint、type check、build 通過
- [ ]  沒有未處理的 magic value 與未確認的 TODO
- [ ]  Spec 與實際行為一致
- [ ]  API contract 與型別已同步
- [ ]  Open Questions 全數解決或已記錄決策
- [ ]  測試未過度綁定內部實作細節
- [ ]  核心使用者流程已手動確認（視覺、UX、跨裝置）

**收尾確認規則：**

- 不另外設計複雜的收尾 command。
- 所有 AC 完成後，應先以問答方式向我確認是否進入 Step 8 Definition of Done。
- 若我尚未確認，應停在收尾前的 checkpoint，而不是直接結案。

---

## 方法論層次總結

| 方法論 | 負責的問題 | 在流程中的位置 |
| --- | --- | --- |
| SDD | 要做什麼 | Step 0 ～ Step 1 |
| BDD | 描述特定情境下系統應有的可驗證行為 | Step 1（AC 語言） |
| TDD | 內部程式要怎麼設計 | Step 3 ～ Step 6 |
| code-reviewer | 程式碼邏輯驗證 | Step 5（綠燈後、重構前） |
| E2E | 整條使用者流程是否成立 | Step 7（視需求執行） |
