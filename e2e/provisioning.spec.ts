import { expect, test } from '@playwright/test';

test('bootstrap script contains backend notify URL', async ({ request }) => {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  // Authenticate first (use local admin test credentials)
  const loginResp = await request.post(`${apiBase}/auth/login`, { data: 'username=demo&password=demo123', headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  expect(loginResp.ok()).toBeTruthy();
  const token = (await loginResp.json()).access_token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  const cmdResp = await request.get(`${apiBase}/provisioning/bootstrap/command?identity=UnitTest&api_port=8728&interface=ether1`, { headers: authHeaders });
  expect(cmdResp.ok()).toBeTruthy();
  const cmdJson = await cmdResp.json();

  expect(cmdJson.command).toBeTruthy();
  expect(cmdJson.script_url).toBeTruthy();
  expect(cmdJson.token).toBeTruthy();

  const scriptResp = await request.get(`${apiBase}/provisioning/bootstrap/script?token=${encodeURIComponent(cmdJson.token)}&identity=UnitTest&api_port=8728&interface=ether1`, { headers: authHeaders });
  expect(scriptResp.ok()).toBeTruthy();
  const scriptText = await scriptResp.text();

  expect(scriptText).toContain('/provisioning/bootstrap/notify');
  expect(scriptText).toContain(cmdJson.token);
});