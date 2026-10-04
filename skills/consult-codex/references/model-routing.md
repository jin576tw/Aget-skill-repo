# consult-codex 模型路由準則

模型定位、tier 與目標模型指令的唯一對照表是 [model-profiles.json](../../../rules/model-profiles.json)。選型先看任務複雜度，再按該模型 tier 組 prompt；不要在此複製模型特性或指令。

## 選型

- 規則固定、範圍明確、驗收容易：優先選 Luna。
- 中型實作、數個相關檔案或一般 debug：優先選 Terra 或 GPT-6 Sol。
- 架構、多系統、重大風險、原因高度不明：選 Sol 或 GPT-6 Astra。
- 使用者指定模型時維持指定模型；模型不可用時回報，不自行替換。

推理等級獨立判斷：明確工作從 medium 起，需追蹤多步因果或高風險時升 high／xhigh；GPT-6 Luna 可從 high 起。實際支援等級以模型選單與 CLI 為準。

## 組 prompt

選定目標模型後執行 `node ~/.aget/plugin/scripts/model-prompt.mjs <model-id>`，將輸出置於既有共通外框的 Task 前。`efficient` tier 以對照表中的「任務目標／輸入與範圍／明確規則／步驟／完成標準／不做的事」格式組織任務；缺少重要業務規則時先問。未知模型時腳本無輸出，不套用預設 tier。

結果不足、互相矛盾或風險超出原判斷時，先提高 effort；若是能力或 context 範圍不足，再改選更高能力模型。回報選用理由與實際驗證。
