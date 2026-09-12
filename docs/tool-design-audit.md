# 全工具過度設計審查

核對日：2026-09-12；來源 HEAD d61b66f。這是逐項設計處置清單；其中上游更新的 review／debug 與相容呼叫端已完成局部改寫，見 [main 整合紀錄](main-integration.md)。其他項目仍是待實作處置，不是全量功能回歸。所有公開入口均列出；附屬檔與程式做全量結構清冊、重複內容及呼叫依賴檢查，未宣稱每個第三方演算法已完成安全或功能審計。

判斷：限制方法且不增證據、重複入口、無條件外部副作用屬優先修正。必要資料鎖、來源保護、真實驗證及文件格式能力不視為過度設計。

## Skills（33）

| 工具 | 建議 | 責任與理由 |
|---|---|---|
| [angular-conventions](../skills/angular-conventions/SKILL.md) | 保留、縮限 | 框架慣例有獨立價值；不強制既有專案改 standalone |
| [angular-testing](../skills/angular-testing/SKILL.md) | 保留、改契約 | 移除 Step 3／指定 writer，保留行為測試與 AC 證據 |
| [bsd-report](../skills/bsd-report/SKILL.md) | 保留格式、換實作 | 報表格式有價值；移除 PowerShell 打包及固定八步，採 Node |
| [compact-signal](../skills/compact-signal/SKILL.md) | 合併成 reference | 一行 PASS 會隱藏缺口；保留精簡結果、證據路徑及限制，不另立公開入口 |
| [docx](../skills/docx/SKILL.md) | 保留專業能力 | OOXML、修訂與驗證不是多餘；程序範例按需載入，避免全面強制 workflow |
| [error-first-debug](../skills/error-first-debug/SKILL.md) | 優先改寫 | 不得讀碼前必取齊證據過度限制；保留根因證據、timeout 截尾區分與替代路徑查證 |
| [find-skills](../skills/find-skills/SKILL.md) | 保留、縮限 | 能力缺口才搜尋；不因一般如何做問題就搜尋安裝，不以人氣硬門檻選工具 |
| [frontend-design](../skills/frontend-design/SKILL.md) | 保留、縮限 | 設計能力獨立；取消固定美學偏好，遵循既有設計系統 |
| [gate-keeper](../skills/gate-keeper/SKILL.md) | 合併成 reference | DoR／DoD 有價值，固定 Step 0／8 和例行確認無必要；併入目標驗收 |
| [goal-preflight](../skills/goal-preflight/SKILL.md) | 合併核心契約 | 保留停止條件與目標證據，移除固定八元素與 maker/checker 全面強制 |
| [java-explain](../skills/java-explain/SKILL.md) | 保留、去專案耦合 | 讀者程度與實際代碼決定解說，不把單一業務領域當全域預設 |
| [java-testing](../skills/java-testing/SKILL.md) | 保留、改契約 | 測試技術獨立；移除 Step 3／7 和固定角色 |
| [jira-fix-comment](../skills/jira-fix-comment/SKILL.md) | 保留、縮限 | 外部留言須明確授權；格式可按專案，不要求每個修正都留言 |
| [jira-get-attachments](../skills/jira-get-attachments/SKILL.md) | 保留能力 | HTTP／媒體驗證有用；移除固定環境及所有附件必讀，只取任務相關附件 |
| [jspdf-autotable-worker](../skills/jspdf-autotable-worker/SKILL.md) | 保留專業能力 | 排版、字型、worker 具獨立技術價值；技術依賴順序不能誤刪為 SOP |
| [llm-wiki-maintainer](../skills/llm-wiki-maintainer/SKILL.md) | 保留、界定責任 | 負責穩定知識與來源；接續 checkpoint 不觸發全庫重整，蒸餾不另建 agent |
| [loop-preflight](../skills/loop-preflight/SKILL.md) | 保留適配知識、縮入口 | 時間觸發與 goal 不同；宿主語法按需參考，不再配重複 command |
| [md-to-pdf](../skills/md-to-pdf/SKILL.md) | 保留轉換能力 | 與一般 PDF 操作不同；取消默認全域 npm 安裝，依既有 Node 環境 |
| [pdf](../skills/pdf/SKILL.md) | 保留專業能力 | 表單／OCR／圖像定位是功能；API 範例及 helper 不因行數多而刪除 |
| [playwright-patterns](../skills/playwright-patterns/SKILL.md) | 保留 reference 能力 | 保留穩定 selector、mock 範圍與實際斷言；不固定登入／埠／harness |
| [ppt](../skills/ppt/SKILL.md) | 保留專業能力 | 投影片與文書 PDF 不同；取消每次固定八步與全域安裝 |
| [preflight](../skills/preflight/SKILL.md) | 合併至 start-work 參考 | 與 plan-formatter 重複；只補會影響目標的未知，不每次查全庫 |
| [review-checklist](../skills/review-checklist/SKILL.md) | 保留、優先改寫 | 保留反向追溯與可定位缺陷；取消最低缺陷數、全域分數門檻 |
| [spec-conventions](../skills/spec-conventions/SKILL.md) | 保留、改契約 | 可驗證需求與一致性有用；UI／API 欄位依任務，不固定所有章節 |
| [start-plan](../skills/start-plan/SKILL.md) | 保留、優先改寫 | 共享目標與依賴有用；去固定派工、例行確認、每次 commit/push；修復不存在的 mjs 引用 |
| [tdd](../skills/tdd/SKILL.md) | 保留、縮限 | 明確採 TDD 時保留 test-first 時序；不強制所有工作採單一 AC 回合 |
| [ticket-workflow](../skills/ticket-workflow/SKILL.md) | 拆出專案交付參考 | 與 start-work 重複；票務需求不自動授權 commit、MR、留言及交 QA |
| [verify](../skills/verify/SKILL.md) | 保留、優先改寫 | 實際行為證據必要；取消固定 Angular／4200／全 API mock，截图不自動等於 PASS |
| [vue-conventions](../skills/vue-conventions/SKILL.md) | 保留、縮限 | 保留 DOM／CSS 查證，取消固定診斷順序與版本假設 |
| [vue-testing](../skills/vue-testing/SKILL.md) | 保留、改契約 | 框架測試專業有用；取消固定回合與角色 |
| [web-design-guidelines](../skills/web-design-guidelines/SKILL.md) | 保留、縮限 | 可用性審查獨立；外部文件是審查資料，不得覆寫任務規範 |
| [windows-shell-gotchas](../skills/windows-shell-gotchas/SKILL.md) | 退役公開入口 | Node 統一後保留路徑、BOM、鎖等通用教訓到參考檔，移除 PowerShell 路線 |
| [xlsx](../skills/xlsx/SKILL.md) | 保留專業能力 | 公式重算、格式、驗證有用；不將全部格式偏好套到非財務文件 |

