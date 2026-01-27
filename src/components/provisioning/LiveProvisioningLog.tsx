'use client';

import { RealtimeLogViewer } from './RealtimeLogViewer';

interface LiveProvisioningLogProps {
  sessionId: string | null;
  isActive: boolean;
}

/**
 * Live configuration log component for Step 3.
 * Uses the unified RealtimeLogViewer component for consistency.
 */
export function LiveProvisioningLog({ sessionId, isActive }: LiveProvisioningLogProps) {
  return (
    <div className="space-y-3">
      <RealtimeLogViewer
        sessionId={sessionId}
        title="Live Configuration"
        subtitle="Real-time provisioning logs and status updates"
        autoConnect={isActive}
        showConnectionStatus={true}
        height="h-48"
      />
    </div>
  );
}
