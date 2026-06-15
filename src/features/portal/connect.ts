import { checkConnectionStatus } from '@/features/portal/api';

/**
 * Authenticate the CLIENT DEVICE onto the MikroTik hotspot.
 *
 * MikroTik only grants internet once the *client's browser* submits
 * username+password to the hotspot login endpoint (http-pap accepts plain
 * credentials). A fetch/XHR is not enough — the browser must navigate there —
 * so we build a real <form> and submit it. `dst` is where MikroTik sends the
 * client after a successful login (the ISP's redirect_url, e.g. google.com).
 *
 * Shared by BOTH the voucher-redeem path (buy/[orgSlug]) and the post-payment
 * path (payment/callback) so a paying customer is authenticated the same way a
 * redeeming one is — without it the device stays unauthenticated and HTTPS to
 * the redirect target is closed by the no-cert hotspot (ERR_CONNECTION_CLOSED).
 */
export function loginToHotspot(
  loginurl: string,
  username: string,
  password: string,
  dst?: string,
) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = loginurl;
  const add = (n: string, v: string) => {
    const i = document.createElement('input');
    i.type = 'hidden';
    i.name = n;
    i.value = v;
    form.appendChild(i);
  };
  add('username', username);
  add('password', password);
  if (dst) add('dst', dst);
  document.body.appendChild(form);
  form.submit();
}

/**
 * Poll the connection-status endpoint until the router has actually created the
 * hotspot user (the agent provisions it asynchronously on its next poll), so we
 * never submit the login form before the user exists. Bounded so it never spins
 * forever; returns once ready/failed or on timeout (caller still attempts login).
 */
export async function waitForUserReady(
  orgSlug: string,
  username: string,
  timeoutMs = 45000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const st = await checkConnectionStatus(orgSlug, username);
      if (st.ready || st.status === 'failed') return;
    } catch {
      // transient (captive client may briefly lose the cloud) — keep trying
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
}
