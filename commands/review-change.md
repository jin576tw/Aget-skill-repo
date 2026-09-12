---
name: Review Change
description: 對指定變更執行唯讀審查，回報規格追溯、缺陷與驗證限制。
---

# 變更審查

`$ARGUMENTS` 指定功能或範圍；未指定時依目前 diff 確認範圍。

依 [review-checklist](../skills/review-checklist/SKILL.md) 完成審查。主會話可直接使用；需要獨立視角且宿主允許時可委派 code-reviewer。回報驗收依據、可定位問題及未驗證項目。純審查不自動更新 spec、寫入知識庫或發布；使用者另已授權修正時依該範圍處理。

此 command 暫作相容入口，最終入口合併見 [工具整理計畫](../docs/tool-design-audit.md)。
