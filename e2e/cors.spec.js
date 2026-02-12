const { test, expect } = require('@playwright/test');

test('production frontend login + monitor CORS errors', async ({ page }) => {
  const corsErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    if (/CORS|Access-Control|Cross-Origin/i.test(text)) {
      corsErrors.push(`console: ${text}`);
    }
  });

  page.on('requestfailed', req => {
    const f = req.failure();
    const txt = f && f.errorText ? f.errorText : '';
    if (/CORS|Access-Control|Cross-Origin/i.test(txt) || /blocked/i.test(txt)) {
      corsErrors.push(`requestfailed: ${req.method()} ${req.url()} -> ${txt}`);
    }
  });

  page.on('response', res => {
    try {
      const req = res.request();
      if (req.resourceType() === 'xhr' || req.url().includes('/api/v1/')) {
        const headers = res.headers();
        const acao = headers['access-control-allow-origin'] || headers['Access-Control-Allow-Origin'];
        if (!acao) {
          corsErrors.push(`missing ACAO for ${req.method()} ${req.url()}`);
        }
      }
    } catch (e) {
      // ignore
    }
  });

  // Directly hit production frontend and perform login
  await page.goto('https://ispbilling.codevertexitsolutions.com/login', { waitUntil: 'networkidle' });

  await page.fill('input[name="username"]', 'demo');
  await page.fill('input[name="password"]', 'demo123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);

  await page.goto('https://ispbilling.codevertexitsolutions.com/demo-isp/dashboard/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  console.log('FOUND CORS ERRORS:', corsErrors);
  expect(corsErrors, `CORS-related errors captured: ${corsErrors.join('\n')}`).toHaveLength(0);
});