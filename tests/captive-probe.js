/*
 * Captive-portal diagnostic probe.
 *
 * Run from the isp-billing-frontend dir (so node resolves the installed
 * Playwright), while the laptop is connected to the hotspot (ether3 or the
 * "Codevertex TP-Link AP 1" Wi-Fi):
 *
 *   node tests/captive-probe.js
 *
 * It opens a visible browser, visits the captive-trigger URLs, and writes a
 * screenshot + the final URL / status / HTML snippet for each to
 * tests/captive-out/. Then reconnect the laptop to the internet and share
 * tests/captive-out/ (captive-results.json + captive-*.png).
 *
 * Output dir override: PROBE_OUT=/some/dir node tests/captive-probe.js
 */
const fs = require('fs');
const path = require('path');

let chromium;
try { chromium = require('playwright').chromium; }
catch (e) { chromium = require('@playwright/test').chromium; }

const URLS = [
  'http://connectivitycheck.gstatic.com/generate_204', // Android captive probe (DNS-hijacked -> gateway)
  'http://neverssl.com',                                // plain HTTP, NOT hijacked -> tests the standard intercept
  'http://example.com',                                 // plain HTTP control
  'http://172.31.1.1/login',                            // the hotspot login page directly
];

const OUT = process.env.PROBE_OUT || path.join(__dirname, 'captive-out');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  let browser;
  try { browser = await chromium.launch({ headless: false, channel: 'chrome' }); }
  catch (e) { browser = await chromium.launch({ headless: false }); }

  const results = [];
  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i];
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await ctx.newPage();
    const entry = { url, finalUrl: null, status: null, title: null, snippet: null, error: null };
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3500); // let meta-refresh / JS redirects settle
      entry.finalUrl = page.url();
      entry.status = resp ? resp.status() : null;
      entry.title = await page.title().catch(() => null);
      entry.snippet = (await page.content().catch(() => '')).replace(/\s+/g, ' ').slice(0, 400);
    } catch (e) {
      entry.error = String(e.message || e).slice(0, 250);
      try { entry.finalUrl = page.url(); } catch (_) {}
    }
    try { await page.screenshot({ path: path.join(OUT, `captive-${i}.png`) }); } catch (_) {}
    results.push(entry);
    console.log(`\n[${i}] ${url}`);
    console.log(`    final : ${entry.finalUrl}`);
    console.log(`    status: ${entry.status}   title: ${entry.title}`);
    if (entry.error) console.log(`    ERROR : ${entry.error}`);
    console.log(`    html  : ${entry.snippet}`);
    await ctx.close();
  }

  fs.writeFileSync(path.join(OUT, 'captive-results.json'), JSON.stringify(results, null, 2));
  console.log(`\nDONE -> ${OUT} (captive-results.json + captive-0..${URLS.length - 1}.png)`);
  await new Promise((r) => setTimeout(r, 4000)); // keep the window up briefly to eyeball
  await browser.close();
})();
