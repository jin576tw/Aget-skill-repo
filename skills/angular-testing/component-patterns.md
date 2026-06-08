# Component Test Patterns

適用：表單互動、Input/Output、DOM 顯示、按鈕啟用狀態。

## 建議工具

- `TestBed`
- `ComponentFixture`
- `fixture.detectChanges()`
- `By.css` 或語意化查找

## 測試方向

- 欄位初始值與 disabled 狀態
- 使用者輸入後的畫面反應
- 錯誤訊息與按鈕啟用 / 停用
- Output event 與父元件可觀察結果

## 注意事項

- 優先驗證 DOM 可觀察結果
- 避免直接依賴內部私有欄位
- 若商業規則已可抽至 Service / Domain，應優先在 unit test 驗證
