// SIT 驗測共用：token 預檢與寫入攔截瀏覽器。連線資訊由呼叫端從 sit.env 讀入，本檔不含任何主機或帳號。
// 執行時需 NODE_USE_SYSTEM_CA=1（企業內部 CA）。
// PLAYWRIGHT_CORE 須為指向 playwright-core/index.mjs 的 file:/// URL，例如
//   file:///C:/Users/<user>/Desktop/playwright-harness/node_modules/playwright-core/index.mjs
import fs from 'node:fs';

export function loadEnv(file) {
  const o = {};
  for (const l of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) o[m[1]] = m[2];
  }
  return o;
}

// secrets：已知敏感值（token、帳號等），逐字替換為 ***。
export const mask = (s, base, secrets = []) => {
  let t = String(s);
  for (const x of secrets) if (x) t = t.split(x).join('***');
  return t
    .split(new URL(base).host).join('<SIT_HOST>')
    .replace(/accessToken=[^&\s"']+/g, 'accessToken=***')
    .replace(/"accessToken"\s*:\s*"[^"]*"/g, '"accessToken":"***"')
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]*/g, '<JWT>')
    .replace(/Bearer\s+\S+/gi, 'Bearer ***');
};

// 回傳 { ok, status, hasToken }；token 為不可列舉屬性，console.log／JSON.stringify 不會帶出。
// ok=false 時呼叫端必須中止，不重試、不關 TLS 驗證。
export async function precheck(base, loginPath, body, tokenPath = ['data', 'accessToken']) {
  let status, token = null;
  try {
    const r = await fetch(base.replace(/\/$/, '') + loginPath, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'manual',
      signal: AbortSignal.timeout(20000),
    });
    status = r.status;
    if (r.ok) {
      try { token = tokenPath.reduce((o, k) => o?.[k], await r.json()); } catch {}
      if (typeof token !== 'string' || !token) token = null;
    }
  } catch (e) {
    status = 'ERROR ' + (e.cause?.code || e.message);
  }
  const res = { ok: !!token, status, hasToken: !!token };
  Object.defineProperty(res, 'token', { value: token, enumerable: false });
  return res;
}

async function loadChromium() {
  const spec = process.env.PLAYWRIGHT_CORE || 'playwright-core';
  try {
    const pw = await import(spec);
    const chromium = pw.chromium ?? pw.default?.chromium;
    if (chromium) return chromium;
  } catch {}
  throw new Error('找不到 playwright-core：請將 PLAYWRIGHT_CORE 設為 playwright-core/index.mjs 的 file:/// URL');
}

const READ_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// allowPost: [{ path: RegExp|string, check?: (bodyJson) => boolean }]（RegExp 勿用 g 旗標）
// denyGet: [RegExp|string]，有副作用的 GET（如 logout、標記類）
// 驗測腳本不得使用 page.request／context.request，也不得另行註冊 route（會繞過守衛）。
export async function startSession({ base, allowPost = [], denyGet = [], marker = 'sit-verify', initScript, headless = true }) {
  const chromium = await loadChromium();
  const origin = new URL(base).origin;
  const secrets = [];
  const m$ = (s) => mask(s, base, secrets);
  const log = { blocked: [], allowedPosts: [], foreign: [], leaked: [], unsure: [], console: [], pageErrors: [] };
  const match = (p, x) => (x instanceof RegExp ? ((x.lastIndex = 0), x.test(p)) : x === p);
  const isAllowedPost = (p, data) => {
    const rule = allowPost.find((r) => match(p, r.path));
    if (!rule) return false;
    if (!rule.check) return true;
    try { return !!rule.check(JSON.parse(data || 'null')); } catch { return false; }
  };
  // 單一判定，route 與覆核共用：'pass'（非網路）、'foreign'、'deny'、'allow'
  const decide = (method, url, data) => {
    const u = new URL(url);
    if (u.protocol === 'data:' || u.protocol === 'blob:') return 'pass';
    if (u.origin !== origin) return 'foreign';
    if (READ_METHODS.includes(method)) return denyGet.some((x) => match(u.pathname, x)) ? 'deny' : 'allow';
    return method === 'POST' && isAllowedPost(u.pathname, data) ? 'allow' : 'deny';
  };

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless,
    args: [`--${marker}-marker=${process.pid}`],
  });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, acceptDownloads: true, serviceWorkers: 'block' });
  if (typeof ctx.routeWebSocket !== 'function') {
    await browser.close();
    throw new Error('此版 playwright-core 無 routeWebSocket，無法攔截 WebSocket，中止');
  }
  if (initScript) await ctx.addInitScript(initScript);

  const handled = new WeakSet();
  const deny = (route, m, p, reason = '') => {
    handled.add(route.request());
    log.blocked.push(m$(`${m} ${p}${reason}`));
    return route.fulfill({ status: 403, contentType: 'application/json', body: '{"message":"blocked by verify"}' });
  };
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const m = req.method();
    const u = new URL(req.url());
    const d = decide(m, req.url(), req.postData());
    if (d === 'pass') return route.continue();
    if (d === 'foreign') { handled.add(req); log.foreign.push(m$(`${m} <OTHER_HOST>${u.pathname}`)); return route.abort(); }
    if (d === 'deny') return deny(route, m, u.pathname);
    // 放行的請求由守衛代送且不跟隨轉址：3xx 轉址後的請求不會再經過 route，一律拒絕。
    try {
      const resp = await route.fetch({ maxRedirects: 0 });
      if (resp.status() >= 300 && resp.status() < 400) return deny(route, m, u.pathname, ` (redirect ${resp.status()})`);
      if (m === 'POST') log.allowedPosts.push(`POST ${u.pathname}`);
      handled.add(req);
      return route.fulfill({ response: resp });
    } catch (e) {
      handled.add(req);
      log.unsure.push(m$(`${m} ${u.pathname} fetch-error`));
      return route.abort();
    }
  });
  await ctx.routeWebSocket(/.*/, (ws) => { log.blocked.push('WS ' + m$(ws.url())); ws.close(); });

  // 覆核：任何未經守衛處理、且判定非 allow 的請求記入 leaked；失敗請求列 unsure。
  const audit = (r, failed) => {
    if (handled.has(r)) return;
    let d;
    try { d = decide(r.method(), r.url(), r.postData()); } catch { return; }
    if (d === 'pass') return;
    const line = m$(`${r.method()} ${d === 'foreign' ? '<OTHER_HOST>' : ''}${new URL(r.url()).pathname}`);
    if (d !== 'allow') log.leaked.push(line);
    else if (failed) log.unsure.push(line + ' failed');
  };
  ctx.on('requestfinished', (r) => audit(r, false));
  ctx.on('requestfailed', (r) => audit(r, true));

  const page = await ctx.newPage();
  page.on('console', (c) => { if (['error', 'warning'].includes(c.type())) log.console.push(`${c.type()}: ${m$(c.text()).slice(0, 300)}`); });
  page.on('pageerror', (e) => log.pageErrors.push(m$(e.message).slice(0, 300)));
  return { browser, ctx, page, log, marker, addSecret: (x) => { if (x) secrets.push(x); }, mask: m$ };
}
