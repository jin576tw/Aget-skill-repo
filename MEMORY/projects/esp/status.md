# ESP 工作狀態

## Related Lessons

> 與目前工作相關的教訓，每次 Session 結束時檢視更新。完整列表見 [lessons-learned.md](../../knowledge/lessons-learned.md)。

- **UTF-8 BOM 導致 kiro-cli JSON 解析失敗**：agent JSON 必須存為 UTF-8 without BOM。PowerShell 驗證不會報錯但 kiro-cli runtime 會失敗。修正工具：`.kiro/.harness/_fix-bom.ps1`
- **Agent JSON `model` 用 agent-level**：agent JSON 直接設定 `"model"` 欄位（opus/sonnet/haiku 三級），不再依賴 orchestrator stage-level 分派
- **ESP Playwright 安裝放專案根目錄**：`package.json` + `playwright.config.ts` 放根目錄，各功能子目錄只保留 `verify-mock.spec.ts`；從根目錄 `npx playwright test` 跑所有截圖
- **手動 subagent 不觸發 orchestrator 交握**：在 chat 中直接用 `subagent` 工具執行 DAG 不會自動更新 `harness/runs.md` 和 `state.json`，需手動補正或改用 orchestrator agent
- **Harness 交握全靠 LLM 自主行為**：state.json/handoff/runs.md 寫入沒有 hook/script 強制觸發，全靠 LLM 解讀 prompt 後自行呼叫 fs_write。解法：加入「第零規則」雙重閘門驗證
- **verify-spec 首輪跳過 harness 導致不合規**：直接在 prompt_template 注入結論、跳過 Gate/handoff，結果 harness 目錄缺中間交握檔案。必須只傳 run_id 讓每個 agent 自行讀 state → handoff → 執行 → 寫 handoff → 更新 state
- **E2E skip 條件過寬導致錯誤降級**：esp-vspec-e2e 的環境檢查路徑錯誤（指向 doc_root/playwright 而非專案根目錄）且 orchestrator prompt 中直接斷言「環境不可用」。修正：(1) 環境檢查改為從專案根目錄 `npx playwright --version`；(2) 只有 module 非 esp-system-ui 才 skip；(3) 環境已裝 Playwright 時禁止降級

---

## Current Focus

- **esp-verify-spec 三輪試跑完成 ✅**（2026-06-05）：diff_rate 21% → 12.8% → 12.8%（第三輪確認穩定），E2E 14 場景全通過。harness 交握正確，prompt 修正完成。
- **下一步：決定是否修正 reissuebyESP SD**：diff_rate 12.8%，建議個別修正 SD §4.2（PLATFORM_ESP 常數值）與 §11（issueSMS fallback），無需重產全套文件。
- **🟡 [ESP] skills / prompts 拆分**（2026-06-05）：將 `.kiro/skills/esp-analysis-step.md` 的分析工法（Layer 1→4b 方法論）抽出為跨專案可用的通用分析 skill。

## Entry Points

**專案路徑**（相對於專案根目錄）
- Instructions: `.kiro/steering/product.md`, `.kiro/steering/structure.md`, `.kiro/steering/kiro-layout.md`
- Skills: `.kiro/skills/esp-analysis-step.md`
- Prompts: `.kiro/prompts/write-spec.md`（規範，雙軌並存）, `.kiro/prompts/start-analysis.md`（orchestrator）, `.kiro/prompts/start-analysis-usage.md`（速查表）
- Agents: `.kiro/agents/start-analysis.json`（Ctrl+Shift+S）+ 10 個 `esp-*.json`
- E2E Checklist: `.kiro/.harness/E2E-VALIDATION-CHECKLIST.md`
- Code: `esp-system-core/`, `esp-system-ui/`, `esp-remoting-server-web-service/`

**Vault 路徑**（相對於 `P:\MEMORY`）
- Context: [knowledge/knowledge.md](../../knowledge/knowledge.md), [projects/esp/esp.md](esp.md), [knowledge/conventions.md](../../knowledge/conventions.md)
- Domain Knowledge: [projects/esp/harness-map.md](harness-map.md), [projects/esp/worker-dag.md](worker-dag.md), [projects/esp/docs-structure.md](docs-structure.md)
- Harness: [projects/esp/harness/runs.md](harness/runs.md), [knowledge/harness-protocol.md](../../knowledge/harness-protocol.md)

