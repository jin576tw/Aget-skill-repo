# 驗收條件（DoD）

合併前確認以下項目：

- [ ] 所有 驗收項（AC）有對應的測試驗證（含 `AC-XX` 命名或註記）
- [ ] Unit / Component / E2E 測試全數通過，或 E2E 略過理由已記錄
- [ ] code-reviewer 對每條 AC 均已完成邏輯驗證
- [ ] Lint、type check、build 通過，或已記錄目前無法驗證的原因
- [ ] 沒有未處理的 magic value 與未確認 TODO
- [ ] Spec 與實際行為一致
- [ ] API contract 與型別已同步
- [ ] Open Questions 全數解決或已記錄決策
- [ ] 測試未過度綁定內部實作細節
- [ ] 核心使用者流程已手動確認（視覺、UX、跨裝置）

## 輸出格式

```markdown
## 驗收條件結果

- 狀態：可收尾 / 待補項目
- 待補項目：
  - ...
- 結論：可合併 / 暫不合併
```