## Agents（10）

| 工具 | 建議 | 責任與理由 |
|---|---|---|
| [backend-unit-test-writer](../agents/backend-unit-test-writer.md) | 可選、與前端 writer 合併候選 | 測試能力由技術 skill 提供；無執行權限不可回報實跑 PASS |
| [code-reader](../agents/code-reader.md) | 保留可選 | 唯讀探索有隔離價值；不強制每任務先派 |
| [code-reviewer](../agents/code-reviewer.md) | 保留可選、改驗收 | 獨立審查有價值；取消至少三缺陷、固定分數及無依據 PASS |
| [frontend-unit-test-writer](../agents/frontend-unit-test-writer.md) | 可選、與後端 writer 合併候選 | 取消按技術棧固定派工；保留隔離 context 的測試設計价值 |
| [honey](../agents/honey.md) | 保留可選、縮責任 | 取消強制所有記憶都派工；模型蒸餾與 Node 安全寫入分工，去自動 commit/push |
| [implementer](../agents/implementer.md) | 取消必備角色 | 與主模型實作重複；單一 AC、先綠燈才停及固定交棒改為目標與證據 |
| [plan-formatter](../agents/plan-formatter.md) | 合併／退役 | 與 preflight、start-plan 重複；不要求固定表格及每個 OQ 全案停止 |
| [spec-reviewer](../agents/spec-reviewer.md) | 保留可選、縮限 | 保留需求／程式查證，去預設百分制及全域固定章節 |
| [spec-writer](../agents/spec-writer.md) | 取消專屬壟斷 | 規格由有能力的工作者更新；保留專業可選角色，去所有 spec 只能本 agent 修改 |
| [test-writer](../agents/test-writer.md) | 保留可選、改契約 | 瀏覽器工具隔離有價值；移除固定 harness、限制必要讀檔及強制步驟 |

## Commands（10）

