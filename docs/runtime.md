# Aget runtime

Node.js >=18。核心使用內建模組，不需全域 npm 安裝；PowerShell 已移除。專業文件 skill 的 Python／PDF helper 是獨立格式能力，仍保留其授權與功能。

## 安裝、更新與檢查

在工具庫執行：

```sh
node scripts/setup-work.mjs --target /absolute/project --platform both
node scripts/setup-work.mjs --target /absolute/project --platform both --check
```

`--platform` 可為 claude、codex、both。明確需要事件備援時加 `--hooks`，並以 `--vault /absolute/vault` 指定此安裝位置的每輪 journal vault（記入 `.aget/installation.json`）；後續更新沿用啟用狀態與 vault。工作專案需寫入其他 vault 時，在該專案以 project scope 另行安裝並指定自己的 `--vault`。預設安裝範圍是指定專案；user scope 使用 `--scope user --target /absolute/user-home`，規範放到 .claude/CLAUDE.md 及 .codex/AGENTS.md，既有 Node 不合要求時先使用環境受信任的安裝方式，不自建 runtime 管理器。工具放在目標 `.aget/plugin`，skills 由 `.agents/skills/aget-*` 與 `.claude/skills/aget-*` 發現；CLAUDE.md／AGENTS.md 只更新受管理區塊。原生 plugin 安裝與 setup 的 skills 發現二擇一，避免重複安裝同一能力。

手動修改的受管理檔案或規範區塊報衝突；區塊外內容與其他 hooks 保留。缺少的受管理檔案可修復，新版移除的檔案僅按安裝清單與 hash 移除。首次安裝不會自動刪除先前無清單的全域副本；需先核對來源及差異。設定及 hook 信任由宿主管理，安裝成功不表示既有 session 已重載。Codex AGENTS.override.md 遮蔽時拒絕寫入失效目標。

## Claude Code plugin

