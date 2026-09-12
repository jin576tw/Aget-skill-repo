---
name: tdd
description: 在使用者要求 test-first／TDD，或適用專案採用 TDD 時，以行為測試驅動開發。
---

# tdd

## 完成目標

以公開行為驗證需求，讓測試能抵抗內部重構。採 TDD 時先觀察對應行為測試失敗，再實作使其通過，重構後維持通過；這是 TDD 的證據關係，不規定每輪只能一條 AC、固定角色或重複計畫核准。

## 驗收

失敗來自需求尚未滿足而非假紅燈，通過來自實際執行。測試範圍依風險与需求，不測私有方法形狀或製造無意義覆蓋率。已有明確需求及授權時直接開始。

按需參考：[行為測試](tests.md)、[mock 邊界](mocking.md)、[介面](interface-design.md)、[深模組](deep-modules.md)、[重構](refactoring.md)。