| 工具 | 建議 | 責任與理由 |
|---|---|---|
| [handover](../commands/handover.md) | 轉 skill／既有記憶入口 | 不固定呼叫 honey；checkpoint 單檔、finalize 知識與 status 成功才刪 |
| [print-sd](../commands/print-sd.md) | 合併 spec-conventions | 保留可施工規格目標，取消評分重試與 PDF 推銷回合 |
| [print-work-status](../commands/print-work-status.md) | 合併記憶查詢能力 | 保留時間範圍與來源，取消寫死專案家族 |
| [review-change](../commands/review-change.md) | 合併 review-checklist | 純審查不自動更新 spec |
| [save](../commands/save.md) | 合併記憶維護入口 | 保留主動保存／蒸餾，不再固定 honey 和全庫收尾 |
| [start-goal](../commands/start-goal.md) | 退役重複 wrapper | 目標契約保留在核心，宿主 goal 語法按需 |
| [start-loop](../commands/start-loop.md) | 退役重複 wrapper | 保留週期監控能力到相應 skill，不重複預檢 |
| [start-plan](../commands/start-plan.md) | 退役重複 wrapper | 以同名 skill 為正本，取消 model override |
| [start-work](../commands/start-work.md) | 轉核心 skill | 用目標、驗收、邊界取代 332 行固定 choreography |
| [todo](../commands/todo.md) | 合併記憶查詢能力 | 待辦與週報共用資料讀取；優先度依實際期限與阻塞 |

## Hooks 與設定

| 項目 | 判斷 |
|---|---|
| pitfall-guard.mjs | 保留選用提醒；按命中情境注入，不能宣稱硬性安全攔截 |
| session-start-context.mjs | 保留選用輕量導航；與規範重複注入的部分削減 |
| 兩支同名 .ps1 hooks | Node 相容驗收及 caller 遷移後刪除，不保留雙實作 |
| plan-board.ps1 | 需要共享任務才用；Node 移植保留 hash／claim／一致性，移除自動 Git 與固定角色 |
| CLAUDE.md／settings.json | 個人機器設定不當成可直接發布 plugin 預設；規範只留目標、驗收及邊界 |
| 新紀錄 hook | 多種事件共用 Node 核心；不新增事件專屬 agent／daemon／完整事件 DB |
| ask-arxiv（尚在 staging） | 有明確研究缺口，保留一個 skill；不新增研究 command 或 agent |
| setup-work（待實作） | 保留 setup/update/check，一個入口；延後私有 runtime／多層設定平台 |

## Companion 與程式全量清冊

下表包含 skills 下除 SKILL.md 外的所有檔案，以及 hooks 全部檔案。reference 需按責任改写；技術範例的操作依賴不直接刪除。Python 文件 helper 不等於 PowerShell 雙路線：先保留功能，若要全語言 Node 化另需相容性證據。

