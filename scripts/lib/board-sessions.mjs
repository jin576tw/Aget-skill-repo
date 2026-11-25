import { fail } from "./files.mjs";

export const tableHeader = "| Done | Task | Status | Claim | Revision | Updated | Name | Host | Session-ID | Model | Effort | Source | Registration-ID |";
const separator = "|---|---|---|---|---:|---|---|---|---|---|---|---|---|";
const legacyHeader = /^\| Done \| Task \| Status \| Claim \| Revision \| Updated \|$/m;
const states = new Set(["standby", "dispatched", "released", "unavailable", "historical"]);
const sources = new Set(["launch-args", "dispatch-history", "host-report", "unknown"]);
const live = (row) => ["standby", "dispatched"].includes(row.state) &&
  !["unknown", "unavailable"].includes(row.sessionId);
const cells = (line) => line.slice(1, -1).split("|").map((value) => value.trim());
const line = (values) => "| " + values.join(" | ") + " |";
const value = (input) => {
  if (typeof input !== "string" || !input.trim() || /[\r\n|<>]/.test(input))
    fail("PLAN_SESSION_INVALID_VALUE");
  return input.trim();
};

function checkSessions(sessions, rows) {
  const ids = new Set();
  const active = new Set();
  for (const session of sessions) {
    if (!rows.some((row) => row.task === session.task) || !states.has(session.state) ||
        !sources.has(session.source) || !session.id || ids.has(session.id))
      fail("PLAN_SESSION_INVALID");
    ids.add(session.id);
    const key = JSON.stringify([session.host, session.sessionId]);
    if (live(session) && active.has(key)) fail("PLAN_SESSION_CONFLICT");
    if (live(session)) active.add(key);
  }
}

export function sessionTable(text, plan, rows) {
  const header = text.includes(tableHeader) ? tableHeader : text.match(legacyHeader)?.[0];
  if (!header) return { sessions: [], summary: null };
  const start = text.indexOf(header);
  const lines = text.slice(start).split("\n");
  const end = lines.findIndex((row) => !row.startsWith("|"));
  const summary = lines.slice(0, end < 0 ? lines.length : end).join("\n");
  const sessions = [];
  let legacy = null;
  if (header === tableHeader) {
    let task;
    for (const row of summary.split("\n").slice(2)) {
      const c = cells(row);
      if (c.length !== 13) fail("PLAN_SESSION_INVALID_TABLE");
      if (/^\[[ xX]\]$/.test(c[0])) {
        task = c[1];
        const entry = rows.find((item) => item.task === task);
        if (!entry || !entry.extra) fail("PLAN_SESSION_INVALID_TABLE");
        entry.name = c[6] || task;
      } else {
        if (c[0] !== "↳" || task !== c[1]) fail("PLAN_SESSION_INVALID_TABLE");
        sessions.push({ task, state: c[2], updated: c[5], name: c[6], host: c[7],
          sessionId: c[8], model: c[9], effort: c[10], source: c[11], id: c[12] });
      }
    }
  } else {
    legacy = text.match(/^## Session Registry\n(?:(?!^## )[\s\S])*?^\| Plan-ID \| Task-ID \| Host \| Session-ID \| Model \| State \| Updated \|\n\|[^\n]*\|\n(?:^\|[^\n]*\|\n?)*/m)?.[0];
    if (legacy) {
      const entries = legacy.split("\n").filter((row) => row.startsWith("|")).slice(2);
      for (const row of entries) {
        const [planId, task, host, sessionId, model, state, updated] = cells(row);
        if (!planId && !task) continue;
        if (planId !== plan) fail("PLAN_SESSION_INVALID_LEGACY");
        sessions.push({ task, state, updated, name: task, host, sessionId, model,
          effort: "unknown", source: "unknown", id: "legacy-" + (sessions.length + 1) });
      }
    } else if (/^## Session Registry$/m.test(text)) {
      fail("PLAN_SESSION_INVALID_LEGACY");
    }
  }
  checkSessions(sessions, rows);
  return { sessions, summary, legacy };
}

export function registerSession(board, task, input, now, newId) {
  const entry = board.rows.find((row) => row.task === task);
  if (!entry || !board.summary) fail("PLAN_SESSION_TASK_REQUIRED");
  const data = input.session ?? {};
  const existing = data.id === undefined ? null : board.sessions.find((row) => row.id === data.id);
  if (data.id !== undefined && (!existing || existing.task !== task))
    fail("PLAN_SESSION_NOT_FOUND");
  if (board.status === "completed" && (existing || data.state !== "historical"))
    fail("PLAN_SESSION_BOARD_COMPLETED");
  const session = { id: existing?.id ?? newId(), task, updated: now };
  for (const key of ["name", "host", "sessionId", "model", "effort", "source", "state"])
    session[key] = value(data[key] ?? existing?.[key]);
  if (existing && (existing.host !== session.host || existing.sessionId !== session.sessionId))
    fail("PLAN_SESSION_IDENTITY_CHANGED");
  if (existing && !live(existing) && ["released", "historical"].includes(existing.state) &&
      ["standby", "dispatched"].includes(session.state)) fail("PLAN_SESSION_REUSE_REQUIRES_NEW_ROW");
  if (input.taskName !== undefined) entry.name = value(input.taskName);
  const sessions = existing
    ? board.sessions.map((row) => row.id === existing.id ? session : row)
    : [...board.sessions, session];
  checkSessions(sessions, board.rows);
  return { text: renderSessionTable(board, sessions), session };
}

export function renderSessionTable(board, sessions = board.sessions) {
  if (!board.summary) return board.text;
  const output = [tableHeader, separator];
  for (const row of board.rows) {
    output.push(line([...cells(row.raw).slice(0, 6), row.name || row.task, "", "",
      (row.model || "unknown").split("（")[0].replaceAll("|", "&#124;"), row.effort || "unknown", "task-contract", ""]));
    for (const item of sessions.filter((record) => record.task === row.task))
      output.push(line(["↳", item.task, item.state, "", "", item.updated, item.name, item.host,
        item.sessionId, item.model, item.effort, item.source, item.id]));
  }
  let text = board.text.replace(board.summary, () => output.join("\n"));
  if (board.legacy) text = text.replace(board.legacy, "");
  return text;
}
