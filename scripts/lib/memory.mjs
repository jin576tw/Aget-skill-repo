import fs from "node:fs";
import path from "node:path";
import {
  safe,
  read,
  sha,
  digest,
  atomic,
  locked,
  workspaceInfo,
  slug,
  fail,
} from "./files.mjs";
const marker = "<!-- aget-memory:v1 -->";
export function parseCheckpoint(text) {
  if (!text?.startsWith(marker + "\n```json\n")) fail("UNMANAGED_HANDOVER");
  const end = text.indexOf("\n```", marker.length + 9);
  if (end < 0) fail("INVALID_HANDOVER");
  return JSON.parse(text.slice((marker + "\n```json\n").length, end));
}
export function validateCheckpoint(s) {
  if (
    !s ||
    !["active", "paused", "completed"].includes(s.status) ||
    typeof s.session !== "string" ||
    !s.session.trim()
  )
    fail("INVALID_CHECKPOINT");
  if (!Array.isArray(s.goals) || !s.goals.length) fail("GOALS_REQUIRED");
  const ids = new Set();
  for (const g of s.goals) {
    if (
      !g ||
      typeof g.id !== "string" ||
      !g.id.trim() ||
      ids.has(g.id) ||
      typeof g.title !== "string" ||
      !g.title.trim() ||
      !["pending", "pass", "blocked"].includes(g.state)
    )
      fail("INVALID_GOAL");
    ids.add(g.id);
    if (
      g.state === "pass" &&
      (typeof g.evidence !== "string" || !g.evidence.trim())
    )
      fail("EVIDENCE_REQUIRED");
  }
  if (s.inflight !== null && !Array.isArray(s.inflight))
    fail("INVALID_INFLIGHT");
  if (typeof s.summary !== "string" || !s.summary.trim())
    fail("SUMMARY_REQUIRED");
  if (s.summary.includes(marker)) fail("INVALID_SUMMARY");
  if (
    s.status === "completed" &&
    (s.goals.some((g) => g.state !== "pass") ||
      !Array.isArray(s.inflight) ||
      s.inflight.length)
  )
    fail("GOALS_NOT_COMPLETE");
}
function identity(p) {
  const w = workspaceInfo(p.workspace);
  return { w, rel: `handovers/${w.prefix}--${slug(p.task)}.md` };
}
function content(s) {
  const { summary, ...meta } = s;
  return (
    marker +
    "\n```json\n" +
    JSON.stringify(meta, null, 2) +
    "\n```\n\n## 接續摘要\n\n" +
    summary.trim() +
    "\n"
  );
}
const goalContract = (s) =>
  JSON.stringify(s.goals.map(({ id, title }) => ({ id, title })));
