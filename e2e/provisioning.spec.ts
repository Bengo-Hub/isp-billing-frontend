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

// Ensure a notify that arrives before session start is consumed when the UI
// later starts provisioning (backend should record pending_checkin and the
// subsequent session start should immediately complete).
test('notify-before-session-start is consumed when session starts', async ({ request }) => {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  // Authenticate
  const loginResp = await request.post(`${apiBase}/auth/login`, { data: 'username=demo&password=demo123', headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  expect(loginResp.ok()).toBeTruthy();
  const token = (await loginResp.json()).access_token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Generate a provisioning token via the bootstrap command endpoint
  const cmdResp = await request.get(`${apiBase}/provisioning/bootstrap/command?identity=E2E-NotifyTest&api_port=8728&interface=ether1`, { headers: authHeaders });
  expect(cmdResp.ok()).toBeTruthy();
  const cmdJson = await cmdResp.json();

  // Simulate router calling notify BEFORE any session exists
  const notifyResp = await request.post(`${apiBase}/provisioning/bootstrap/notify?token=${encodeURIComponent(cmdJson.token)}&identity=E2E-NotifyTest&ip_address=77.237.232.66`);
  expect(notifyResp.ok()).toBeTruthy();
  const notifyJson = await notifyResp.json();
  expect(notifyJson.note).toBe('pending_checkin_recorded');

  // Create a router that matches the IP reported by the notify
  const routerResp = await request.post(`${apiBase}/routers/`, { headers: authHeaders, data: JSON.stringify({ name: 'E2E-NotifyTest', ip_address: '77.237.232.66', username: 'admin', password: 'password', router_type: 'mikrotik', port: 8728 }) });
  expect(routerResp.ok()).toBeTruthy();
  const router = await routerResp.json();

  // Start provisioning workflow - backend should consume pending_checkin and
  // mark session completed immediately
  const workflowResp = await request.post(`${apiBase}/provisioning/workflow`, { headers: authHeaders, data: JSON.stringify({ router_id: router.id, service_type: 'hotspot', configuration: {} }) });
  expect(workflowResp.ok()).toBeTruthy();
  const wfJson = await workflowResp.json();
  expect(wfJson.session_id).toBeTruthy();

  // Poll session status until completed or timeout
  const statusUrl = `${apiBase}/provisioning/sessions/${encodeURIComponent(wfJson.session_id)}/status`;
  let status = null;
  for (let i = 0; i < 10; i++) {
    const s = await request.get(statusUrl, { headers: authHeaders });
    expect(s.ok()).toBeTruthy();
    status = await s.json();
    if (status.status === 'completed') break;
    await new Promise(res => setTimeout(res, 200));
  }

  expect(status.status).toBe('completed');
});