import { expect, request, test } from '@playwright/test';

test.describe('Provisioning bootstrap script', () => {
  test('bootstrap script includes backend notify URL with token', async ({}) => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.100.4:8000/api/v1';

    // Request a command from the bootstrap command endpoint
    const cmdResp = await request.get(`${apiBase}/provisioning/bootstrap/command?identity=UnitTest&api_port=8728&interface=ether1`);
    expect(cmdResp.ok()).toBeTruthy();
    const cmdJson = await cmdResp.json();

    expect(cmdJson.command).toBeTruthy();
    expect(cmdJson.script_url).toBeTruthy();
    expect(cmdJson.token).toBeTruthy();

    // Fetch the script using the token returned and assert it contains notify endpoint
    const scriptUrl = `${apiBase}/provisioning/bootstrap/script?token=${encodeURIComponent(cmdJson.token)}&identity=UnitTest&api_port=8728&interface=ether1`;
    const scriptResp = await request.get(scriptUrl);
    expect(scriptResp.ok()).toBeTruthy();
    const scriptText = await scriptResp.text();

    expect(scriptText).toContain('/provisioning/bootstrap/notify');
    expect(scriptText).toContain(cmdJson.token);
  });
});