## Next Actions

- [x] **🔴 首次試跑 esp-verify-spec** ✅（2026-06-05）：diff_rate=21%，harness 交握正確，SD-review.md 產出正確。教訓：必須只傳 run_id 讓 agent 自行做 Gate/handoff
- [ ] **決定是否重產 reissuebyESP SD**：diff_rate 21% > 10%，主要差異在 issueSMS fallback / archivePremium exportEbao / CF NOMOBILE；若決定重產，執行 start-analysis mode B
- [x] **🟡 verify-spec 改造為 AgentFlow worker** ✅（2026-06-05）
- [ ] **SDD 第一階段簡報重整輸出 PPT/PPTX**：將現有 Markdown 內容重新整理後輸出為 PPT/PPTX（來源待確認，下次 session 開始時先確認 Markdown 素材路徑）
- [ ] **🟡 skills / prompts 拆分 — 跨專案通用分析 skill**：將 `.kiro/skills/esp-analysis-step.md` 的 Layer 1→4b 分析工法抽出為獨立通用 skill（如 `analysis-methodology.md`），ESP 專屬 pitfall / 欄位格式留在 ESP skill；讓 POS / Core / PA / ADP 可引用相同分析流程（2026-06-05）
- [ ] **研究 AIDLC（AI Development Life Cycle）**：釐清 AIDLC 方法論是否能改善現有分析流程，評估是否值得整合或調整現有 write-spec / harness 架構
- [x] **修正 Playwright 安裝流程** ✅
- [x] **AgentFlow 開放化** ✅
- [x] **填入 `.kiro/harness/` 知識文件** ✅
- [x] **驗證 orchestrator 知識骨幹交握** ✅（2026-06-01）
- [ ] 測試 2：冷啟動測試（從 Next Actions 挑未分析功能跑全套）
- [ ] 測試 3：蒸餾測試
- [ ] 測試 5：失敗處理測試

## Done this week

- [2026-06-05] `esp-verify-spec` 第三次試跑（chat subagent）完成：SD-review.md 確認 diff_rate=12.8% 穩定，E2E 0 差異，建議個別修正 D-01/D-02/D-04；run_id: 20260605-1700-verify-reissuebyESP
- [2026-06-05] `esp-verify-spec` 第二次試跑完成（含 E2E）：diff_rate=12.8%，E2E 14 場景全通過，5 張截圖更新；修正 playwright.config.ts + esp-vspec-e2e.md 降級策略；run_id: 20260605-1507-verify-reissuebyESP
- [2026-06-05] `esp-verify-spec` 首次試跑完成：reissuebyESP diff_rate=21%，harness 4-stage 全通過 Gate，SD-review.md 產出正確；run_id: 20260605-1359-verify-reissuebyESP
- [2026-06-05] `esp-verify-spec` mini-orchestrator + 4 子 agent（`esp-vspec-mock` / `esp-vspec-static` / `esp-vspec-e2e` / `esp-vspec-report`）全套實作完成；`harness/_template/` 新增 4 個範本；`kiro-layout.md` agents 清單與文件類型對照表更新；`_validate-agents.ps1` 補建；`worker-dag.md` 新增家族段落。觸發：`@verify-spec <FUNCTION_NAME>` / Ctrl+Shift+V
- [2026-05-26] `start-analysis.md` §1 修正：orchestrator 啟動時若 `runs.md` 不存在自動建立，解決新使用者 clone 後首次執行的雙報錯問題（Error reading files + Error searching workspace）

## Blocked

- 無（runtime E2E 測試需使用者親自執行；`/agent` 切換與 `subagent` DAG 觸發為 runtime 行為）

## Decisions / Constraints

