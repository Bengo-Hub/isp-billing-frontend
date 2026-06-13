'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api/api-client';
import { Copy, CheckCircle2, Loader2, ArrowLeft, ArrowRight, Wifi, Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RealtimeLogViewer } from './RealtimeLogViewer';

// Note: Credentials are NOT collected from users. They are pulled from
// environment variables on the backend and stored encrypted after bootstrap.

interface DeviceDetailsStepProps {
  apiPort: string;
  ipAddress: string;
  onPrevious: () => void;
  onNext: () => void;
  deviceConnected: boolean;
  provisioningCommand: string;  // Backend-generated command with token
  isReprovisioning?: boolean;  // Router has stored credentials
  isScanningDevice: boolean;
  sessionId?: string | null;  // Provisioning session ID
  onDeviceOnline?: () => void;  // Callback when device comes online
}

export function DeviceDetailsStep({
  apiPort,
  ipAddress,
  onPrevious,
  onNext,
  deviceConnected,
  provisioningCommand,
  isReprovisioning = false,
  isScanningDevice,
  sessionId = null,
  onDeviceOnline
}: DeviceDetailsStepProps) {
  const [pingMonitoringStarted, setPingMonitoringStarted] = useState(false);
  const [pingVerified, setPingVerified] = useState(false);
  const [apiVerified, setApiVerified] = useState(false);

  // Start ping monitoring when sessionId and IP are available
  useEffect(() => {
    if (sessionId && ipAddress && !pingMonitoringStarted && !deviceConnected) {
      startPingMonitoring();
    }
  }, [sessionId, ipAddress, pingMonitoringStarted, deviceConnected]);

  // Honor agent-liveness detection from the parent. A NAT'd router can never be
  // reached by the cloud's ICMP/API ping stages, so those would otherwise spin
  // forever and keep "Continue" disabled even though the device IS online (its
  // polling agent is reporting in). When the parent marks the device connected
  // (via device-status / agent heartbeat), satisfy both stages and stop the
  // futile cloud ping monitoring so the wizard can advance.
  useEffect(() => {
    if (deviceConnected) {
      setPingVerified(true);
      setApiVerified(true);
      if (sessionId && pingMonitoringStarted) {
        apiClient
          .post(`/provisioning/bootstrap/ping/stop/${sessionId}`)
          .catch(() => {});
      }
    }
  }, [deviceConnected, sessionId, pingMonitoringStarted]);

  const startPingMonitoring = async () => {
    if (!sessionId || !ipAddress) return;

    try {
      await apiClient.post(
        `/provisioning/bootstrap/ping/start/${sessionId}`,
        null,
        {
          params: {
            ip_address: ipAddress,
            api_port: parseInt(apiPort) || 8728,
            interval_seconds: 2.0,
            max_attempts: 30,
            timeout_ms: 1000
          }
        }
      );
      setPingMonitoringStarted(true);
      console.log(`[DeviceDetailsStep] Started two-stage monitoring for session ${sessionId}`);
    } catch (error) {
      console.error('[DeviceDetailsStep] Failed to start device monitoring:', error);
      toast.error('Failed to start device monitoring');
    }
  };

  const handleStageComplete = (stage: number) => {
    if (stage === 1) {
      setPingVerified(true);
    } else if (stage === 2) {
      setApiVerified(true);
    }
  };

  const handleDeviceOnline = () => {
    setPingVerified(true);
    setApiVerified(true);

    if (onDeviceOnline) {
      onDeviceOnline();
    }

    // Stop ping monitoring when device is online
    if (sessionId) {
      apiClient.post(`/provisioning/bootstrap/ping/stop/${sessionId}`)
        .catch(err => console.error('Failed to stop ping monitoring:', err));
    }
  };

  const copyCommand = async () => {
    if (!provisioningCommand) {
      toast.error('Provisioning command not generated yet');
      return;
    }

    try {
      await navigator.clipboard.writeText(provisioningCommand);
      toast.success('Command copied to clipboard');
    } catch {
      toast.error('Failed to copy command');
    }
  };

  const bothStagesVerified = pingVerified && apiVerified;

  return (
    <div className="space-y-6">
      {/* Reprovisioning Status Banner */}
      {isReprovisioning && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Router Previously Provisioned</h3>
              <p className="text-sm text-green-700 mt-1">
                This router has stored API credentials. The system is automatically detecting the device connection.
                <strong> No command execution needed.</strong>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Provisioning Command Card */}
      <Card className="p-6 bg-gray-900 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">
              {isReprovisioning ? 'PROVISIONING COMMAND (For Reference)' : 'PROVISIONING COMMAND'}
            </span>
          </div>
          {!isReprovisioning && (
            <button
              onClick={copyCommand}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
            >
              Click to copy
              <Copy className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="bg-black p-4 rounded font-mono text-xs sm:text-sm overflow-x-auto">
          <pre className="text-green-400 whitespace-pre-wrap break-all">
            {provisioningCommand}
          </pre>
        </div>

        {/* Warning Notice - Only show for first-time provisioning */}
        {!isReprovisioning && (
          <div className="mt-4 flex items-start gap-3 p-4 bg-blue-900/50 border border-blue-700 rounded">
            <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-100">
              <div className="font-semibold mb-1">If this device reports "device mode not allowed"</div>
              <div className="text-blue-200">
                • First run: <code className="bg-blue-950 px-2 py-0.5 rounded text-xs">/system device-mode update mode=advanced</code>
              </div>
              <div className="text-blue-200">
                • Then unplug the power cord for 10 seconds, then restart power before retrying the provisioning command.
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Two-Stage Verification Status */}
      <Card className="p-4 bg-gray-900 text-white">
        <div className="flex items-center gap-2 mb-4 text-gray-300">
          <span className="text-green-400">$</span>
          <span className="font-semibold">Device Connection Status</span>
        </div>

        {/* Stage Indicators */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Stage 1: Network Reachability */}
          <div className={`p-3 rounded-lg border ${pingVerified ? 'bg-green-900/30 border-green-700' : 'bg-gray-800 border-gray-700'}`}>
            <div className="flex items-center gap-2 mb-1">
              {pingVerified ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <Wifi className="h-4 w-4 text-gray-400 animate-pulse" />
              )}
              <span className={`text-sm font-medium ${pingVerified ? 'text-green-400' : 'text-gray-400'}`}>
                Stage 1: Network
              </span>
            </div>
            <p className="text-xs text-gray-400 ml-6">
              {pingVerified ? 'Device reachable' : 'Checking ICMP ping...'}
            </p>
          </div>

          {/* Stage 2: API Port */}
          <div className={`p-3 rounded-lg border ${apiVerified ? 'bg-green-900/30 border-green-700' : pingVerified ? 'bg-yellow-900/30 border-yellow-700' : 'bg-gray-800 border-gray-700'}`}>
            <div className="flex items-center gap-2 mb-1">
              {apiVerified ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : pingVerified ? (
                <Server className="h-4 w-4 text-yellow-400 animate-pulse" />
              ) : (
                <Server className="h-4 w-4 text-gray-500" />
              )}
              <span className={`text-sm font-medium ${apiVerified ? 'text-green-400' : pingVerified ? 'text-yellow-400' : 'text-gray-500'}`}>
                Stage 2: API Port
              </span>
            </div>
            <p className="text-xs text-gray-400 ml-6">
              {apiVerified ? `Port ${apiPort} enabled` : pingVerified ? 'Waiting for bootstrap command...' : 'Pending network check'}
            </p>
          </div>
        </div>

        {bothStagesVerified ? (
          /* Success State */
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Device Connected Successfully!</span>
            </div>
            <p className="text-gray-300 ml-7">Your device is online and API is enabled - ready for configuration</p>

            {/* Continue Button - Green when device is connected */}
            <div className="flex justify-end mt-4">
              <Button
                onClick={onNext}
                disabled={isScanningDevice}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isScanningDevice ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning Device...
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Waiting State - Use RealtimeLogViewer for status */
          <RealtimeLogViewer
            sessionId={sessionId}
            title=""
            subtitle=""
            autoConnect={!!sessionId}
            showConnectionStatus={true}
            height="h-32"
            onDeviceOnline={handleDeviceOnline}
            onStageComplete={handleStageComplete}
            initialMessage={isReprovisioning ? 'Auto-detecting device using stored credentials...' : 'Waiting for command execution...'}
            deviceConnected={bothStagesVerified}
            pingVerified={pingVerified}
            apiVerified={apiVerified}
          />
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous Step
        </Button>

        {/* Continue button - only show when device is NOT connected (hidden when connected as it's in the card above) */}
        {!bothStagesVerified && (
          <Button
            onClick={onNext}
            disabled={!bothStagesVerified || isScanningDevice}
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isScanningDevice ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning Device...
              </>
            ) : (
              <>
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
