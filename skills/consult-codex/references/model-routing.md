# consult-codex 模型路由準則

## 模式預設

| 模式 | 預設 | 說明 |
|---|---|---|
| second-opinion（quick） | Luna + medium | 深度問題改 Terra 或 Sol |
| review（normal code review） | Terra + high | 跨模組、安全或 critical review 改 Sol |
| architecture | Sol + high | |
| debug | 原因較明確 Terra；複雜、原因不明 Sol | |
| debate | Sol + high | 目的即取得高品質、獨立、具挑戰性的分析 |
| implement | 依任務規模套用下列準則 | |

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

## 反例

- 短 prompt ≠ Luna：「Should we replace this shared state architecture with Signals?」是架構決策 → Sol。
- 長 prompt ≠ Sol：一大段 log 只要求確認某個已知 error message → Luna 或 Terra。

## 升級

Luna 結果不足／不確定 → Terra → 仍有重大不確定性 → Sol。只在結果不足、矛盾、高風險 finding 或需要更深推理時升級；每次升級在回報中註明原因。
