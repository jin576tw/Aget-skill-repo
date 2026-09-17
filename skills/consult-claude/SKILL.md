---
name: consult-claude
description: >
  Consult Claude Code from Codex through the local Claude CLI for
  independent code review, second opinions, architecture discussion,
  debugging analysis, adversarial critique, and optional implementation.
  Codex remains the coordinator and final decision-maker.
  Use when the user explicitly asks for Claude or Opus (ask/consult/use Claude,
  Claude review, second opinion from Claude, compare with Claude, debate Claude,
  ask Opus, 問一下 Claude、請 Claude review、讓 Claude 看一下、找 Claude 討論、
  用 Claude 幫我檢查、讓 Opus 評估、讓 Claude 挑戰你的方案), or when a complex
  review, architecture or debug decision clearly benefits from an independent
  second opinion. Do not use for routine coding tasks, and do not use when the
  host agent is already Claude Code.
compatibility: >
  Requires Claude Code CLI (`claude`) to be installed,
  authenticated, and available in the same shell environment as Codex.
metadata:
  version: "1.0"
---

# consult-claude

## 完成目標

Codex 是協調者、驗證者與最終決策者；Claude 是外部顧問。Claude 的回答永遠是待驗證的意見，不是結論。

## 何時呼叫

1. 使用者明確要求 Claude／Opus。
2. 複雜 code review、架構、除錯或方案取捨，獨立意見能顯著增加價值。

一般 coding 任務不呼叫，避免延遲、token 與重複工作。若目前宿主本身就是 Claude Code，不要透過 CLI 呼叫自己。

## 模式與預設模型

使用者指定模型或 effort 時以使用者為準；否則：

| 模式 | 用途 | 預設 |
|---|---|---|
| review | Code／Critical review、重構評估 | `opus` + `high` |
| architecture | 挑戰 Codex 的設計、方案比較、API／framework 設計 | `opus` + `high` |
| debug | 複雜除錯推理 | `opus` + `high` |
| debate | Codex 立場 vs Claude 對抗審查，最多 2 次呼叫 | `opus` + `high` |
| second-opinion | 快速第二意見、小型 trade-off、命名、簡單檢查 | `sonnet` + `medium`（深度問題改 opus/high） |
| implement | 僅在使用者明確要求「讓 Claude 修改／implement」時 | 依任務 |

各模式的 prompt 範本與必要欄位見 [references/prompts.md](references/prompts.md)，呼叫前讀取對應段落。

## 流程

1. **CLI 檢查**：本 session 第一次使用前執行 `claude --version`。失敗就停止委派並告知使用者 CLI 未安裝、不在 PATH 或未登入；絕不模擬 Claude 的回答。
2. **Codex 先思考**：second-opinion、architecture、debate 先形成自己的初步立場；review 先確認範圍（diff、檔案、需求）。
3. **組 prompt**：採 references 的共通外框，一律包含防遞迴規則（不得呼叫 Codex、不得執行 `codex exec`、不得委派其他外部 coding agent），提供必要 context，不附機密。
4. **安全呼叫**：prompt 寫入暫存檔（quoted heredoc 或檔案寫入工具），以 stdin 傳入，不把內容拼進命令列：

   ```sh
   prompt_file="$(mktemp)"
   cat > "$prompt_file" <<'CLAUDE_PROMPT'
   ...prompt...
   CLAUDE_PROMPT
   claude -p --model opus --effort high --tools "Read,Glob,Grep" \
     < "$prompt_file" > "$prompt_file.out" 2> "$prompt_file.err"
   echo "exit=$?"
   ```

   - 唯讀（預設）：`--tools "Read,Glob,Grep"`，Claude 沒有 Bash／Edit，無法改檔也無法呼叫 codex。需要讀 repo 時在該 repo 目錄執行，或加 `--add-dir <path>`。
   - 回應可能需要數分鐘；設定足夠的 timeout。
   - 若 Codex 本身跑在沙箱（例如 `codex exec -s workspace-write`），`claude` 可能讀不到憑證而回 `Not logged in`。這是沙箱限制，不是未登入；回報時一併說明需在未沙箱或 full-access 的 session 重試。
5. **失敗處理**：保留 exit status、stderr 與關鍵錯誤，分類為 authentication、model unavailable、permission、invalid argument、CLI unavailable 或 timeout 後回報。不得 silent fallback 成 Codex 自己回答並冠上 Claude 名義。模型不可用時：回報錯誤；使用者允許才換模型；使用者要求必須 Opus 則停止委派。
6. **驗證**：對 Claude 的每個重要主張，對照原始碼、測試、文件、實際執行或需求判斷成立、不成立或無法驗證。debug 假設在有證據前不是 root cause。
7. **輸出**：依情況精簡或完整使用下列格式，明確區分 Claude 原意見與 Codex 判斷：

   ```
   ## Claude 的看法
   ## Codex 的檢查
   ## 差異
   ## 結論
   ```

## Debate 限制

Codex 立場 → Claude 對抗審查 → Codex 評估反駁 →（必要時）第二輪 Claude → Codex 綜合。預設最多 2 次 Claude 呼叫；使用者明確要求才多輪。

## Implementation mode

只有使用者明確要求 Claude 修改程式才進入：

1. Codex 界定可修改的檔案範圍與驗收條件，寫進 prompt。
2. Claude 修改期間，Codex 不修改同一批檔案。
3. 呼叫：`claude -p --model <m> --effort <e> --tools "Read,Glob,Grep,Edit,Write" --permission-mode acceptEdits < "$prompt_file"`；除非使用者同意，不給 Bash。
4. 完成後 Codex 檢視 `git diff`（確認未超出範圍）、執行測試並自行做最終驗證。
