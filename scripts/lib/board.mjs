import {
  read,
  sha,
  atomic,
  locked,
  workspaceInfo,
  safe,
  fail,
} from "./files.mjs";
import path from "node:path";
export const contractHash = (s) => sha(s.replace(/\r\n?/g, "\n").trim());
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function field(s, k, optional = false) {
  const m = [...s.matchAll(new RegExp("^- " + esc(k) + ": *([^\\n]+)$", "gm"))];
  if (m.length !== 1) {
    if (optional && m.length === 0) return null;
    fail("PLAN_BOARD_INVALID: " + k);
  }
  return m[0][1].trim().replace(/^`|`$/g, "");
}
function block(s, type, id) {
  const re = new RegExp(
    "<!-- START-PLAN:" +
      type +
      ":" +
      esc(id) +
      ":BEGIN -->([\\s\\S]*?)<!-- START-PLAN:" +
      type +
      ":" +
      esc(id) +
      ":END -->",
    "g",
  );
  const m = [...s.matchAll(re)];
  if (m.length !== 1) fail("TASK_CONTRACT_BLOCKED: " + id + " " + type);
  return { raw: m[0][0], body: m[0][1] };
}
const states = [
  "ready",
  "waiting",
  "in_progress",
  "blocked",
  "completed",
  "superseded",
];
export function parseBoard(input, workspace) {
  const text = input.replace(/\r\n?/g, "\n");
  if (field(text, "Handover-Type") !== "plan-board") fail("PLAN_BOARD_INVALID");
  const plan = field(text, "Plan-ID");
  if (!/^[A-Z0-9][A-Z0-9-]*$/.test(plan)) fail("INVALID_PLAN_ID");
  if (
    workspaceInfo(field(text, "Workspace")).normalized !==
    workspaceInfo(workspace).normalized
  )
    fail("TASK_WORKSPACE_MISMATCH");
  const revision = Number(field(text, "Plan-Revision"));
  if (!Number.isSafeInteger(revision) || revision < 0) fail("INVALID_REVISION");
  const rows = [
    ...text.matchAll(
      /^\|\s*(\[[ xX]\])\s*\|\s*([A-Z0-9-]+)\s*\|\s*([a-z_]+)\s*\|\s*([^|]*)\|\s*(\d+)\s*\|\s*([^|]*)\|\s*$/gm,
    ),
  ].map((m) => ({
    raw: m[0],
    task: m[2],
    status: m[3],
    claim: m[4].trim(),
    revision: Number(m[5]),
    done: m[1].toLowerCase() === "[x]",
  }));
  if (!rows.length || new Set(rows.map((r) => r.task)).size !== rows.length)
    fail("PLAN_BOARD_INVALID: rows");
  const markers = [
    ...text.matchAll(/<!-- START-PLAN:TASK:([^:]+):BEGIN -->/g),
  ].map((m) => m[1]);
  if (
    markers.length !== rows.length ||
    markers.some((x) => !rows.some((r) => r.task === x))
  )
    fail("PLAN_BOARD_INVALID: orphan task");
  for (const r of rows) {
    r.block = block(text, "TASK", r.task);
    r.contract = block(r.block.body, "CONTRACT", r.task);
    block(r.block.body, "PROGRESS", r.task);
    if (
      field(r.block.body, "Contract-SHA256").toLowerCase() !==
      contractHash(r.contract.body)
    )
      fail("TASK_CONTRACT_BLOCKED: hash");
    if (
      !states.includes(r.status) ||
      field(r.block.body, "Status") !== r.status ||
      field(r.block.body, "Claim-ID") !== r.claim ||
      Number(field(r.block.body, "Task-Revision")) !== r.revision ||
      r.done !== (r.status === "completed")
    )
      fail("PLAN_BOARD_INVALID: row/block");
    if (r.status === "in_progress" && r.claim === "-") fail("CLAIM_REQUIRED");
    field(r.contract.body, "Objective");
    field(r.contract.body, "Acceptance");
    r.depends = field(r.contract.body, "Depends-On")
      .toUpperCase()
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && s !== "NONE");
    r.priority = field(r.contract.body, "Priority", true) || "P1";
    if (!["P0", "P1", "P2"].includes(r.priority)) fail("INVALID_PRIORITY");
  }
  const visit = (r, trail = new Set()) => {
    if (trail.has(r.task)) fail("DEPENDENCY_CYCLE");
    const next = new Set([...trail, r.task]);
    for (const dep of r.depends) {
      const other = rows.find((x) => x.task === dep);
      if (!other) fail("TASK_DEPENDENCY_MISSING");
      visit(other, next);
    }
  };
  for (const r of rows) visit(r);
  const status = field(text, "Plan-Status");
  if (
    !["active", "completed"].includes(status) ||
    (status === "completed") !== rows.every((r) => r.status === "completed")
  )
    fail("PLAN_STATUS_MISMATCH");
  return { text, plan, revision, status, rows };
}
export function board(p) {
  const workspace = p.workspace || process.cwd();
  const w = workspaceInfo(workspace);
  let plan = p.plan?.toUpperCase(),
    task = p.task?.toUpperCase();
  if (p.taskId) {
    const m = /^([a-z0-9-]+):([a-z0-9-]+)$/i.exec(p.taskId);
    if (!m) fail("INVALID_TASK_ID");
    if (
      (plan && plan !== m[1].toUpperCase()) ||
      (task && task !== m[2].toUpperCase())
    )
      fail("TASK_ID_MISMATCH");
    plan = m[1].toUpperCase();
    task = m[2].toUpperCase();
  }
  if (!p.root) fail("HANDOVER_ROOT_REQUIRED");
  let name = p.file;
  if (name) {
    name = path.relative(p.root, path.resolve(name)).split(path.sep).join("/");
  } else {
    if (!plan) fail("PLAN_ID_REQUIRED");
    name = `${w.prefix}--${plan.toLowerCase()}.md`;
    if (read(safe(p.root, name)) === null) {
      const legacy = `${workspaceInfo(workspace, true).prefix}--${plan.toLowerCase()}.md`;
      if (read(safe(p.root, legacy)) !== null) name = legacy;
    }
  }
  const file = safe(p.root, name),
    action = (p.action || "status").toLowerCase();
  return locked(p.root, () => {
    const original = read(file);
    if (original === null) fail("PLAN_NOT_FOUND");
    if (action === "hash") {
      if (!task) fail("TASK_NAME_REQUIRED");
      const b = block(original.replace(/\r\n?/g, "\n"), "TASK", task),
        c = block(b.body, "CONTRACT", task);
      return {
        signal: "CONTRACT_HASH",
        computed: contractHash(c.body),
        stored: field(b.body, "Contract-SHA256"),
      };
    }
    const b = parseBoard(original, workspace);
    if (plan && b.plan !== plan) fail("PLAN_ID_MISMATCH");
    const eligible = b.rows
      .filter(
        (r) =>
          ["ready", "waiting"].includes(r.status) &&
          r.depends.every(
            (d) => b.rows.find((x) => x.task === d).status === "completed",
          ),
      )
      .sort((a, b) => a.priority.localeCompare(b.priority));
    if (["status", "validate", "resolve"].includes(action))
      return {
        signal:
          action === "validate"
            ? "PLAN_BOARD_VALID"
            : action === "resolve"
              ? "PLAN_RESOLVED"
              : "PLAN_STATUS",
        path: file,
        hash: sha(original),
        plan_id: b.plan,
        revision: b.revision,
        plan_status: b.status,
        tasks: b.rows.map(({ raw, block, contract, done, ...r }) => r),
        next_tasks: eligible
          .filter((r) => r.priority === eligible[0]?.priority)
          .map((r) => `${b.plan}:${r.task}`),
      };
    if (action !== "update") fail("UNSUPPORTED_ACTION");
    if (sha(original) !== p.expectedHash) fail("PLAN_CONCURRENT_UPDATE");
    const r = b.rows.find((r) => r.task === task);
    if (!r) fail("TASK_NOT_FOUND");
    if (r.status === "completed") fail("TASK_ALREADY_COMPLETED");
    if (!states.includes(p.status)) fail("INVALID_STATUS");
    if (r.claim !== "-" && r.claim !== p.claim) fail("TASK_ALREADY_CLAIMED");
    if (
      ["in_progress", "completed"].includes(p.status) &&
      r.depends.some(
        (d) => b.rows.find((x) => x.task === d).status !== "completed",
      )
    )
      fail("TASK_DEPENDENCY_BLOCKED");
    if (
      p.status === "completed" &&
      (r.status !== "in_progress" ||
        typeof p.evidence !== "string" ||
        !p.evidence.trim())
    )
      fail("COMPLETION_EVIDENCE_REQUIRED");
    const claim = ["ready", "waiting"].includes(p.status)
      ? "-"
      : p.claim || r.claim;
    if (
      p.status === "in_progress" &&
      (!claim || claim === "-" || /[\n|]/.test(claim))
    )
      fail("CLAIM_REQUIRED");
    const clean = (s) => String(s || "none").replace(/[\r\n|]/g, " ");
    const now = new Date().toISOString();
    let changed = r.block.raw
      .replace(/^- Status:.*$/m, `- Status: ${p.status}`)
      .replace(/^- Claim-ID:.*$/m, `- Claim-ID: ${claim}`)
      .replace(/^- Task-Revision:.*$/m, `- Task-Revision: ${r.revision + 1}`);
    const progress = block(changed, "PROGRESS", task);
    changed = changed.replace(
      progress.raw,
      `<!-- START-PLAN:PROGRESS:${task}:BEGIN -->\n- Updated: ${now}\n- Summary: ${clean(p.summary)}\n- Evidence: ${clean(p.evidence)}\n<!-- START-PLAN:PROGRESS:${task}:END -->`,
    );
    let next = b.text
      .replace(r.block.raw, changed)
      .replace(
        r.raw,
        `| ${p.status === "completed" ? "[x]" : "[ ]"} | ${task} | ${p.status} | ${claim} | ${r.revision + 1} | ${now} |`,
      );
    next = next
      .replace(/^- Plan-Revision:.*$/m, `- Plan-Revision: ${b.revision + 1}`)
      .replace(
        /^- Plan-Status:.*$/m,
        `- Plan-Status: ${b.rows.every((x) => (x.task === task ? p.status === "completed" : x.status === "completed")) ? "completed" : "active"}`,
      )
      .replace(/^- Updated:.*$/m, `- Updated: ${now}`);
    parseBoard(next, workspace);
    atomic(file, next, sha(original));
    return {
      signal: "TASK_STATUS_UPDATED",
      hash: sha(next),
      task_id: `${b.plan}:${task}`,
      status: p.status,
      claim_id: claim,
    };
  });
}