export function checkpoint(p, migration = false) {
  const { w, rel } = identity(p);
  const file = safe(p.vault, rel);
  validateCheckpoint(p);
  return locked(p.vault, () => {
    const old = read(file);
    const hash = old === null ? "MISSING" : sha(old);
    let previous;
    if (old !== null) {
      if (migration) {
        if (
          p.expectedHash !== hash ||
          typeof p.migrationReason !== "string" ||
          !p.migrationReason.trim() ||
          old.includes("Handover-Type: plan-board")
        )
          fail("MIGRATION_REJECTED");
      } else {
        previous = parseCheckpoint(old);
        if (previous.workspace !== w.resolved || previous.task !== p.task)
          fail("TASK_MISMATCH");
      }
    } else if (migration) fail("HANDOVER_MISSING");
    const stable = {
      workspace: w.resolved,
      task: p.task,
      session: p.session,
      status: p.status,
      goals: p.goals,
      inflight: p.inflight,
      summary: p.summary,
    };
    const fingerprint = sha(JSON.stringify(stable));
    if (
      previous?.fingerprint === fingerprint &&
      old === content({ ...stable, revision: previous.revision, fingerprint })
    )
      return { signal: "NO_DIFF", path: rel, hash };
    if (hash !== p.expectedHash) fail("HANDOVER_CONCURRENT_UPDATE");
    if (
      previous &&
      goalContract(previous) !== goalContract(stable) &&
      p.reviseGoals !== true
    )
      fail("GOAL_CHANGE_REQUIRES_EXPLICIT_REVISION");
    const text = content({
      ...stable,
      revision: (previous?.revision ?? 0) + 1,
      fingerprint,
    });
    atomic(file, text, hash);
    return { signal: "CHECKPOINT_SAVED", path: rel, hash: sha(text) };
  });
}
function durablePath(vault, rel) {
  if (
    typeof rel !== "string" ||
    !/^(knowledge\/.+|sources\/sources|projects\/[^/]+\/.+)\.md$/.test(rel) ||
    rel.startsWith("raw/")
  )
    fail("DURABLE_PATH_REJECTED");
  return safe(vault, rel);
}
function sourcePath(vault, rel, handover) {
  if (
    typeof rel !== "string" ||
    rel === handover ||
    rel.startsWith("handovers/") ||
    !/^(sources|raw|knowledge|projects)\/.+\.md$/.test(rel)
  )
    fail("UNSTABLE_SOURCE");
  const f = safe(vault, rel);
  if (read(f) === null) fail("SOURCE_MISSING");
  return f;
}
export function finalize(p) {
  const { w, rel } = identity(p);
  const file = safe(p.vault, rel);
  if (
    !read(safe(p.vault, "handovers/handovers.md"))?.includes(
      "<!-- aget-finalize:v1 -->",
    )
  )
    fail("VAULT_FINALIZE_NOT_ENABLED");
  return locked(p.vault, () => {
    const text = read(file);
    if (text === null) {
      const status = read(durablePath(p.vault, p.statusPath));
      if (
        status?.includes(`Checkpoint-SHA256: ${p.expectedHash}`) &&
        status.includes(`完成任務 ${p.task}`) &&
        status.includes(w.resolved)
      )
        return { signal: "ALREADY_FINALIZED" };
      fail("HANDOVER_MISSING");
    }
    if (sha(text) !== p.expectedHash) fail("HANDOVER_CONCURRENT_UPDATE");
    const state = parseCheckpoint(text);
    if (state.workspace !== w.resolved || state.task !== p.task)
      fail("TASK_MISMATCH");
    validateCheckpoint({ ...state, summary: "validated metadata" });
    if (
      state.status !== "completed" ||
      state.goals.some((g) => g.state !== "pass") ||
      !Array.isArray(state.inflight) ||
      state.inflight.length
    )
      fail("GOALS_NOT_COMPLETE");
    const statusRel = p.statusPath;
    if (!/^projects\/[^/]+\/status\.md$/.test(statusRel ?? ""))
      fail("STATUS_PATH_REQUIRED");
    const statusFile = durablePath(p.vault, statusRel);
    const d = p.distillation;
    if (
      !d ||
      !["new", "existing", "none"].includes(d.kind) ||
      typeof d.reason !== "string" ||
      !d.reason.trim()
    )
      fail("DISTILLATION_REQUIRED");
    const writes = p.writes ?? [];
    if (!Array.isArray(writes)) fail("INVALID_WRITES");
    const paths = new Set();
    const prepared = [];
    for (const write of writes) {
      if (
        write.path?.startsWith("projects/") &&
        write.path.split("/")[1] !== statusRel.split("/")[1]
      )
        fail("PROJECT_SCOPE_MISMATCH");
      if (paths.has(write.path) || write.path === statusRel)
        fail("DUPLICATE_WRITE");
      paths.add(write.path);
      const f = durablePath(p.vault, write.path);
      if (typeof write.content !== "string" || !write.content.trim())
        fail("EMPTY_DURABLE_WRITE");
      const current = read(f);
      if (current !== write.content && digest(f) !== write.expectedHash)
        fail("CONCURRENT_UPDATE");
      prepared.push([f, write, current]);
    }
    const referenced = new Map();
    if (d.kind === "none") {
      if (writes.length || d.knowledge?.length)
        fail("UNEXPECTED_KNOWLEDGE_WRITE");
    } else {
      if (
        !Array.isArray(d.knowledge) ||
        !d.knowledge.length ||
        !Array.isArray(d.sources) ||
        !d.sources.length
      )
        fail("DISTILLATION_LINKS_REQUIRED");
      for (const k of d.knowledge) {
        if (!/^(knowledge|projects)\/.+\.md$/.test(k) || k === statusRel)
          fail("KNOWLEDGE_PATH_REQUIRED");
        durablePath(p.vault, k);
        if (d.kind === "new" && !paths.has(k))
          fail("NEW_KNOWLEDGE_NOT_WRITTEN");
      }
      if (d.kind === "existing" && writes.length)
        fail("EXISTING_KNOWLEDGE_IS_READ_ONLY");
      for (const s of d.sources) {
        if (
          typeof s !== "string" ||
          s.startsWith("handovers/") ||
          !/^(sources|raw|knowledge|projects)\/.+\.md$/.test(s) ||
          s === rel
        )
          fail("UNSTABLE_SOURCE");
        safe(p.vault, s);
        if (!paths.has(s)) sourcePath(p.vault, s, rel);
      }
    }
    const key = sha(w.resolved + "\n" + p.task).slice(0, 24),
      begin = `<!-- aget-task:${key}:begin -->`,
      end = `<!-- aget-task:${key}:end -->`;
    const statusOld = read(statusFile) ?? "";
    const known = state.goals
      .map((g) => `- ${g.id}: ${g.title}\n  - 驗證：${g.evidence}`)
      .join("\n");
    const links =
      d.kind === "none"
        ? `無新增知識：${d.reason}`
        : `蒸餾：${d.kind}；${d.reason}\n` +
          [...d.knowledge, ...d.sources]
            .map((x) => `- [${x}](../../${x})`)
            .join("\n");
    const block = `${begin}\n## 完成任務 ${p.task}\n\nWorkspace: ${w.resolved}\nCheckpoint-SHA256: ${p.expectedHash}\n\n${known}\n\n${links}\n\n限制：${p.limitations || "無"}\n${end}`;
    let statusNext;
    if (statusOld.includes(begin)) {
      const a = statusOld.indexOf(begin),
        b = statusOld.indexOf(end, a);
      if (b < 0 || statusOld.indexOf(begin, a + 1) >= 0)
        fail("INVALID_STATUS_MARKERS");
      statusNext =
        statusOld.slice(0, a) + block + statusOld.slice(b + end.length);
    } else {
      if (statusOld.includes(end)) fail("INVALID_STATUS_MARKERS");
      statusNext =
        statusOld +
        (statusOld.endsWith("\n") ? "" : "\n") +
        "\n" +
        block +
        "\n";
    }
    if (statusOld !== statusNext && digest(statusFile) !== p.statusExpectedHash)
      fail("STATUS_CONCURRENT_UPDATE");
    // Preflight all paths before writing. Retries accept identical desired content.
    for (const [f, write, current] of prepared)
      if (current !== write.content)
        atomic(f, write.content, write.expectedHash);
    if (d.kind !== "none")
      for (const k of d.knowledge) {
        const body = read(durablePath(p.vault, k));
        if (!body?.trim()) fail("KNOWLEDGE_MISSING");
        for (const s of d.sources) sourcePath(p.vault, s, rel);
        const links = [...body.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
        const actual = links
          .filter((x) => !x.includes("://"))
          .map((x) =>
            path.posix.normalize(
              path.posix.join(path.posix.dirname(k), x.split("#")[0]),
            ),
          );
        if (!d.sources.some((s) => actual.includes(s)))
          fail("KNOWLEDGE_SOURCE_LINK_REQUIRED");
        referenced.set(k, digest(durablePath(p.vault, k)));
        for (const s of d.sources)
          referenced.set(s, digest(sourcePath(p.vault, s, rel)));
      }
    if (statusOld !== statusNext)
      atomic(statusFile, statusNext, p.statusExpectedHash);
    if (read(statusFile) !== statusNext) fail("STATUS_READBACK_FAILED");
    for (const [f, write] of prepared)
      if (read(f) !== write.content) fail("KNOWLEDGE_READBACK_FAILED");
    for (const [ref, hash] of referenced)
      if (digest(safe(p.vault, ref)) !== hash) fail("SOURCE_CONCURRENT_UPDATE");
    safe(p.vault, rel);
    if (digest(file) !== p.expectedHash) fail("HANDOVER_CONCURRENT_UPDATE");
    fs.unlinkSync(file);
    return { signal: "FINALIZED", statusPath: statusRel, deleted: rel };
  });
}