`.claude-plugin/marketplace.json` 宣告 marketplace `aget`，唯一 plugin `aget-skill-repo` 的 source 為 repo 根目錄；安裝指令見 [README](../README.md#a-claude-code-plugin)。plugin 由預設目錄載入 skills、agents 與 `hooks/hooks.json`，不寫 CLAUDE.md 規範區塊。`hooks/hooks.json` 以 `--plugin` 呼叫 record.mjs，事件與 setup 的 Claude hooks 相同。plugin 模式沒有 `--hooks` 開關，因此未設定 `MEMORY_VAULT` 時不寫 journal 也不輸出訊息；cwd 往上或家目錄已有啟用 hooks 的 setup 安裝時，journal 讓給該安裝。checkpoint flush 仍會執行，重複 flush 由鎖與 pending 刪除處理。Codex manifest 不使用此 hooks.json。

## checkpoint 輸入

```sh
node scripts/memory.mjs checkpoint < checkpoint.json
```

```json
{
  "vault": "/absolute/vault",
  "workspace": "/absolute/project",
  "task": "feature-name",
  "session": "actual-host-session-id",
  "status": "paused",
  "goals": [{"id":"G1","title":"交付指定行為","state":"pending"}],
  "inflight": null,
  "summary": "已做事項、決策、修改、驗證、未完成／阻塞及恢復條件。",
  "expectedHash": "MISSING"
}
```

status 為 active／paused／completed；goals state 為 pending／blocked／pass，pass 必須有 evidence 字串。inflight 未知為 null，已確認沒有在途工作為 []。completed 需所有目標 pass 且在途為空，但仍不自動刪除 handover。實際證據是否足夠由模型及適用驗收判斷，JSON 不會證明語意正確。

expectedHash 是既有 handover 完整 UTF-8 bytes 的 SHA256，新檔填 MISSING；回應返回新 hash。內容相同不重寫。修改目標集合須顯式 reviseGoals:true，且應有需求變更依據，不得刪減目標湊完成。metadata 與接續摘要同在 Markdown 中，兩種 Agent 均可直接讀取。

舊 handover 不會被 checkpoint 覆寫；核對相同任務、完整目標與證據映射後，可用 `scripts/migrate-handover.mjs` 輸入相同欄位及 migrationReason，expectedHash 指向原檔。它只轉換同一目標檔，拒絕把共享 board 當一般交接。

## 結案

採用新契約的 vault 先執行：

```sh
node scripts/enable-vault.mjs /absolute/vault
```

此命令在 memory.md、AGENTS.md、handovers/handovers.md 加入一致的 Aget 契約；需有既有 vault 入口。保留外部內容；契約被手改時拒絕覆寫。這是 schema 遷移，不是日常必跑。

完成 checkpoint 後呼叫 `node scripts/memory.mjs finalize < finalize.json`：

```json
{
  "vault":"/absolute/vault",
  "workspace":"/absolute/project",
  "task":"feature-name",
  "expectedHash":"checkpoint-returned-sha256",
  "statusPath":"projects/example/status.md",
  "statusExpectedHash":"MISSING",
  "distillation":{
    "kind":"new",
    "reason":"本次發現可重用的驗證方法",
    "knowledge":["knowledge/verification.md"],
    "sources":["sources/sources.md"]
  },
  "writes":[
    {"path":"sources/sources.md","expectedHash":"current-sha256","content":"完整來源目錄，保留原內容並新增來源"},
    {"path":"knowledge/verification.md","expectedHash":"MISSING","content":"# 驗證方法\n\n具體蒸餾。[來源](../sources/sources.md)\n"}
  ],
  "limitations":"仍適用的限制"
}
```

`existing` 使用已存在 knowledge／sources 連結，不提供 writes；`none` 只提供 reason，不提供知識連結或 writes。來源需為仍存在的 vault Markdown，不可用將刪除的 handover；知識本文須有實際 Markdown 來源連結。內容與目錄維護仍需遵循 vault 的導航契約。禁止修改 raw；一般 durable 寫入限 knowledge、projects 與 sources/sources.md。status 只替換該 workspace/task 的受管理區塊，保留其他任務。

知識保存及讀回、status 保存及讀回、來源／handover hash 複核後才刪除 handover。任何失敗保留交接；相同內容重試不重複新增知識或 status 區塊。刪除失敗時 status 可能已記完成，但 handover 仍存在，需重試清理；成功後重送同 hash 可回 ALREADY_FINALIZED。這不是跨檔案原子交易。

## 事件備援

里程碑立即 checkpoint 是主要保存方式。`node scripts/stage-checkpoint.mjs < checkpoint.json` 可先保存待寫 request，回傳 pending hash；變更既有 pending request 需 pendingExpectedHash。每個 session 只允許一條待 flush 任務，切換 task 前需先 flush，避免覆蓋。

hook 僅 flush 已有 request，不掃描 transcript、不呼叫模型、不 finalize。主輪 Stop 另以 `last_assistant_message` 首段在 vault `journal/log.md` 追加一行（vault 取 `--vault`，否則 `MEMORY_VAULT`；setup 以 `--vault` 寫入 hook 指令）。只有 cwd 往上最近一個啟用 hooks 的安裝會寫 journal，所以 user 與 project 同時安裝時不會重複寫入，也不會寫錯 vault，刪除 90 天前的 `<!-- aget-hook -->` 條目，stdout 輸出 `{"systemMessage":"Memory has updated!"}` 或「Memory 未更新：原因」。兩宿主 Stop 輸入皆含 `last_assistant_message`，systemMessage 會顯示給使用者，Codex Stop exit 0 時須輸出 JSON（2026-09-13 核對原文）。即使 pending 原標 completed，延遲事件也會降為 active／未知在途，留待正常工作重新驗收。只有 compact／clear 事件但未整理 request，無法憑空產生接續內容。

| 宿主 | 設定與事件 |
|---|---|
| Claude | .claude/settings.json：Stop、Notification、PreCompact、SessionEnd、TaskCompleted、SubagentStop |
| Codex | .codex/hooks.json：Stop、PermissionRequest、PreCompact、SessionEnd、Interrupt、SubagentStop |

Notification 不是可靠通用閒置計時器，Codex 沒有此事件；Codex SessionEnd 與 Claude clear 語意不同。兩者均不可依事件推論任務已完成。依實際信任及版本載入，不跳過宿主信任檢查。[Claude 官方 hooks](https://code.claude.com/docs/en/hooks)、[Codex 官方 hooks](https://learn.chatgpt.com/docs/hooks)（2026-09-12 核對）。

## plan-board

`node skills/start-plan/scripts/plan-board.mjs` 從 stdin 接 JSON：

```json
{"action":"status","workspace":"/absolute/project","root":"/absolute/vault/handovers","taskId":"FEATURE-P01:IMPLEMENT"}
```

action：resolve、hash、validate、status、update。可用 plan/task 取代 taskId，file 可明確指定 root 內檔案。update 加 status、claim、expectedHash、summary、evidence；進入 in_progress 需 caller 提供 claim，completed 需同 claim 及證據。待依賴未完成不能開工，已完成任務不能重開，其他 claim 不能接管。contract hash 保留 CRLF→LF 及 trim 規則；舊 Windows 路徑 hash 為後備查找。Node 介面以 JSON 取代舊 shell flags；不自動 Git、不強制末項 INTEGRATION。

## 一致性與故障界限

Aget 的合作寫入方使用 `.aget-write.lock` 與預期 hash；hook pending 與 vault 使用不同鎖。鎖忙時不強制搶佔。崩潰留下鎖時，確認原程序已停止、核對檔案與預期 hash，再人工移除鎖後重試；不以時間自動破鎖。檔案替換以同目錄 temp + rename，不保證突斷電持久性；不合作的外部寫入仍有 TOCTOU 窗口。發現衝突即保留資料並重新核對。

核心回歸：`npm test`；套件／相對連結：`npm run check`。Native Windows 及模型情境觸發需在對應宿主環境驗證，不能由本機 fixture 推導已通過。
