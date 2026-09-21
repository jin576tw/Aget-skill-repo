# consult-codex 模型路由準則

## 模式預設

| 模式 | 預設 | 說明 |
|---|---|---|
| second-opinion（quick） | Luna + medium | 深度問題改 Terra 或 Sol |
| review（normal code review） | Terra + high | 跨模組、安全或 critical review 改 Sol |
| architecture | Sol + high | |
| debug | 原因較明確 Terra；複雜、原因不明 Sol | |
| debate | Sol + high | 目的即取得高品質、獨立、具挑戰性的分析；高風險議題可 xhigh |
| implement | 依任務規模套用下列準則 | 機械式修改 medium，需推理的修改 high |

## 選 Luna（大部分條件符合）

- 1～2 個檔案、問題明確、scope 已限定
- 不涉及 architecture 或重大 trade-off
- 不需要大量 repository context，失敗成本低

典型：小型 code review、單一函式檢查、明確 bug 的第二意見、命名、簡單 TypeScript／JavaScript 問題、小型 refactor 建議、小範圍測試案例補充、README／comment／文件 review、快速 sanity check。例：「Check whether this RxJS subscription leaks.」

## 選 Terra（大部分條件符合）

- 數個相關檔案、一般 feature／bug
- 需要理解部分 project context、比較 implementation options
- 正常程度推理，但不涉及重大 architecture decision

典型：一般／多檔案 code review、一般 debug、Angular／React component flow、RxJS flow、service design、state management、API integration、unit test／E2E strategy、中型 refactor、design trade-off、一般 second opinion。例：「Review the authentication flow across these components and services.」

## 選 Sol（出現任一重要條件即考慮）

- 跨多個模組、architecture decision、framework／architecture migration
- 原因高度不明、production-critical bug
- 安全性問題、複雜 concurrency／race condition、performance architecture
- Claude 自己不確定、多個合理方案難以取捨
- 需要 adversarial review／debate，或使用者明確要求深度分析

## Effort 準則

模型與 effort 分開判斷：模型看 scope、context 量與能力需求；effort 看單次推理深度與出錯代價。

| Effort | 何時用 | 例 |
|---|---|---|
| low | 機械式確認，答案幾乎可直接查到 | 確認某個已知 error message、格式／命名 sanity check |
| medium | 範圍明確、推理步驟少 | 單一函式 review、文件 review、小型 refactor 建議 |
| high | 需要多步推理、比較方案或追蹤資料流（多數 consultation 的預設） | 一般 code review、debug、架構挑戰 |
| xhigh | 出錯代價高，或 high 已給出矛盾／淺層結果 | security review、production-critical bug、debate、race condition |
| max／ultra | 只在使用者明確要求時 | — |

- 支援的 level 依模型而異（例如 Luna 沒有 ultra）；不確定時查 `~/.codex/models_cache.json` 的 `supported_reasoning_levels`，或以 CLI 錯誤為準並回報。
- 一律在命令列明確傳 effort，不繼承 `~/.codex/config.toml` 的預設。
- 常見組合：Luna + high（小但刁鑽，如 RxJS 訂閱洩漏邊界）、Terra + medium（多檔但只需逐項核對）、Sol + medium（需大 context 的快速架構 sanity check）。

## 反例

- 短 prompt ≠ Luna：「Should we replace this shared state architecture with Signals?」是架構決策 → Sol。
- 長 prompt ≠ Sol：一大段 log 只要求確認某個已知 error message → Luna 或 Terra。

## 升級

只在結果不足、矛盾、高風險 finding 或需要更深推理時升級，一次只升一步，並在回報中註明原因：

- **理解了 context 但推理淺、漏邊界** → 同模型提高一級 effort（medium → high → xhigh）。
- **缺能力、誤解 context 或範圍超出模型** → 換大一級模型（Luna → Terra → Sol），effort 依新任務重新判斷。
