# SA 範本完整性修正驗證

來源：ADDR33 workflow-retro 交接第 10 項，以及本 repo 的 `skills/spec-conventions/SKILL.md`、`sa-writing.md` 與 `agents/spec-reviewer.md`。本次修工具規則，不改 ADDR33 成品或計畫板。

## 修正範圍

一般規格依任務適用；已採用 SA 範本時遵守其必要內容。「現有專案格式」指核准格式，不能把漏章的改寫成品當成範本。改版須保存可還原基準，核對章節及內容去向；必要內容刪除須有使用者決策。Reviewer 以相同準則唯讀核對。

## 情境走查

以下為主會話依修正後規則進行的語意走查，並非獨立模型實跑或真實文件改寫測試。表內輸入為虛構的最小案例；通過表示規則可明確導出所列處理，不能推論所有宿主會自動載入或遵守。

| 類型 | 輸入／請求 | 預期與走查結果 |
|---|---|---|
| 正向 | 已採用通用 SA，UC-A、UC-B 各有 5.1～5.5，4.2 列兩筆，改版僅搬移錯誤訊息 | 保留兩個 UC 的必要子節，記錄訊息新位置，無內容遺失；不額外索取批准。符合。 |
| 反向 | 已採用通用 SA，API 規格新版刪除 §4、UC 物件與循序圖，理由是易讀 | 判為未核准的必要內容遺失，須補回或列待決；API 標題及易讀性不構成豁免。符合。 |
| 反向 | 未追蹤的 SA 即將覆寫，只修改文件版本號；repo 的 diff 為空 | 尚無可還原前版；先另存不覆寫的可讀快照，不自動 commit。符合。 |
| 邊界 | API 無 UI、不新增資料表，但讀取既有參考資料 | §3 交代端點情境；5.5 核對既有資料及來源，不直接略過，也不虛構資料表。符合。 |
| 邊界 | 已確認沒有資料實體，採用的 SA 範本仍要求 ERD 子節 | 保留 5.5，寫明不適用原因與依據；不以他章的一句話代替。符合。 |
| 反向路由 | 使用者只要求一般 API 文件，未採用 SA 範本 | 不強加 §4／§5 與 UC 物件；按本次 API 契約需求處理。符合。 |
| 相容性 | 已核准的專案範本採其他編號；使用者另有可定位的刪除決策 | 依該範本對照必要內容及決策，不強制通用編號，不反覆索取相同批准。符合。 |
| 證據邊界 | Reviewer 只有新版，無前版／範本 | 明示完整性比對未驗證，不宣稱通過，也不修改或製作備份。符合。 |

## 機械驗證與限制

使用 `npm test` 驗證既有工具回歸、`npm run check` 驗證封裝／相對連結／metadata，另以 `git diff --check` 核對空白。這些檢查不證明語意判斷。

2026-11-13 Windows 實測：`npm test` 78/78 通過，0 失敗／略過；`npm run check` 通過（35 skills）；`git diff --cached --check` 通過。

安裝沿用 user-scope setup（both），核對 `.agents/skills/aget-spec-conventions`、`.claude/skills/aget-spec-conventions` 及 Claude reviewer 與 repo 的 SHA256，並以 setup `--check` 確認無待更新項目。既有 session 是否重載不在此驗證範圍。

系統 skill-creator 的 Python `quick_validate.py` 因本機缺 PyYAML 未執行成功；內建 package check 可檢查本次未變更的 name／description metadata 與相對連結，不能冒稱 Python validator 通過。

`agents/spec-reviewer.md` 原有未提交的審查收斂修改保留在 working tree；本次提交僅加入 SA 完整性段落。安裝保留該既有修改，未將其混入本次 commit。
