# 驗證狀態

本頁區分已執行與尚未由環境證明的能力，不把 fixture 當成宿主端到端結果。

- Node 自動測試（39 項通過，macOS；Node 18 與 24）：checkpoint／finalize、三種知識蒸餾、衝突／symlink、失敗注入與重啟重試、board 的 hash／claim／依賴、setup 的衝突與恢復、pending session 所有權、DOCX ZIP/Unicode/CRC、既有 hooks。
- 官方 skill validator：30 skills 通過。
- 官方 plugin validator：Codex manifest 通過；Claude plugin validate 通過。
- 實際 Codex app-server 0.153.4：隔離專案的 skills/list 找到全部 30 個 Aget skills，hooks/list 找到 6 個對應事件，無解析錯誤／警告；hook trust 仍為 untrusted，未繞過信任。
- Hook payload fixtures 驗證 flush、無資料／錯誤輸入／錯 session 不寫 handover，主輪 Stop 追加 journal 並只清過期 hook 條目；這不等於宿主已執行所有事件。

2026-09-12 已在 macOS 以 user scope 安裝 Claude＋Codex 與 hooks；首次安裝回傳 `SETUP_COMPLETE`（30 skills），讀回檢查回傳 `SETUP_CURRENT`、changes／removed 皆空。檔案清冊確認 `.agents/skills` 與 `.claude/skills` 各 30 個可讀 `aget-*` skill、Claude 5 個 `aget-*` agent，兩宿主 hook 事件均已寫入且既有 hooks 保留。這證明安裝器在目前 macOS 使用者層的落地與冪等性，不證明既有 session 已重載或模型已正確路由。

Native Windows 執行、真實 Claude／Codex 對話的自動選用與 compact／clear／idle 全生命週期仍未執行。Windows 路徑與舊 hash 的單元案例不能代替原生平台驗證。description 提供選用線索，不能保證每次模型都選對。沒有修改或繞過使用者既有宿主信任設定。

手動宿主驗收：在隔離專案執行 setup，依宿主正常信任機制啟用後開新 session；從自然開發需求核對 start-work，小需求不建立 board；研究需求核對 ask-arxiv。保存 paused checkpoint 後用另一宿主讀取並核對目標、限制及下一步；在已有 pending request 下觸發該宿主支援的 Stop／compact／結束事件，確認只 flush 一次且不結案。全部目標完成後再驗證 finalize 的來源與 status 链接。測試不可用時保留交接，不標成功。

## 2026-09-13 任務契約調整

本輪已在分支工作樹補上 Execution Brief、board 任務資訊、AC 追溯與案例拆分邊界，縮準 Playwright 觸發及規格／測試參考入口。設計決策與來源見 [工具盤點](tool-design-audit.md)。後續已於 99ef5fd 提交、推送並更新 macOS 全域安裝，讀回 SETUP_CURRENT、changes=[]、removed=[]。

本機 `npm test` 39/39 通過、`npm run check` 與 `git diff --check` 通過；新增 board 範本以實際 workspace 與計算後的 contract hash 經 `parseBoard` 讀取成功。六個修改的 SKILL.md 已納入套件 metadata／連結檢查；官方 quick_validate 因系統及宿主 bundled Python 均缺 PyYAML 而未能執行，不能列為通過。未安裝全域依賴。

以上證明套件、文件及 board 相容性，不證明不同模型收到任務包後的實際行為。Opus／Sol 控場、Sonnet／Luna 執行的情境對照，以及新版全域載入仍未驗證。本輪未建立任務 handover，亦未清除既有實作或 Windows 驗收交接。

## 2026-09-13 模型情境測試

基底 99ef5fd，在隔離目錄與獨立 context 執行兩個合成小任務，針對發現重測一次。採用使用者既有分工的 GPT-5.6 Sol 與 GPT-5.6 Luna；Claude 未測，沒有新增框架、工具、Agent 或模型設定。

- Sol 規劃情境：只準備設定頁任務包。AC 為成功訊息可見、使用伺服器 displayName、失敗保留輸入並顯示錯誤；已知 profile.ts、profile.test.ts 及 npm test。產出完整 scope／Context／AC／Done，未建立 board 或開始實作；但只安排 node:test，未列真實畫面驗證缺口。
- 修正：只改 Execution Brief 的 Tests 欄，要求證據能證明 AC，GUI 可見效果須有實際渲染證據，缺環境列待補驗證。
- Sol 重測：同一請求、新的獨立 context。產出加入不能用純邏輯測試宣稱實際 UI 可見、缺渲染證據須列待補；仍僅產出 brief。這是一次成功重測，不是統計上已證明改善。
- Luna 執行情境：normalizeTags 空值、trim 後去重、保留大小寫及首次順序，要求 TDD，可一批完成三項 AC。新測試 4 項中 2 項失敗（null.split、重複值未移除），修正後 4/4 通過；只修改 normalize.mjs 與 normalize.test.mjs。主會話重跑 4/4 並額外核對空白、順序及大小寫邊界，均通過。

