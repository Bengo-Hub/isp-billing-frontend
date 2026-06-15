'use client';

import { Info, ExternalLink } from 'lucide-react';

/**
 * OwnershipNotice — read-only data-ownership banner for platform screens.
 *
 * Per CROSS-SERVICE-DATA-OWNERSHIP.md, several platform screens here surface data
 * that is OWNED by a sibling service (auth-api: tenants/users; subscriptions-api:
 * plans/tiers; treasury-api: invoices/payments). Those screens are kept working
 * for continuity, but this banner makes the source of truth explicit and — when
 * the sibling's management UI URL is configured — offers a "Manage in <service>"
 * link-out instead of encouraging parallel writes here.
 *
 * Conservative + additive: when `manageUrl` is empty the button is simply omitted
 * and the local screen continues to function as before.
 */
export interface OwnershipNoticeProps {
  owner: string;
  description: string;
  manageUrl?: string;
  manageLabel?: string;
}

export function OwnershipNotice({
  owner,
  description,
  manageUrl,
  manageLabel,
}: OwnershipNoticeProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900">
          Managed by {owner}
        </p>
        <p className="text-sm text-blue-700 mt-0.5">{description}</p>
      </div>
      {manageUrl ? (
        <a
          href={manageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900 whitespace-nowrap"
        >
          {manageLabel || `Manage in ${owner}`}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : null}
    </div>
  );
}

export default OwnershipNotice;
