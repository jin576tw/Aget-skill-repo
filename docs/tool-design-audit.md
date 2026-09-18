# 全工具責任與去留

本版 32 skills、5 Agents，commands 為零。舊版 33／10／10。第三方 API／格式範例按需保留；技術依賴順序、來源與鎖不是多餘流程。這是能力與結構核對，不是每個第三方演算法的安全審计。

本輪調整原則：永久規範精簡，任務契約精確。AC 追溯與案例拆分保留；不把它們綁成固定單一 AC 派工回合。薄 Agent 可引用共用方法，並非僅因內容少就退役。委派資訊見 [Execution Brief](../skills/start-work/references/execution-brief.md)。

2026-09-18 重新依三個問題核對全部 32 skills 與 5 Agents：是否重複宿主本來就會做的事、是否清楚限制觸發／寫入／外部動作邊界、是否把完成連到可觀察證據。結論是既有合併與移除仍成立，沒有再新增一個只負責 preflight、goal 或 gate 的薄工具；驗證責任維持在 `verify`、`start-work` 與各格式／測試 skill。新增的 `consult-claude`／`consult-codex` 有明確的非例行觸發、預設唯讀、最多兩輪 debate、失敗不冒充 fallback，以及由宿主重新驗證的重要主張，因此保留為跨宿主能力，不再拆分 model-router、prompt-builder 或 result-verifier。全域設定只由 `setup-work` 管理，專案 skill 不自行改全域設定。

此調整依據：2026-09-13 使用者於本任務補充的文章討論與模型分層需求。保留的設計知識是「永久規範精簡、任務資訊精確」；文章不構成取消 AC 追溯、案例拆分或 TDD 的依據。執行與驗證狀態見 [validation](validation.md)。

## 現存 skills