| 路徑 | 處理類型 |
|---|---|
| `hooks/pitfall-guard.mjs` | 保留執行能力；內部 helper 不另發布入口 |
| `hooks/pitfall-guard.ps1` | Node 相容遷移後移除 |
| `hooks/session-start-context.mjs` | 保留執行能力；內部 helper 不另發布入口 |
| `hooks/session-start-context.ps1` | Node 相容遷移後移除 |
| `skills/angular-conventions/component-patterns.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/angular-conventions/form-value-gotchas.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/angular-testing/ac-tagging.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/angular-testing/component-patterns.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/angular-testing/unit-patterns.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/bsd-report/docx-structure.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/bsd-report/examples.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/LICENSE.txt` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/__init__.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/accept_changes.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/comment.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/helpers/__init__.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/helpers/merge_runs.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/helpers/simplify_redlines.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/pack.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chart.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chartDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-diagram.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-lockedCanvas.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-main.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-picture.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-spreadsheetDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-wordprocessingDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/pml.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-additionalCharacteristics.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-bibliography.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-commonSimpleTypes.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlDataProperties.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlSchemaProperties.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesCustom.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesVariantTypes.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-math.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-relationshipReference.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/sml.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-main.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-officeDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-presentationDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-spreadsheetDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-wordprocessingDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/xml.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-coreProperties.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-digSig.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/mce/mc.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/microsoft/wml-2010.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/microsoft/wml-2012.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/microsoft/wml-2018.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/microsoft/wml-cex-2018.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/microsoft/wml-cid-2016.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/microsoft/wml-sdtdatahash-2020.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/schemas/microsoft/wml-symex-2015.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/office/soffice.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/unpack.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/validate.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/validators/__init__.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/validators/base.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/validators/docx.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/validators/pptx.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/office/validators/redlining.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/docx/scripts/templates/comments.xml` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/templates/commentsExtended.xml` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/templates/commentsExtensible.xml` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/templates/commentsIds.xml` | 保留技術資源／格式／授權；按需載入 |
| `skills/docx/scripts/templates/people.xml` | 保留技術資源／格式／授權；按需載入 |
| `skills/error-first-debug/root-cause-patterns.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/frontend-design/LICENSE.txt` | 保留技術資源／格式／授權；按需載入 |
| `skills/gate-keeper/dod-checklist.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/gate-keeper/dor-checklist.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/gate-keeper/human-checkpoints.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/gate-keeper/open-questions.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/goal-preflight/goal-contract.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/java-explain/explain-patterns.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/java-testing/ac-tagging.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/java-testing/mockmvc-patterns.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/java-testing/unit-patterns.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/jspdf-autotable-worker/verification-harness.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/pdf/LICENSE.txt` | 保留技術資源／格式／授權；按需載入 |
| `skills/pdf/forms.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/pdf/reference.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/pdf/scripts/check_bounding_boxes.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/pdf/scripts/check_fillable_fields.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/pdf/scripts/convert_pdf_to_images.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/pdf/scripts/create_validation_image.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/pdf/scripts/extract_form_field_info.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/pdf/scripts/extract_form_structure.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/pdf/scripts/fill_fillable_fields.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/pdf/scripts/fill_pdf_form_with_annotations.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/playwright-patterns/auth-mock.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/playwright-patterns/layout-assertions.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/playwright-patterns/report-template.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/playwright-patterns/selectors.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/playwright-patterns/worker-mock.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/preflight/workflow.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/review-checklist/functional.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/review-checklist/report-template.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/review-checklist/technical.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/spec-conventions/ears-syntax.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/spec-conventions/templates.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/start-plan/agents/openai.yaml` | 保留技術資源／格式／授權；按需載入 |
| `skills/start-plan/references/plan-board-template.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/start-plan/scripts/plan-board.ps1` | Node 相容遷移後移除 |
| `skills/tdd/deep-modules.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/tdd/interface-design.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/tdd/mocking.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/tdd/refactoring.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/tdd/tests.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/ticket-workflow/delivery-checklist.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/ticket-workflow/git-conventions.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/ticket-workflow/jira-ops.md` | 優先核對固定流程；改目標／驗收，保留技術契約 |
| `skills/vue-conventions/bootstrapvue-gotchas.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/vue-conventions/page-entry-lookup.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/vue-testing/ac-tagging.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/vue-testing/component-patterns.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/vue-testing/unit-patterns.md` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/LICENSE.txt` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/helpers/__init__.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/office/helpers/merge_runs.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/office/helpers/simplify_redlines.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/office/pack.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chart.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chartDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-diagram.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-lockedCanvas.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-main.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-picture.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-spreadsheetDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-wordprocessingDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/pml.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-additionalCharacteristics.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-bibliography.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-commonSimpleTypes.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlDataProperties.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlSchemaProperties.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesCustom.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesVariantTypes.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-math.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-relationshipReference.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/sml.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-main.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-officeDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-presentationDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-spreadsheetDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-wordprocessingDrawing.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/xml.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-coreProperties.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-digSig.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/mce/mc.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/microsoft/wml-2010.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/microsoft/wml-2012.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/microsoft/wml-2018.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/microsoft/wml-cex-2018.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/microsoft/wml-cid-2016.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/microsoft/wml-sdtdatahash-2020.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/schemas/microsoft/wml-symex-2015.xsd` | 保留技術資源／格式／授權；按需載入 |
| `skills/xlsx/scripts/office/soffice.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/office/unpack.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/office/validate.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/office/validators/__init__.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/office/validators/base.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/office/validators/docx.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/office/validators/pptx.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/office/validators/redlining.py` | 保留執行能力；內部 helper 不另發布入口 |
| `skills/xlsx/scripts/recalc.py` | 保留執行能力；內部 helper 不另發布入口 |

### 相同內容的資源

下列為 SHA-256 完全相同的檔案組；共享 office helper 可考慮一份內部實作，但獨立 skill 分發可能需要自足副本。沒有打包／import 回歸前，不為減少檔案數直接搬移。