Sol 被明確提供 Execution Brief／start-plan 路徑，屬指引使用測試。Luna 被指定 start-work 入口，實際讀取全域 start-work（cmp 與來源相同），未讀 TDD skill 或其他 references，也未載入 Playwright／建立 board；行為仍符合紅綠驗證。紅燈摘要來自執行 agent 回報，綠燈與額外邊界由主會話重跑。不能把以上視為完整自然路由驗證。

本輪不是 Sol 任務包交給 Luna 的完整串接，也不涵蓋 Claude、Windows、宿主生命週期或效能比較。未增加固定單一 AC 回合、重複確認或技能必讀要求。套件與 diff 檢查通過；僅修改 Markdown，未重跑與文字變更無關的 runtime 回歸。本輪修正尚未提交或更新全域安裝。

### Codex 控場→執行串接補測

將 Sol 重測產生的 brief 原樣交給 Luna，隔離 fixture 提供 profile.ts、node:test 測試及 npm test。Luna 實作成功／失敗狀態並保留請求介面，明確回報沒有 UI 渲染及登入 fixture，未冒充全 UI 通過。其 Node 18 無法以 npm test 直接載入 .ts；替代 state 行為檢查通過。主會話使用宿主 bundled Node 24 執行同一測試檔，5/5 通過。Node 版本差異是 fixture 環境問題，不增加永久 runtime 管理工具。

另觀察到 fixture 未定義失敗回應格式，Luna 自行支援 ok／success／error 三種欄位。這屬未經來源證實的 API 假設，因此只補 Execution Brief 的 Context 欄，要求區分已知契約與待查事項；此第二項調整尚待 Claude 獨立重測，不列為已驗證改善。

使用者最新要求：Claude 必須測試並回寫同一份 handover，Codex 核對證據通過後才提交推送／更新全域。待測交接保存在 personal-memory 的 handovers/aget-skill-repo--2fea27f2--claude-model-scenarios.md。Codex 部分完成；Claude CLI 本機未登入，需由已登入 session 接續。

### Claude 回寫與 Codex 發布前核對

Claude Code 桌面版回寫：Opus 5 規劃、Sonnet 5 執行獨立 context，A 任務包與串接通過（5/5），未猜測 API 失敗欄位。B 首次自行採不分大小寫去重，屬需求忠實度失敗；start-work 增加不擴充未定義規則的一句提示後，在新 context 重測真實紅燈→3/3 綠燈。只做一行規範修正，未新增工具。模型名稱依派工設定與 agent 自報，非服務端模型遙測。

Codex 核對 Claude 回寫的完整 diff SHA256 6cd3b94e8f59fad49cd920f884fc5e12497ea15ee100878a94e06cae627b4ae8 與工作樹一致（本段新增前）。實際檢視 fixture／patch／紅綠紀錄，使用 bundled Node 24 重跑 A＋B，8/8 通過；另核對大小寫敏感與空白邊界通過。package 與 diff 檢查通過，允許發布本輪 Markdown 修正。

本機證據索引：`/Users/jjin576tw/Desktop/aget-claude-scenarios-20260913/evidence/README.md`。小樣本重測不能證明因果改善；真實 UI、登入 fixture、Windows、自然路由、跨模型多次取樣仍未驗證。Codex 模型未針對 Claude 新增的一句提示另做獨立生成重測，不以本次 fixture 重跑冒充該項驗證。

## 2026-09-13 Claude Code plugin 安裝

新增 `.claude-plugin/marketplace.json`、`hooks/hooks.json` 與 record.mjs 的 `--plugin` 模式，README 改寫為安裝說明與工具總表。

- `claude plugin validate .` 與 `.claude-plugin/plugin.json` 驗證通過（Claude Code 2.1.263）。
- 以隔離 `CLAUDE_CONFIG_DIR` 執行 `claude plugin marketplace add <本機 repo 路徑>` 與 `claude plugin install aget-skill-repo@aget` 成功，`plugin list` 顯示 enabled。
- `claude --plugin-dir` 實際 session：debug log 顯示載入 30 skills、5 agents、註冊 6 hooks；模型列出 35 個 `aget-skill-repo:` 名稱。第一次實測發現 cwd 不在家目錄下時，plugin 與既有 user-scope setup hook 同時寫 journal，其中一個回報 WRITE_LOCKED；修正為 plugin 模式遇到家目錄的 setup hooks 安裝時讓出，重測只剩一個 Stop 輸出。
- `npm test` 49/49、`npm run check` 通過；check 另檢查 marketplace source、plugin hook 腳本路徑，以及 README 是否列出所有 skills 與 agents。

尚未驗證：從 GitHub 以 `jin576tw/Aget-skill-repo@start-work-plugin` 加入 marketplace（變更尚未推送），以及 Windows 上 `${CLAUDE_PLUGIN_ROOT}` 指令的執行。