| 工具 | 保留責任 |
|---|---|
| [angular-conventions](../skills/angular-conventions/SKILL.md) | Angular Standalone Components 通用開發慣例。TRIGGER when 使用者進行 Angular 開發、建立新元件、討論元件架構。提供元件結構、生命週期、依賴注入等通用模式。 |
| [angular-testing](../skills/angular-testing/SKILL.md) | 撰寫及驗證 Angular（沿用專案 Jasmine／TestBed 或其他既有 runner） 的單元／元件或 API 測試，按需求建立行為證據。 |
| [ask-arxiv](../skills/ask-arxiv/SKILL.md) | 查詢近期 arXiv 原始論文，為設計或技術選擇尋找研究支持、反證與可實作方法，或核對論文及他人引用的研究說法。適用於 /ask-arxiv、$ask-arxiv、「找論文支持」「核對研究數字」「有沒有近期實驗證據」等需求；一般除錯、API 用法或純概念解說不自動啟動文獻研究。 |
| [bsd-report](../skills/bsd-report/SKILL.md) | 依指定格式與截圖產生 BSD 測報 Word 文件，適用需要該報告樣式的交付。 |
| [consult-claude](../skills/consult-claude/SKILL.md) | Codex 明確需要 Claude 的獨立意見時才呼叫；預設唯讀，外部結果須由 Codex 驗證，失敗不冒充 Claude 回覆。 |
| [consult-codex](../skills/consult-codex/SKILL.md) | Claude Code 明確需要 Codex 的獨立意見時才呼叫；按風險選最小可靠模型，預設唯讀，外部結果須由 Claude 驗證。 |
| [docx](../skills/docx/SKILL.md) | "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation." |
| [error-first-debug](../skills/error-first-debug/SKILL.md) | 診斷 bug、例外、錯誤資料或效能異常，以實際證據辨識根因與修正效果。純新功能開發或規格撰寫不需載入。 |
| [find-skills](../skills/find-skills/SKILL.md) | 當目前任務確實缺乏所需專業能力時，查找可用 skill 或 plugin 並核對其適用性。 |
| [frontend-design](../skills/frontend-design/SKILL.md) | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics. |
| [handover](../skills/handover/SKILL.md) | 保存或讀取跨 Agent 的任務接續，處理明確暫停、里程碑及完成後的知識蒸餾與結案；一般問答不建立 handover。 |
| [java-explain](../skills/java-explain/SKILL.md) | 依讀者程度解說指定 Java 程式碼、語言機制與實際行為。 |
| [java-testing](../skills/java-testing/SKILL.md) | 撰寫及驗證 Java（沿用 JUnit／Mockito／AssertJ／MockMvc 等專案設定） 的單元／元件或 API 測試，按需求建立行為證據。 |
| [jira-fix-comment](../skills/jira-fix-comment/SKILL.md) | 依已驗證的修正整理 Jira 留言草稿；使用者已明確授權張貼時發布並核對結果。 |
| [jira-get-attachments](../skills/jira-get-attachments/SKILL.md) | 讀取任務相關的 Jira 附件、截圖與文件，核對實際功能入口及問題證據。 |
| [jspdf-autotable-worker](../skills/jspdf-autotable-worker/SKILL.md) | jsPDF + jspdf-autotable 報表 PDF 產生慣例（多在 Angular Web Worker 內執行）。TRIGGER when 使用者要調整 *-pdf-worker.ts、autoTable 欄寬/換行/對齊、PDF 報表版面跑版、表頭多行文字、或回報「PDF 欄位置中/靠左」「欄寬不自然」「換行怪異」「PDF 截圖看不到線」等症狀。 |
| [llm-wiki-maintainer](../skills/llm-wiki-maintainer/SKILL.md) | 維護知識庫的穩定知識、來源及導航；用於蒸餾、整理或查詢知識，不在每次 checkpoint 重整全庫。 |
| [md-to-pdf](../skills/md-to-pdf/SKILL.md) | 將一般 Markdown 文件轉成含中文、圖片及必要 Mermaid 圖表的 PDF。 |
| [pdf](../skills/pdf/SKILL.md) | Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs to make them searchable. If the user mentions a .pdf file or asks to produce one, use this skill. |
| [playwright-patterns](../skills/playwright-patterns/SKILL.md) | 撰寫或診斷 Playwright 瀏覽器／E2E 測試，涵蓋選擇器、mock 與版面斷言；純單元測試不需載入。 |
| [ppt](../skills/ppt/SKILL.md) | 從內容建立 MARP 投影片並匯出 PDF 或 PPTX；版面依讀者與使用者格式需求。 |
| [review-checklist](../skills/review-checklist/SKILL.md) | 審查程式碼變更、規格追溯與驗收證據。用於 code review 或交付驗收；純規格撰寫或一般測試不需載入。 |
| [setup-work](../skills/setup-work/SKILL.md) | 首次準備、更新或修復 Aget 工具、CLAUDE.md／AGENTS.md 與選用 hooks；不是日常開發啟動步驟。 |
| [spec-conventions](../skills/spec-conventions/SKILL.md) | 撰寫或維護可驗證、可追溯的需求／規格，與已核准來源及實作保持一致。 |
| [start-plan](../skills/start-plan/SKILL.md) | 為跨 session、共享依賴或多項交付建立可接續計畫，或接續已有 plan-board；集中的小任務不需建立。 |
| [start-work](../skills/start-work/SKILL.md) | 完成開發需求、修正與接續既有實作；依需求判斷規劃、技術能力及驗收，不用於純問答或純文件研究。 |
| [tdd](../skills/tdd/SKILL.md) | 在使用者要求 test-first／TDD，或適用專案採用 TDD 時，以行為測試驅動開發。 |
| [verify](../skills/verify/SKILL.md) | 執行並觀察變更後的實際行為，核對修正、功能或交付是否符合需求。 |
| [vue-conventions](../skills/vue-conventions/SKILL.md) | Vue 2 / Nuxt 2 / BootstrapVue 開發慣例與視覺 bug 除錯模式（既有 Vue 專案）。TRIGGER when 使用者在 Vue 2 / Nuxt / BootstrapVue 專案開發頁面、修視覺 bug（欄位凍結、遮蓋、破版、定位）、或需要定位 Vue 頁面入口。DO NOT TRIGGER when 純測試撰寫（用 vue-testing）。 |
| [vue-testing](../skills/vue-testing/SKILL.md) | 撰寫及驗證 Vue（依實際 Vue 版本選相容的測試工具） 的單元／元件或 API 測試，按需求建立行為證據。 |
| [web-design-guidelines](../skills/web-design-guidelines/SKILL.md) | Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices". |
| [xlsx](../skills/xlsx/SKILL.md) | "Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path — even casually (like \"the xlsx in my downloads\") — and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved." |

## 合併的 skill 入口

| 舊工具 | 責任落點 |
|---|---|
| compact-signal | start-work：精簡結果＋可核對證據 |
| gate-keeper | start-work：目標與驗收，移除例行確認 |
| goal-preflight | start-work：持續目標與停止條件 |
| loop-preflight | start-work references/delivery：宿主排程邊界 |
| preflight | start-work references/task-routing：只補關鍵未知 |
| ticket-workflow | start-work references/delivery：交付範圍；Jira 專業 skills |
| windows-shell-gotchas | Node fs／路徑／鎖測試與 runtime：移除 PowerShell 入口 |

## Agents

