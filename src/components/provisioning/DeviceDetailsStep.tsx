'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api/api-client';
import { Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RealtimeLogViewer } from './RealtimeLogViewer';

interface DeviceDetailsStepProps {
  apiPort: string;
  networkInterface: string;
  ipAddress: string;
  routerUsername: string;
  routerPassword: string;
  onApiPortChange: (port: string) => void;
  onInterfaceChange: (networkInterface: string) => void;
  onIpAddressChange: (ip: string) => void;
  onUsernameChange: (username: string) => void;
  onPasswordChange: (password: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  deviceConnected: boolean;
  provisioningCommand: string;  // Backend-generated command with token
  isFirstTimeProvisioning: boolean;
  isReprovisioning?: boolean;  // Router has stored credentials
  isScanningDevice: boolean;
  sessionId?: string | null;  // Provisioning session ID
  onDeviceOnline?: () => void;  // Callback when device comes online
}

export function DeviceDetailsStep({
  apiPort,
  networkInterface,
  ipAddress,
  routerUsername,
  routerPassword,
  onApiPortChange,
  onInterfaceChange,
  onIpAddressChange,
  onUsernameChange,
  onPasswordChange,
  onPrevious,
  onNext,
  deviceConnected,
  provisioningCommand,
  isFirstTimeProvisioning,
  isReprovisioning = false,
  isScanningDevice,
  sessionId = null,
  onDeviceOnline
}: DeviceDetailsStepProps) {
  const [pingMonitoringStarted, setPingMonitoringStarted] = useState(false);

  // Start ping monitoring when sessionId and IP are available
  useEffect(() => {
    if (sessionId && ipAddress && !pingMonitoringStarted && !deviceConnected) {
      startPingMonitoring();
    }
  }, [sessionId, ipAddress, pingMonitoringStarted, deviceConnected]);

  const startPingMonitoring = async () => {
    if (!sessionId || !ipAddress) return;
    
    try {
      await apiClient.post(
        `/provisioning/bootstrap/ping/start/${sessionId}`,
        null,
        {
          params: {
            ip_address: ipAddress,
            interval_seconds: 2.0,
            max_attempts: 30,
            timeout_ms: 1000
          }
        }
      );
      setPingMonitoringStarted(true);
      console.log(`[DeviceDetailsStep] Started ping monitoring for session ${sessionId}`);
    } catch (error) {
      console.error('[DeviceDetailsStep] Failed to start ping monitoring:', error);
      toast.error('Failed to start device monitoring');
    }
  };

  const handleDeviceOnline = () => {
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

  return (
    <div className="space-y-6">
      {/* Reprovisioning Status Banner */}
      {isReprovisioning && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900">Router Previously Provisioned</h3>
              <p className="text-sm text-green-700 mt-1">
                This router has stored API credentials. The system is automatically detecting the device connection. 
                <strong> No command execution needed.</strong>
              </p>
              {deviceConnected && (
                <p className="text-sm font-semibold text-green-800 mt-2 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Device detected online - ready for reconfiguration!
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Provisioning Command Card - Show for reference even in reprovisioning */}
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

      {/* Live Log Stream - Reusable Component */}
      <RealtimeLogViewer
        sessionId={sessionId}
        title={deviceConnected ? 'Device Connected Successfully' : isReprovisioning ? 'Auto-detecting device...' : 'Waiting for mikrotik to come online...'}
        subtitle={isReprovisioning ? 'Device will be detected automatically using stored credentials' : 'Real-time ping monitoring active'}
        isConnected={deviceConnected}
        autoConnect={!!sessionId}
        showConnectionStatus={true}
        height="h-64"
        onDeviceOnline={handleDeviceOnline}
      />

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline"
          onClick={onPrevious}
          className="text-gray-600 border-gray-300"
        >
          ← Previous Step
        </Button>
      </div>
    </div>
  );
}