- **Playwright 安裝架構**（2026-05-20 確認）：`package.json` + `playwright.config.ts` 放專案根目錄，`testMatch: '**/playwright/verify-mock.spec.ts'` 自動掃描所有功能的 spec；各功能子目錄只保留 `verify-mock.spec.ts`（不含 package.json / node_modules / config）。執行方式：根目錄 `npx playwright test`
- UI 驗證使用 Mock HTML 截圖模式，不連線 ESP 環境。
- 分析產出遵循 `.kiro/steering/kiro-layout.md` 定義的資料夾結構。
- 所有 skills 共用 `esp-technical-pitfalls.md` 防幻覺知識庫。
- `P:\MEMORY` is optional personal context; if unavailable, rely on `.kiro/steering/` and source code.
- ESP session routing 採 knowledge-first：先讀 `knowledge/knowledge.md` 與對應 knowledge map，再讀 `projects/esp/status.md`；status 只承接工作狀態。
- **Harness 重構原則**（2026-05-18 確認）：
  - 不重構既有 `.kiro/skills/esp-*.md`（透過 `resources: skill://` 引用）
  - 不破壞 `write-spec.md`（僅在開頭加雙軌章節 + 末尾加對照表，原內容保留）
  - 不破壞 `session-memory.md` / `conventions.md` 既有蒸餾協議（harness-protocol.md 為補充）
  - **模型分派改為 agent-level**（2026-05-21 確認，推翻 5/19 stage-level 決策）：agent JSON 直接設定 `"model"` 欄位。分級：`esp-sd` = `claude-opus-4.6`（架構分析最需推理）；`esp-sa/rules/flow/erd/ui-verify/api-contract/start-analysis` = `claude-sonnet-4.6`；`esp-deps/vars/funcs` = `claude-haiku-4.5`（結構化提取）。理由：agent-level 設定更直觀、不依賴 orchestrator 動態分派、每個 agent 獨立可測
  - 快捷鍵 `Ctrl+Shift+S`（環境檢查無衝突）
- **Harness 設計決策（13 場景）**（2026-05-18 確認）：路徑判定靜默開跑（A-1）、進度逐 stage 列印（A-2）、模式 B 異動清單使用者自列（B-1）、模式 A/B/C 同入口（B-2）、續跑自動偵測（C-1）、嚴格未完成判定（C-2）、單 worker 重跑直接 `/agent`（D-1）、重跑更新原 state.json（D-2）、失敗自動重試 2 次（E-1）、summary 列出補救命令（E-2）、harness 7 天保留（F-1）、建立 runs.md 主清單（F-2）、不整合 verify-spec（F-3）
- **Harness 蒸餾分工**（2026-05-19 確認，依 session-memory.md 核心精神修正）：
  - **run-level**（orchestrator 自動）：只寫 `harness/<run_id>/summary.md` + 更新 `harness/runs.md`；run 結束印 run-level 訊息，**不**印 `Memory has updated!`
  - **session-level**（使用者觸發 `/save`）：依 `conventions.md` Session 結束協議寫 `journal/log.md` + `status.md`；ESP 額外掃 `harness/runs.md` 取本日終態 run 彙整為 log 條目
  - orchestrator **禁止寫** `journal/log.md` / `status.md` / `lessons-learned.md`（`start-analysis.json` 的 `fs_write.allowedPaths` 已收緊）
  - 理由：避免一次 session 多 run 造成多條 log 條目重複寫入、`Current Focus` 被誤覆寫
  - 涉及檔案：`prompts/start-analysis.md` §9 + 檔頭硬限制、`prompts/save.md`（補 ESP harness extension）、`harness-protocol.md` §10/§11
- **subagent 限制**：原生工具僅支援 `mode: blocking`，不支援自動重試 — 重試邏輯由 orchestrator prompt 自行控制（最多 2 次）
- **手動 subagent vs orchestrator 差異**（2026-05-19 確認）：在 chat 中直接使用 `subagent` 工具執行 DAG，不會觸發 orchestrator 的 state.json 更新和 runs.md 追加邏輯。若需要知識骨幹正確交握，必須透過 orchestrator agent（`Ctrl+Shift+S`）執行
- **Playwright 安裝責任**（2026-05-19 確認）：esp-ui-verify 產出 Mock + spec 後，需確保目標目錄有 `package.json` 且 Playwright 已安裝。AI 無終端機權限時須明確提示使用者執行 `npm install` + `npx playwright install chromium`
