'use client';

import { OfflineBar } from '@bengo-hub/shared-ui-lib/offline';

/**
 * Fleet-uniform offline + PWA-update bar (Codevertex standard:
 * pwa-offline-uniform-pattern; mirrors library-ui / pos-ui).
 *
 * `OfflineBar` registers the offline-shell service worker AND renders the shared
 * `PwaUpdater` banner (showUpdater defaults true). PwaUpdater polls the deployed
 * Next.js build id and, when a newer build ships, shows "New update available —
 * Reload", clears caches + unregisters the SW and hard-reloads. This is the
 * root-cause fix for clients getting stuck on stale buy-page JS (the legacy
 * `/gateways` caller) — they now always pick up the latest deploy.
 *
 * Mounted once near the root layout. The captive buy flow is online-only (paying
 * for internet requires connectivity), so `disabledOffline` lists the actions
 * that need the network and `availableOffline` only the browse step.
 */
export function OfflineUpdateBar() {
  return (
    <OfflineBar
      availableOffline={['Browse packages']}
      disabledOffline={['Buy package', 'Redeem voucher', 'Connect']}
    />
  );
}