- [code-reader](../agents/code-reader.md)：按任務及宿主授權選用，不固定模型或每次必派。
- [code-reviewer](../agents/code-reviewer.md)：按任務及宿主授權選用，不固定模型或每次必派。
- [honey](../agents/honey.md)：按任務及宿主授權選用，不固定模型或每次必派。
- [spec-reviewer](../agents/spec-reviewer.md)：按任務及宿主授權選用，不固定模型或每次必派。
- [test-writer](../agents/test-writer.md)：按任務及宿主授權選用，不固定模型或每次必派。

backend／frontend-unit-test-writer 合併 test-writer；技術知識分別留測試 skills。implementer 由主會話／宿主通用 Agent 實作；spec-writer 的方法留 spec-conventions；plan-formatter 的判斷留 start-work。獨立 reviewer 的唯讀工具邊界保留。

## 移除 commands 的責任

| 舊 command | 落點 |
|---|---|
| start-work、start-plan | 同名 skills |
| handover | handover checkpoint／finalize |
| save、todo、print-work-status | llm-wiki-maintainer 查詢／維護＋handover 結案 |
| print-sd | spec-conventions＋文件 skills |
| review-change | review-checklist |
| start-goal、start-loop | start-work 的宿主持續工作／排程契約 |

## Node 与附屬檔清冊

plan-board、2 個既有 hooks 的 PowerShell 已移除；BSD 打包由 Node pack-docx 提供。每個附屬檔列於下方，格式、API 範例及授權留在原 skill，沒有為減少檔案數破壞自足分發。

