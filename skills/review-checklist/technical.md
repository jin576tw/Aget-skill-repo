# 技術規範檢查

## 基底類別繼承

- [ ] 正確選擇專案基底類別（查詢頁 vs 含勾選功能的查詢頁，依專案架構判斷）
- [ ] 所有抽象方法都已實作
- [ ] 含勾選功能時額外實作唯一識別方法
- [ ] 正確呼叫父建構函式（如 `super(injector)`）

## override 修飾符

- [ ] Abstract 屬性/方法：**不需要** override
- [ ] 可覆寫方法（如 validateForm、beforeSearch、afterSearch 等）：**需要** override
- [ ] 生命週期方法（ngOnInit 等）：**需要** override

## 型別定義

- [ ] 無 `any` 型別（包含快照型別、函式參數、回傳值）
- [ ] Request/Response 介面放在正確路徑（依專案型別檔案歸屬規則）
- [ ] 介面命名符合專案慣例
- [ ] 快照型別有明確定義，動態屬性已明列

## API 呼叫規範

- [ ] API 回應結構遵循專案統一格式，正確取值
- [ ] 查詢 API 在 Service 層正確轉換為前端分頁格式
- [ ] 業務錯誤使用專案的自訂錯誤攔截機制處理
- [ ] `catchError` 中正確取出原始錯誤
- [ ] API Service 歸屬正確（依 API 路徑對應 Service）

## 元件規範

- [ ] 使用 Standalone Component（無 NgModule）
- [ ] `@Component` imports 陣列宣告所有依賴
- [ ] 裝飾器順序：selector → standalone → imports → templateUrl → styleUrl → providers
- [ ] 使用 Injector 模式注入共用服務

## 表單規範

- [ ] FormGroup 預設值正確（Input/Select: `''`、Checkbox: `false`、DatePicker: `null`）
- [ ] 動態表單使用 `UntypedFormGroup`
- [ ] 日期前端顯示與後端傳送格式正確（依專案日期格式規範）

## 程式碼品質

- [ ] 無未使用的 import
- [ ] 無應抽為常數的硬編碼值（magic numbers/strings）
- [ ] 錯誤處理完善（不吞掉錯誤）
- [ ] 命名符合慣例（camelCase 變數、PascalCase 類別、UPPER_SNAKE_CASE 常數）
- [ ] 2 空格縮排、單行不超過 120 字元
