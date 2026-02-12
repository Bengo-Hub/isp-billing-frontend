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

  // Go to production frontend login
  await page.goto('https://ispbilling.codevertexitsolutions.com/login', { waitUntil: 'networkidle' });

  // Login using demo credentials
  await page.fill('input[name="username"]', 'demo');
  await page.fill('input[name="password"]', 'demo123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);

  // Navigate to demo-isp dashboard (if not already redirected)
  await page.goto('https://ispbilling.codevertexitsolutions.com/demo-isp/dashboard/', { waitUntil: 'networkidle' });

  // Wait a short while for XHRs to fire
  await page.waitForTimeout(5000);

  console.log('FOUND CORS ERRORS:', corsErrors);

  // Attach errors to test result (fail if any observed)
  expect(corsErrors, `CORS-related errors captured: ${corsErrors.join('\n')}`).toHaveLength(0);
});