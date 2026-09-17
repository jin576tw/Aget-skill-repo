---
name: consult-codex
description: >
  Consult Codex from Claude Code through the local `codex exec` CLI for
  independent code review, second opinions, architecture discussion, debugging
  analysis and adversarial debate, routing each call to the smallest reliable
  GPT-5.6 model (Luna / Terra / Sol). Claude Code remains the coordinator,
  verifier and final decision-maker.
  Use when the user explicitly asks for Codex or GPT (ask/consult Codex, Codex
  review, second opinion from Codex, debate Codex, use Luna/Terra/Sol, 問一下
  Codex、請 Codex review、讓 Codex 看一下、用 Sol review、讓 Luna 看一下、找 Codex
  討論), or when a complex review, architecture or debug decision clearly
  benefits from an independent second opinion. Do not use for routine coding
  tasks, and do not use when the host agent is already Codex.
compatibility: >
  Requires Codex CLI (`codex`) installed, authenticated and on PATH in the same
  shell as Claude Code.
metadata:
  version: "1.0"
---

# consult-codex

## 完成目標

Claude Code 是協調者、路由者、驗證者與最終決策者；Codex 是外部顧問。Codex 的回答永遠是待驗證的意見，不是結論。

## 何時呼叫

1. 使用者明確要求 Codex、GPT 或 Luna／Terra／Sol。
2. 複雜 code review、架構、除錯或方案取捨，獨立意見能顯著增加價值。

一般 coding 任務不呼叫。若目前宿主本身就是 Codex，不要透過 CLI 呼叫自己。

## 模型路由（呼叫前必做）

目標是**足以可靠完成任務的最小模型**，不是一律用 Sol，也不是為省成本把難題丟給 Luna。

| 模型 | 定位 | 指令參數 |
|---|---|---|
| Luna | 快速、範圍明確、低風險的小任務 | `-m gpt-5.6-luna -c 'model_reasoning_effort="medium"'` |
| Terra | 一般工程 consultation，**無法判斷時的預設** | `-m gpt-5.6-terra -c 'model_reasoning_effort="high"'` |
| Sol | 深度推理、高風險、跨模組、高不確定性 | `-m gpt-5.6-sol -c 'model_reasoning_effort="high"'` |

判斷依據是 scope、complexity、uncertainty、risk、檔案／模組數與是否需要架構推理，**不是 prompt 長度**：一句「要不要把 shared state 換成 Signals？」是架構決策（Sol）；很長的 log 只要求確認已知錯誤訊息仍可用 Luna／Terra。

1. **使用者指定模型優先**（「Use Sol」「讓 Luna 看一下」）：照用，不得自行更換；不可用時回報錯誤，不偷偷 fallback。
2. **直接 Sol**：Architecture Review、Critical Production Bug、Security Review、大型 Migration、根因不明的 Complex Debug、Cross-module Design、Debate。
3. **其餘**：大多數條件符合 Luna 準則選 Luna、符合 Terra 準則選 Terra、出現任一 Sol 重要條件考慮 Sol；仍不確定選 Terra。
4. **升級**：只有在結果不足、存在矛盾、高風險 finding 或需要更深推理時，才 Luna → Terra → Sol 升一級；不要機械式每次跑三個模型。

各模式預設與 Luna／Terra／Sol 的完整準則見 [references/model-routing.md](references/model-routing.md)，無法立即判斷時讀取。回報時說明選了哪個模型與一句理由。

## 流程

1. **CLI 檢查**：本 session 第一次使用前執行 `codex --version`。失敗就停止委派並告知使用者 CLI 未安裝、不在 PATH 或未登入；絕不模擬 Codex 的回答。
2. **Claude 先思考**：second-opinion、architecture、debate 先形成自己的初步立場；review 先確認範圍（diff、檔案、需求）。
3. **路由**：依上節選模型與 effort。
4. **組 prompt**：採 [references/prompts.md](references/prompts.md) 的共通外框與對應模式段落，一律包含防遞迴規則（不得呼叫 Claude、不得執行 `claude -p`、不得委派其他外部 coding agent），提供必要 context，不附機密。
5. **安全呼叫**：prompt 寫入暫存檔（quoted heredoc 或 Write 工具），以 stdin 傳入，不拼進命令列：

   ```sh
   prompt_file="$(mktemp)"
   cat > "$prompt_file" <<'CODEX_PROMPT'
   ...prompt...
   CODEX_PROMPT
   codex exec -m gpt-5.6-terra -c 'model_reasoning_effort="high"' \
     -s read-only --ephemeral -C "<repo>" \
     -o "$prompt_file.out" - < "$prompt_file" > "$prompt_file.log" 2>&1
   echo "exit=$?"
   ```

   - 唯讀（預設）：`-s read-only`，Codex 不能改檔。`-C` 指向要審查的 repo；非 git 目錄加 `--skip-git-repo-check`。
   - `-o` 只存最終回答；完整過程與錯誤在 `.log`。
   - 回應可能需要數分鐘，Bash timeout 設足（例如 600000 ms）或背景執行。
6. **失敗處理**：保留 exit status 與 log 關鍵錯誤，分類為 authentication、model unavailable、permission／sandbox、invalid argument、CLI unavailable 或 timeout 後回報。不得 silent fallback 成 Claude 自己回答並冠上 Codex 名義；模型不可用時回報，使用者允許才換模型。
7. **驗證**：對 Codex 的每個重要主張，對照原始碼、測試、文件、實際執行或需求判斷成立、不成立或無法驗證。debug 假設在有證據前不是 root cause。
8. **輸出**：依情況精簡或完整使用下列格式，明確區分 Codex 原意見與 Claude 判斷：

   ```
   ## Codex 的看法（模型：<model>，理由）
   ## Claude 的檢查
   ## 差異
   ## 結論
   ```

## Debate 限制

預設 Sol。Claude 立場 → Codex 對抗審查 → Claude 評估反駁 →（必要時）第二輪 Codex → Claude 綜合。最多 2 次 Codex 呼叫；使用者明確要求才多輪。

## Implementation mode

只有使用者明確要求 Codex 修改程式才進入：

1. Claude 界定可修改的檔案範圍與驗收條件，寫進 prompt。
2. Codex 修改期間，Claude 不修改同一批檔案。
3. 呼叫改用 `-s workspace-write`（不使用 `--dangerously-bypass-approvals-and-sandbox`）。
4. 完成後 Claude 檢視 `git diff`（確認未超出範圍）、執行測試並自行做最終驗證。
