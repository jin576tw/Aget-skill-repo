---
name: vue-testing
description: 撰寫及驗證 Vue（依實際 Vue 版本選相容的測試工具） 的單元／元件或 API 測試，按需求建立行為證據。
---

# vue-testing

## 完成目標

以可觀察行為覆蓋適用需求、邊界與錯誤路徑，辨別純邏輯、元件與真正整合的驗證範圍。

## 驗收

測試結果能追溯至需求；專案已有 AC 編號時沿用。失敗應来自預期行為未滿足，不使用空斷言、固定 fail 或刻意斷 import 製造紅燈。使用專案版本與 runner，不固定 Agent 或一條 AC 回合。未執行不能宣稱綠燈，mock 不冒充實際服務整合。

## 參考

- [ac-tagging.md](ac-tagging.md)：需要建立或核對 AC／IT 與測試的映射、案例拆分時使用。
- [component-patterns.md](component-patterns.md)：驗證元件渲染、事件與狀態互動時使用。
- [unit-patterns.md](unit-patterns.md)：撰寫邏輯單元測試、準備 fixture 與隔離依賴時使用。