- `scripts/check-package.mjs`
- `scripts/enable-vault.mjs`
- `scripts/lib/board.mjs`
- `scripts/lib/files.mjs`
- `scripts/lib/memory.mjs`
- `scripts/lib/setup.mjs`
- `scripts/memory.mjs`
- `scripts/migrate-handover.mjs`
- `scripts/pack-docx.mjs`
- `scripts/setup-work.mjs`
- `scripts/stage-checkpoint.mjs`
- `hooks/pitfall-guard.mjs`
- `hooks/record.mjs`
- `hooks/session-start-context.mjs`
- `skills/start-work/references/execution-brief.md`
- `skills/angular-conventions/component-patterns.md`
- `skills/angular-conventions/form-value-gotchas.md`
- `skills/angular-testing/ac-tagging.md`
- `skills/angular-testing/component-patterns.md`
- `skills/angular-testing/unit-patterns.md`
- `skills/ask-arxiv/agents/openai.yaml`
- `skills/bsd-report/docx-structure.md`
- `skills/bsd-report/examples.md`
- `skills/docx/LICENSE.txt`
- `skills/docx/scripts/__init__.py`
- `skills/docx/scripts/accept_changes.py`
- `skills/docx/scripts/comment.py`
- `skills/docx/scripts/office/helpers/__init__.py`
- `skills/docx/scripts/office/helpers/merge_runs.py`
- `skills/docx/scripts/office/helpers/simplify_redlines.py`
- `skills/docx/scripts/office/pack.py`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chart.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chartDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-diagram.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-lockedCanvas.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-main.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-picture.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-spreadsheetDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-wordprocessingDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/pml.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-additionalCharacteristics.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-bibliography.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-commonSimpleTypes.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlDataProperties.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlSchemaProperties.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesCustom.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesVariantTypes.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-math.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-relationshipReference.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/sml.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-main.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-officeDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-presentationDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-spreadsheetDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-wordprocessingDrawing.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd`
- `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/xml.xsd`
- `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd`
- `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-coreProperties.xsd`
- `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-digSig.xsd`
- `skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd`
- `skills/docx/scripts/office/schemas/mce/mc.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-2010.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-2012.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-2018.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-cex-2018.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-cid-2016.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-sdtdatahash-2020.xsd`
- `skills/docx/scripts/office/schemas/microsoft/wml-symex-2015.xsd`
- `skills/docx/scripts/office/soffice.py`
- `skills/docx/scripts/office/unpack.py`
- `skills/docx/scripts/office/validate.py`
- `skills/docx/scripts/office/validators/__init__.py`
- `skills/docx/scripts/office/validators/base.py`
- `skills/docx/scripts/office/validators/docx.py`
- `skills/docx/scripts/office/validators/pptx.py`
- `skills/docx/scripts/office/validators/redlining.py`
- `skills/docx/scripts/templates/comments.xml`
- `skills/docx/scripts/templates/commentsExtended.xml`
- `skills/docx/scripts/templates/commentsExtensible.xml`
- `skills/docx/scripts/templates/commentsIds.xml`
- `skills/docx/scripts/templates/people.xml`
- `skills/error-first-debug/root-cause-patterns.md`
- `skills/frontend-design/LICENSE.txt`
- `skills/java-explain/explain-patterns.md`
- `skills/java-testing/ac-tagging.md`
- `skills/java-testing/mockmvc-patterns.md`
- `skills/java-testing/unit-patterns.md`
- `skills/jspdf-autotable-worker/verification-harness.md`
- `skills/pdf/LICENSE.txt`
- `skills/pdf/forms.md`
- `skills/pdf/reference.md`
- `skills/pdf/scripts/check_bounding_boxes.py`
- `skills/pdf/scripts/check_fillable_fields.py`
- `skills/pdf/scripts/convert_pdf_to_images.py`
- `skills/pdf/scripts/create_validation_image.py`
- `skills/pdf/scripts/extract_form_field_info.py`
- `skills/pdf/scripts/extract_form_structure.py`
- `skills/pdf/scripts/fill_fillable_fields.py`
- `skills/pdf/scripts/fill_pdf_form_with_annotations.py`
- `skills/playwright-patterns/auth-mock.md`
- `skills/playwright-patterns/layout-assertions.md`
- `skills/playwright-patterns/report-template.md`
- `skills/playwright-patterns/selectors.md`
- `skills/playwright-patterns/worker-mock.md`
- `skills/review-checklist/functional.md`
- `skills/review-checklist/report-template.md`
- `skills/review-checklist/technical.md`
- `skills/spec-conventions/ears-syntax.md`
- `skills/spec-conventions/templates.md`
- `skills/start-plan/agents/openai.yaml`
- `skills/start-plan/references/plan-board-template.md`
- `skills/start-plan/scripts/plan-board.mjs`
- `skills/start-work/references/delivery.md`
- `skills/start-work/references/task-routing.md`
- `skills/tdd/deep-modules.md`
- `skills/tdd/interface-design.md`
- `skills/tdd/mocking.md`
- `skills/tdd/refactoring.md`
- `skills/tdd/tests.md`
- `skills/vue-conventions/bootstrapvue-gotchas.md`
- `skills/vue-conventions/page-entry-lookup.md`
- `skills/vue-testing/ac-tagging.md`
- `skills/vue-testing/component-patterns.md`
- `skills/vue-testing/unit-patterns.md`
- `skills/xlsx/LICENSE.txt`
- `skills/xlsx/scripts/office/helpers/__init__.py`
- `skills/xlsx/scripts/office/helpers/merge_runs.py`
- `skills/xlsx/scripts/office/helpers/simplify_redlines.py`
- `skills/xlsx/scripts/office/pack.py`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chart.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chartDrawing.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-diagram.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-lockedCanvas.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-main.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-picture.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-spreadsheetDrawing.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-wordprocessingDrawing.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/pml.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-additionalCharacteristics.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-bibliography.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-commonSimpleTypes.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlDataProperties.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlSchemaProperties.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesCustom.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesVariantTypes.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-math.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-relationshipReference.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/sml.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-main.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-officeDrawing.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-presentationDrawing.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-spreadsheetDrawing.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-wordprocessingDrawing.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd`
- `skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/xml.xsd`
- `skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd`
- `skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-coreProperties.xsd`
- `skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-digSig.xsd`
- `skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd`
- `skills/xlsx/scripts/office/schemas/mce/mc.xsd`
- `skills/xlsx/scripts/office/schemas/microsoft/wml-2010.xsd`
- `skills/xlsx/scripts/office/schemas/microsoft/wml-2012.xsd`
- `skills/xlsx/scripts/office/schemas/microsoft/wml-2018.xsd`
- `skills/xlsx/scripts/office/schemas/microsoft/wml-cex-2018.xsd`
- `skills/xlsx/scripts/office/schemas/microsoft/wml-cid-2016.xsd`
- `skills/xlsx/scripts/office/schemas/microsoft/wml-sdtdatahash-2020.xsd`
- `skills/xlsx/scripts/office/schemas/microsoft/wml-symex-2015.xsd`
- `skills/xlsx/scripts/office/soffice.py`
- `skills/xlsx/scripts/office/unpack.py`
- `skills/xlsx/scripts/office/validate.py`
- `skills/xlsx/scripts/office/validators/__init__.py`
- `skills/xlsx/scripts/office/validators/base.py`
- `skills/xlsx/scripts/office/validators/docx.py`
- `skills/xlsx/scripts/office/validators/pptx.py`
- `skills/xlsx/scripts/office/validators/redlining.py`
- `skills/xlsx/scripts/recalc.py`
- `rules/development.md`
- `rules/memory-contract.md`

驗證與限制見 [validation](validation.md)，執行契約見 [runtime](runtime.md)。

- `scripts/test.mjs`：跨 Node 版本及平台的測試檔列舉，非公開工具入口。
