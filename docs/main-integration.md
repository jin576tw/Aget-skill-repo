# main 與分支整合

本次實作基底是 start-work-plugin@5bb3e68，已包含 origin/main@f23efe4。先前 main 增量為 5 個既有檔案、46 行新增，沒有新增公開工具。

SA → spec → 實作的反向追溯已保留在 review-checklist、code-reviewer、spec-conventions 及 start-work；timeout 截尾與候選資料路徑證據保留在 error-first-debug。已移除固定順序、湊缺陷數與 rubric 門檻，維持當前核准來源、實際證據及未知限制。

後續實作完成 Node board、setup、checkpoint／finalize、ask-arxiv 整合，移除重複 commands 與 PowerShell。具體去留見 [全工具映射](tool-design-audit.md)，測試與宿主界限見 [驗證](validation.md)。完整原始規則及移除檔案可從 Git 歷史回查，不在載入路徑保留第二份過時流程。
