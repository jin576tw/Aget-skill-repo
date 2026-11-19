// SIT 驗測共用：token 預檢與寫入攔截瀏覽器。連線資訊由呼叫端從 sit.env 讀入，本檔不含任何主機或帳號。
// 執行時需 NODE_USE_SYSTEM_CA=1（企業內部 CA）。playwright-core 路徑以 PLAYWRIGHT_CORE 指定（file:/// URL）。
import fs from 'node:fs';

export function loadEnv(file) {
  const o = {};
  for (const l of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) o[m[1]] = m[2];
  }
  return o;
}

export const mask = (s, base) => String(s).split(new URL(base).host).join('<SIT_HOST>').replace(/accessToken=[^&\s"']+/g, 'accessToken=***');

// 回傳 { status, hasToken, token }；呼叫端只可輸出 status 與 hasToken。
export async function precheck(base, loginPath, body) {
  try {
    const r = await fetch(base + loginPath, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    let token = null;
    try { token = (await r.json())?.data?.accessToken || null; } catch {}
    return { status: r.status, hasToken: !!token, token };
  } catch (e) {
    return { status: 'ERROR ' + (e.cause?.code || e.message), hasToken: false, token: null };
  }
}

// allowPost: [{ path: RegExp|string, check?: (bodyJson) => boolean }]
export async function startSession({ base, allowPost = [], marker = 'sit-verify', initScript, headless = true }) {
  const { chromium } = await import(process.env.PLAYWRIGHT_CORE || 'playwright-core');
  const host = new URL(base).host;
  const log = { blocked: [], allowedPosts: [], foreign: [], console: [], pageErrors: [] };
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless,
    args: [`--${marker}-marker=${process.pid}`],
  });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, acceptDownloads: true });
  if (initScript) await ctx.addInitScript(initScript);
  const deny = (route, m, p) => {
    log.blocked.push(`${m} ${p}`);
    return route.fulfill({ status: 403, contentType: 'application/json', body: '{"message":"blocked by verify"}' });
  };
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const m = req.method();
    const u = new URL(req.url());
    if (u.protocol === 'data:' || u.protocol === 'blob:') return route.continue();
    if (u.host !== host) { log.foreign.push(`${m} <OTHER_HOST>${u.pathname}`); return route.abort(); }
    if (['GET', 'HEAD', 'OPTIONS'].includes(m)) return route.continue();
    if (m === 'POST') {
      const rule = allowPost.find((r) => (r.path instanceof RegExp ? r.path.test(u.pathname) : r.path === u.pathname));
      if (rule) {
        let ok = true;
        if (rule.check) { try { ok = !!rule.check(JSON.parse(req.postData() || 'null')); } catch { ok = false; } }
        if (ok) { log.allowedPosts.push(`POST ${u.pathname}`); return route.continue(); }
      }
    }
    return deny(route, m, u.pathname);
  });
  const page = await ctx.newPage();
  page.on('console', (c) => { if (['error', 'warning'].includes(c.type())) log.console.push(`${c.type()}: ${mask(c.text(), base).slice(0, 300)}`); });
  page.on('pageerror', (e) => log.pageErrors.push(mask(e.message, base).slice(0, 300)));
  return { browser, ctx, page, log, marker };
}
