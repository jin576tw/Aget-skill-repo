# POS 歷史脈絡

## 保留原則

- POS family 的建立以 **先收斂活文件、再移除舊資料夾** 為原則。
- 歷史工作紀錄保留在 `journal/log.md`；family 頁面只整理摘要與導航，不覆蓋原始 session 紀錄。
- 若後續新增 project family 遷移，仍需先完成蒸餾與回指，才能移除舊入口。

## 現行歷史來源

- Family 狀態摘要：[[projects/pos/status|POS 工作狀態]]
- UI 靜態參考：[[projects/pos/pos-ui|POS UI]]
- Session 歷史：[[journal/log|工作日誌]]

## 遷移策略

- 2026-05-18：`projects/pos-ui/` 的 `about.md`、`lookup.md`、`status.md` 內容已收斂到 `projects/pos/` 與 `projects/pos/pos-ui.md`。
- UI 的活文件改由 family status 與 leaf page 承接；原始時間序歷程仍保留於 `journal/log.md`。
- 後續若需追查收斂前脈絡，以 journal 條目與 ADR 為權威來源。