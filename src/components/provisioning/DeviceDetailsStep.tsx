'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

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
  bootstrapUrl: string;
  isFirstTimeProvisioning: boolean;
  isScanningDevice: boolean;
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
  bootstrapUrl,
  isFirstTimeProvisioning,
  isScanningDevice
}: DeviceDetailsStepProps) {
  const copyCommand = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000';
    const command = `/tool fetch mode=https url="${origin}${bootstrapUrl.replace('/provisioning/bootstrap/command','/provisioning/bootstrap/script')}" dst-path=codevertex.rsc; delay 2s; import codevertex.rsc;`;
    navigator.clipboard.writeText(command);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Router Connection Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Router IP Address *</label>
            <Input
              value={ipAddress}
              onChange={(e) => onIpAddressChange(e.target.value)}
              placeholder="192.168.88.1"
            />
            <p className="text-xs text-gray-500 mt-1">The IP address of your MikroTik router</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Port</label>
            <Input value={apiPort} onChange={(e) => onApiPortChange(e.target.value)} placeholder="8728" />
            <p className="text-xs text-gray-500 mt-1">Default: 8728 (API) or 8729 (API-SSL)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <Input
              value={routerUsername}
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <Input
              type="password"
              value={routerPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Leave empty for default"
            />
            <p className="text-xs text-gray-500 mt-1">MikroTik default has no password</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WAN Interface</label>
            <Input value={networkInterface} onChange={(e) => onInterfaceChange(e.target.value)} placeholder="ether1" />
            <p className="text-xs text-gray-500 mt-1">Interface connected to the internet</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Provisioning Command</div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-xs font-mono relative">
            <Button 
              size="sm" 
              className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700"
              onClick={copyCommand}
            >
              Click to copy
            </Button>
                  <pre>{`/tool fetch mode=https url="${typeof window !== 'undefined' ? window.location.origin : 'https://codevertex.com'}${bootstrapUrl.replace('/provisioning/bootstrap/command','/provisioning/bootstrap/script')}" dst-path=codevertex.rsc; delay 2s; import codevertex.rsc;`}</pre>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <div className="font-semibold mb-1">Notes</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>If the device reports "device mode not allowed", open the Mikrotik terminal and run <code className="bg-blue-100 px-1 rounded">/system/device-mode update mode=advanced</code>, unplug the power cord for 10 seconds, then restore power before retrying the provisioning command.</li>
                  <li>Ensure the router has internet access to fetch the script over HTTPS.</li>
                  <li>The <code className="bg-blue-100 px-1 rounded">dst-path=codevertex.rsc</code> downloads the script to the router's filesystem.</li>
                  <li>The <code className="bg-blue-100 px-1 rounded">delay 2s</code> ensures the file is fully downloaded before import.</li>
                  <li>The <code className="bg-blue-100 px-1 rounded">import codevertex.rsc</code> executes the downloaded configuration script.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Device Connection Status */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Device Connection Status</div>
          {deviceConnected ? (
            // Device connected successfully
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-semibold text-green-800">Device Connected Successfully!</div>
                <div className="text-sm text-green-700">Your device is online and ready for configuration</div>
                <div className="text-xs text-green-600">Device responded to ping (API port may be disabled)</div>
              </div>
            </div>
          ) : (
            // Waiting for connection
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="text-yellow-800">
                {isFirstTimeProvisioning 
                  ? "$ Waiting for command execution..." 
                  : "Checking device connection..."
                }
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous Step
        </Button>
        {isScanningDevice ? (
          <div className="flex items-center gap-2 text-green-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            <span className="text-sm font-medium">Scanning device ports and services...</span>
          </div>
        ) : (
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={onNext}
            disabled={isFirstTimeProvisioning && !deviceConnected}
          >
            Continue <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