- `skills/docx/LICENSE.txt`、`skills/pdf/LICENSE.txt`、`skills/xlsx/LICENSE.txt`
- `skills/docx/scripts/office/helpers/__init__.py`、`skills/xlsx/scripts/office/helpers/__init__.py`
- `skills/docx/scripts/office/helpers/merge_runs.py`、`skills/xlsx/scripts/office/helpers/merge_runs.py`
- `skills/docx/scripts/office/helpers/simplify_redlines.py`、`skills/xlsx/scripts/office/helpers/simplify_redlines.py`
- `skills/docx/scripts/office/pack.py`、`skills/xlsx/scripts/office/pack.py`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chart.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chart.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chartDrawing.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chartDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-diagram.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-diagram.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-lockedCanvas.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-lockedCanvas.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-main.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-main.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-picture.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-picture.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-spreadsheetDrawing.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-spreadsheetDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-wordprocessingDrawing.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-wordprocessingDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/pml.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/pml.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-additionalCharacteristics.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-additionalCharacteristics.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-bibliography.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-bibliography.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-commonSimpleTypes.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-commonSimpleTypes.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlDataProperties.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlDataProperties.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlSchemaProperties.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlSchemaProperties.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesCustom.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesCustom.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesVariantTypes.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesVariantTypes.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-math.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-math.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-relationshipReference.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-relationshipReference.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/sml.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/sml.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-main.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-main.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-officeDrawing.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-officeDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-presentationDrawing.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-presentationDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-spreadsheetDrawing.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-spreadsheetDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-wordprocessingDrawing.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-wordprocessingDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/xml.xsd`、`skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/xml.xsd`
- `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd`、`skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd`
- `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-coreProperties.xsd`、`skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-coreProperties.xsd`
- `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-digSig.xsd`、`skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-digSig.xsd`
- `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd`、`skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd`
- `skills/docx/scripts/office/schemas/mce/mc.xsd`、`skills/xlsx/scripts/office/schemas/mce/mc.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-2010.xsd`、`skills/xlsx/scripts/office/schemas/microsoft/wml-2010.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-2012.xsd`、`skills/xlsx/scripts/office/schemas/microsoft/wml-2012.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-2018.xsd`、`skills/xlsx/scripts/office/schemas/microsoft/wml-2018.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-cex-2018.xsd`、`skills/xlsx/scripts/office/schemas/microsoft/wml-cex-2018.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-cid-2016.xsd`、`skills/xlsx/scripts/office/schemas/microsoft/wml-cid-2016.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-sdtdatahash-2020.xsd`、`skills/xlsx/scripts/office/schemas/microsoft/wml-sdtdatahash-2020.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-symex-2015.xsd`、`skills/xlsx/scripts/office/schemas/microsoft/wml-symex-2015.xsd`
- `skills/docx/scripts/office/soffice.py`、`skills/xlsx/scripts/office/soffice.py`
- `skills/docx/scripts/office/unpack.py`、`skills/xlsx/scripts/office/unpack.py`
- `skills/docx/scripts/office/validate.py`、`skills/xlsx/scripts/office/validate.py`
- `skills/docx/scripts/office/validators/__init__.py`、`skills/xlsx/scripts/office/validators/__init__.py`
- `skills/docx/scripts/office/validators/base.py`、`skills/xlsx/scripts/office/validators/base.py`
- `skills/docx/scripts/office/validators/docx.py`、`skills/xlsx/scripts/office/validators/docx.py`
- `skills/docx/scripts/office/validators/pptx.py`、`skills/xlsx/scripts/office/validators/pptx.py`
- `skills/docx/scripts/office/validators/redlining.py`、`skills/xlsx/scripts/office/validators/redlining.py`

## 優先修正證據

- start-plan/SKILL.md 引用 scripts/plan-board.mjs，但 repo 僅有 .ps1；這是缺失依賴，不能用文件更名冒充移植。
- implementer 無 Bash 執行能力，卻用「綠燈 PASS」作固定輸出；應分清已改碼與實際測試證據。
- plan-formatter 固定 Step 0；preflight、gate-keeper、start-work 重複 intake 與確認。
- gate-keeper/human-checkpoints.md 要求全部 AC 完成後再確認是否進入 DoD；已有任務授權下此為多餘關卡。
- hone​​y／handover 的单檔模式不能直接承擔結案蒸餾；需正式分開 checkpoint 與 finalize 責任並同步 vault 契約。

驗收：移除入口前完成 caller 與責任映射；保留適用 SA 反向追溯、timeout 證據、真實 UI 驗證與知識来源。逐項設計審查不能取代宿主觸發、腳本回歸及接續測試。
