// Playwright helpers for the screenshot half of step 1: red boxes, spinner settle, "no write requests" guard.
// Project-agnostic — no login, URLs or credentials in here. Import `chromium` yourself (playwright-core or @playwright/test)
// so this file needs no dependency of its own. Usage sketch:
//
//   import { chromium } from 'playwright-core';
//   import { launchChrome, settle, trackWrites, snap, annotateImage } from '<skill>/scripts/shot-helpers.mjs';
//   const { browser, page } = await launchChrome(chromium);
//   const writes = trackWrites(page);
//   await page.goto(url); await settle(page);
//   // one red box per group: a group is a locator, or an array of locators that share ONE box (e.g. a field's label + control)
//   await snap(page, [[page.getByText('欄位標題'), page.getByRole('textbox')]], '<images dir>/item1.png');
//   console.log('non-GET requests:', writes);        // evidence for "read-only run"
//   // reuse an older screenshot: draw boxes (natural-size px) on an existing PNG
//   await annotateImage(browser, 'old.png', '<images dir>/item2.png', [{ x: 40, y: 20, w: 300, h: 40 }]);
//   await browser.close();
//
// Red-box convention used with this skill: one box per field (title + control together, never split a field into two boxes);
// frame only what the item is about; do not box an image that shows an absence or the plain current state.
import fs from 'node:fs';
import path from 'node:path';

export const CHROME = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined);
const STYLE = { pad: 6, color: '#e8112d', width: 3 };

export async function launchChrome(chromium, { width = 1440, height = 900, headless = true, executablePath = CHROME } = {}) {
  const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless });
  const page = await (await browser.newContext({ viewport: { width, height } })).newPage();
  return { browser, page };
}

// Records every non-GET request (method + path only; no bodies, no tokens). Returns the live array.
export function trackWrites(page) {
  const calls = [];
  page.on('request', (r) => { if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())) calls.push(`${r.method()} ${new URL(r.url()).pathname}`); });
  return calls;
}

// Add CSS to every page load (e.g. let clicks pass through a fading overlay: '.overlay.fade-out{pointer-events:none!important}').
export const injectStyle = (page, css) => page.addInitScript((c) => document.addEventListener('DOMContentLoaded', () => {
  const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st);
}), css);

// Wait for network idle and for a global spinner overlay (selector configurable, pass null to skip) to disappear.
export async function settle(page, { spinner = '.ngx-spinner-overlay:not(.fade-out)', timeout = 20000 } = {}) {
  await page.waitForLoadState('networkidle').catch(() => {});
  if (spinner) await page.waitForFunction((sel) => !document.querySelector(sel), spinner, { timeout }).catch(() => {});
}

// Union bounding box of one group (a locator or an array of locators).
async function groupRect(group) {
  const list = Array.isArray(group) ? group : [group];
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const loc of list) {
    const b = await loc.boundingBox();
    if (!b) throw new Error('redBox: target has no bounding box (not visible?)');
    x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height);
  }
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

export async function redBox(page, groups, opts = {}) {
  const { pad, color, width } = { ...STYLE, ...opts };
  for (const g of groups) {
    const b = await groupRect(g);
    await page.evaluate(({ b, pad, color, width }) => {
      const d = document.createElement('div');
      d.className = '__redbox';
      d.style.cssText = `position:fixed;left:${b.x - pad}px;top:${b.y - pad}px;width:${b.width + pad * 2}px;height:${b.height + pad * 2}px;border:${width}px solid ${color};box-sizing:border-box;pointer-events:none;z-index:2147483647;`;
      document.body.appendChild(d);
    }, { b, pad, color, width });
  }
}
export const clearBoxes = (page) => page.evaluate(() => document.querySelectorAll('.__redbox').forEach((e) => e.remove()));

function prepare(file) {
  file = path.resolve(file);
  if (fs.existsSync(file)) throw new Error(`screenshot exists, refuse to overwrite: ${file}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return file;
}

// Draw red boxes around `groups`, screenshot to `file` (refuses to overwrite), then remove the boxes.
// opts: pad, color, width, plus Playwright screenshot options in `shot` (e.g. { fullPage: true }).
export async function snap(page, groups, file, { shot, ...style } = {}) {
  file = prepare(file);
  await redBox(page, groups, style);
  try { await page.screenshot({ path: file, ...shot }); } finally { await clearBoxes(page); }
  return file;
}

// Screenshot without any box (for images that show the plain current state).
export async function plain(page, file, { shot } = {}) {
  file = prepare(file);
  await page.screenshot({ path: file, ...shot });
  return file;
}

// Draw red boxes ({x,y,w,h} in the image's own pixels) on an existing PNG and save a new file (refuses to overwrite).
export async function annotateImage(browser, src, out, boxes, { pad = 0, color = '#e8112d', width = 3 } = {}) {
  out = prepare(out);
  const b64 = fs.readFileSync(src).toString('base64');
  const page = await browser.newPage();
  try {
    const divs = boxes.map((b) => `<div style="position:absolute;left:${b.x - pad}px;top:${b.y - pad}px;width:${b.w + pad * 2}px;height:${b.h + pad * 2}px;border:${width}px solid ${color};box-sizing:border-box"></div>`).join('');
    await page.setContent(`<body style="margin:0"><div id="w" style="position:relative;display:inline-block"><img id="i" src="data:image/png;base64,${b64}" style="display:block">${divs}</div></body>`);
    await page.waitForFunction(() => document.getElementById('i').complete);
    await page.locator('#w').screenshot({ path: out });
  } finally { await page.close(); }
  return out;
}
