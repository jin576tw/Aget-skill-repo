---
description: Save session to memory — update P:\MEMORY journal for the current project
---

Call the @memory agent to update the work journal for this session.

Steps:
1. Read `P:\MEMORY\memory.md` and identify the current project family from the workspace path.
2. Route memory updates using the family-level structure:
   - read `P:\MEMORY\projects/{family}/{family}.md`
   - update `P:\MEMORY\journal\log.md` — add new entries for this session (newest first)
   - update `P:\MEMORY\projects/{family}/status.md` — refresh Current Focus, Next Actions, Blocked
   - read `P:\MEMORY\projects/{family}/{leaf}.md` only when a leaf project context is needed
3. Update `P:\MEMORY\journal\todo-list.md` — sync the primary project block for this session:
   - Update each ticket row with the latest status (one concise phrase)
   - Update the Release 進度 table if any release status changed
   - Update the `Last Updated` line at the top with today's date and a brief summary
4. Distill any reusable knowledge to `P:\MEMORY\knowledge\lessons-learned.md` or `conventions.md` if applicable.
5. Do not use legacy per-project journal files such as `P:\MEMORY\journal\pa-ui.md` or `P:\MEMORY\journal\pos-ui.md`.
6. If workspace instructions still point to legacy `projects/{leaf}/index.md` or `projects/{leaf}/status.md`, update them as part of the same maintenance task.
7. Reply with `Memory has updated!` when done.
