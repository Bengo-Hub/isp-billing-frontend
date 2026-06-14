'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  Wifi,
  Network,
  Shield,
  Server,
  Loader2,
  CheckCircle2,
  Cpu,
  HardDrive,
  Clock,
  Zap,
  Copy,
  Terminal
} from 'lucide-react';
import { toast } from 'sonner';
import { RealtimeLogViewer, LogEntry } from './RealtimeLogViewer';

interface ServiceSetupStepProps {
  enableHotspot: boolean;
  enablePppoe: boolean;
  enableAntiSharing: boolean;
  useCustomSubnet: boolean;
  subnetAddress: string;
  cidr: string;
  ethernetPorts: string[];
  availablePorts: string[];
  deviceInfo: any;
  onEnableHotspotChange: (enabled: boolean) => void;
  onEnablePppoeChange: (enabled: boolean) => void;
  onEnableAntiSharingChange: (enabled: boolean) => void;
  onUseCustomSubnetChange: (enabled: boolean) => void;
  onSubnetAddressChange: (address: string) => void;
  onCidrChange: (cidr: string) => void;
  onEthernetPortsChange: (ports: string[]) => void;
  onPrevious: () => void;
  onNext: () => void;
  isStarting: boolean;
  networkConfig: {
    network: string;
    gateway: string;
    dhcpPool: string;
  };
  sessionId?: string | null;
  progressPercentage?: number;
  currentOperation?: string;
  onProvisioningComplete?: (logs: LogEntry[]) => void;
  onProgressUpdate?: (percentage: number, operation: string) => void;
  scriptBasedProvisioning?: boolean;
  provisioningScriptCommand?: string;
}

export function ServiceSetupStep({
  enableHotspot,
  enablePppoe,
  enableAntiSharing,
  useCustomSubnet,
  subnetAddress,
  cidr,
  ethernetPorts,
  availablePorts,
  deviceInfo,
  onEnableHotspotChange,
  onEnablePppoeChange,
  onEnableAntiSharingChange,
  onUseCustomSubnetChange,
  onSubnetAddressChange,
  onCidrChange,
  onEthernetPortsChange,
  onPrevious,
  onNext,
  isStarting,
  networkConfig,
  sessionId = null,
  progressPercentage = 0,
  currentOperation = '',
  onProvisioningComplete,
  onProgressUpdate,
  scriptBasedProvisioning = false,
  provisioningScriptCommand = ''
}: ServiceSetupStepProps) {

  const toggleEthernetPort = (port: string) => {
    const newPorts = ethernetPorts.includes(port)
      ? ethernetPorts.filter(p => p !== port)
      : [...ethernetPorts, port];
    onEthernetPortsChange(newPorts);
  };

  // Get system info from device scan
  const systemInfo = deviceInfo?.system_info || {};
  const networkConfigFromScan = deviceInfo?.network_config;
  const wanInterface = deviceInfo?.wan_interface || 'ether1';
  const isScanning = availablePorts.length === 0;

  // Use network config from scan if available, otherwise use calculated
  const displayNetworkConfig = networkConfigFromScan ? {
    network: networkConfigFromScan.network,
    gateway: networkConfigFromScan.gateway,
    dhcpPool: networkConfigFromScan.dhcp_pool
  } : networkConfig;

  // Get services from scan
  const scannedServices = deviceInfo?.services || [];
  const hotspotService = Array.isArray(scannedServices)
    ? scannedServices.find?.((s: any) => s.name === 'hotspot')
    : null;
  const pppoeService = Array.isArray(scannedServices)
    ? scannedServices.find?.((s: any) => s.name === 'pppoe')
    : null;

  return (
    <div className="space-y-4">
      {/* Device Info Banner - Compact and Modern */}
      {systemInfo && (systemInfo.identity || systemInfo.board_name) && (
        <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">
                  {systemInfo.identity || systemInfo.board_name || 'MikroTik Router'}
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  {systemInfo.version && <span>RouterOS {systemInfo.version}</span>}
                  {systemInfo.architecture && <span className="text-slate-400">•</span>}
                  {systemInfo.architecture && <span>{systemInfo.architecture}</span>}
                </div>
              </div>
            </div>

            {/* System Stats */}
            <div className="hidden md:flex items-center gap-4 text-xs">
              {systemInfo.cpu_load && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>{systemInfo.cpu_load}</span>
                </div>
              )}
              {systemInfo.free_memory && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <HardDrive className="h-3.5 w-3.5" />
                  <span>{systemInfo.free_memory}</span>
                </div>
              )}
              {systemInfo.uptime && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{systemInfo.uptime}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Connected</span>
              </div>
            </div>

            {/* Mobile Connected Badge */}
            <div className="md:hidden flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
        </div>
      )}

      {/* Scanned Interfaces Section */}
      <Card className="p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <Network className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Network Interfaces</h3>
          </div>
          {isScanning ? (
            <div className="flex items-center gap-2 text-amber-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-xs">Scanning...</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {availablePorts.length} ports
            </span>
          )}
        </div>

        {isScanning ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Discovering interfaces...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {availablePorts.map((port) => {
                const isSelected = ethernetPorts.includes(port);
                const isWanPort = port === wanInterface;

                return (
                  <button
                    key={port}
                    onClick={() => !isWanPort && toggleEthernetPort(port)}
                    disabled={isWanPort}
                    className={`
                      relative px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium
                      ${isSelected
                        ? 'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }
                      ${isWanPort ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${
                        isSelected ? 'bg-white' : isWanPort ? 'bg-amber-400' : 'bg-slate-300'
                      }`} />
                      <span>{port}</span>
                    </div>
                    {isWanPort && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-900 text-[9px] px-1 rounded font-bold">
                        WAN
                      </span>
                    )}
                    {isSelected && !isWanPort && (
                      <CheckCircle2 className="absolute -top-1.5 -right-1.5 h-4 w-4 text-blue-500 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Select ports for customer LAN bridge. <span className="text-amber-600 font-medium">WAN port ({wanInterface}) is excluded</span> to maintain internet connectivity.
            </p>
          </>
        )}
      </Card>

      {/* Network Configuration */}
      <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-emerald-100 rounded-md">
            <Wifi className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-emerald-900 text-sm">LAN Bridge Configuration</h3>
          <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
            AUTO
          </span>
        </div>

        {/* Explanation about LAN vs WAN subnet */}
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[11px] text-blue-800">
            <strong>Why a different subnet?</strong> The LAN bridge uses <span className="font-mono font-semibold">172.31.0.0/16</span> to keep
            customer traffic separate from your WAN/management network
            {deviceInfo?.network_config?.current_subnet && (
              <span className="text-blue-600"> ({deviceInfo.network_config.current_subnet})</span>
            )}. This prevents routing conflicts and ensures stable connectivity.
          </p>
        </div>

        {/* Current management network reference (if available).
            current_subnet is the router's own IP/CIDR — i.e. the LAN/management
            address you connected through (e.g. 192.168.88.0/24 on a factory
            device), NOT the WAN uplink. Label it accordingly so we don't
            mislabel the management LAN as WAN. */}
        {deviceInfo?.network_config?.current_subnet && (
          <div className="mb-3 p-2 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-400"></div>
              <span className="text-[11px] text-slate-600">
                Management (LAN):
              </span>
              <span className="font-mono text-[11px] text-slate-800 font-medium">
                {deviceInfo.network_config.current_subnet}
              </span>
            </div>
            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
              Current network
            </span>
          </div>
        )}

        {/* Auto-Calculated Network Configuration Summary Card */}
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <div className="font-semibold text-amber-900 mb-1">Auto-Calculated Network Configuration</div>
              <div className="space-y-0.5 text-amber-800">
                <div>
                  <span className="font-medium">Network:</span>{' '}
                  <span className="font-mono text-blue-600">{displayNetworkConfig.network}</span>
                </div>
                <div>
                  <span className="font-medium">Gateway:</span>{' '}
                  <span className="font-mono text-blue-600">{displayNetworkConfig.gateway}</span>
                  <span className="text-amber-600 text-xs ml-1">(auto-calculated)</span>
                </div>
                <div>
                  <span className="font-medium">DHCP Pool:</span>{' '}
                  <span className="font-mono text-blue-600">{displayNetworkConfig.dhcpPool}</span>
                  <span className="text-amber-600 text-xs ml-1">(auto-calculated)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Subnet Fields - Always visible, disabled unless checkbox is checked */}
        <div className={`grid grid-cols-2 gap-3 p-3 rounded-lg border ${useCustomSubnet ? 'bg-white/60 border-emerald-100' : 'bg-emerald-50/50 border-emerald-100/50'}`}>
          <div>
            <label className={`block text-[10px] font-medium mb-1 ${useCustomSubnet ? 'text-emerald-700' : 'text-emerald-600/70'}`}>
              Subnet Address
            </label>
            <Input
              value={subnetAddress}
              onChange={(e) => onSubnetAddressChange(e.target.value)}
              disabled={!useCustomSubnet}
              className={`font-mono text-xs h-8 ${!useCustomSubnet ? 'bg-emerald-50 text-emerald-700/70 cursor-not-allowed' : ''}`}
              placeholder="e.g., 192.168.100.0"
            />
          </div>
          <div>
            <label className={`block text-[10px] font-medium mb-1 ${useCustomSubnet ? 'text-emerald-700' : 'text-emerald-600/70'}`}>
              CIDR
            </label>
            <Select value={cidr} onValueChange={onCidrChange} disabled={!useCustomSubnet}>
              <SelectTrigger className={`font-mono text-xs h-8 ${!useCustomSubnet ? 'bg-emerald-50 text-emerald-700/70 cursor-not-allowed' : ''}`}>
                <SelectValue placeholder="Select CIDR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">/24 (254 hosts)</SelectItem>
                <SelectItem value="23">/23 (510 hosts)</SelectItem>
                <SelectItem value="22">/22 (1022 hosts)</SelectItem>
                <SelectItem value="16">/16 (65534 hosts)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Checkbox
            id="custom-subnet"
            checked={useCustomSubnet}
            onCheckedChange={onUseCustomSubnetChange}
            className="h-3.5 w-3.5"
          />
          <label htmlFor="custom-subnet" className="text-xs text-emerald-800 cursor-pointer">
            Use custom LAN subnet (advanced - only change if you know what you&apos;re doing)
          </label>
        </div>
        {useCustomSubnet && (
          <p className="text-[10px] text-amber-700 mt-1.5 pl-5">
            Make sure your custom subnet does NOT overlap with your WAN network to avoid connectivity issues.
          </p>
        )}
      </Card>

      {/* Service Types - Modern Card Selection */}
      <Card className="p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-violet-100 rounded-md">
            <Zap className="h-4 w-4 text-violet-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Services</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* PPPoE */}
          <button
            onClick={() => onEnablePppoeChange(!enablePppoe)}
            className={`p-3 rounded-xl border-2 transition-all text-left ${
              enablePppoe
                ? 'border-violet-500 bg-violet-50 shadow-md shadow-violet-500/10'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className={`p-1.5 rounded-lg ${enablePppoe ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Server className="h-4 w-4" />
              </div>
              <Checkbox
                checked={enablePppoe}
                onCheckedChange={onEnablePppoeChange}
                className="h-4 w-4"
              />
            </div>
            <div className={`font-semibold text-sm ${enablePppoe ? 'text-violet-900' : 'text-slate-700'}`}>
              PPPoE Server
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Point-to-Point Protocol
            </div>
            {pppoeService?.active && (
              <span className="inline-block mt-1.5 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                Already Active
              </span>
            )}
          </button>

          {/* Hotspot */}
          <button
            onClick={() => onEnableHotspotChange(!enableHotspot)}
            className={`p-3 rounded-xl border-2 transition-all text-left ${
              enableHotspot
                ? 'border-violet-500 bg-violet-50 shadow-md shadow-violet-500/10'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className={`p-1.5 rounded-lg ${enableHotspot ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Wifi className="h-4 w-4" />
              </div>
              <Checkbox
                checked={enableHotspot}
                onCheckedChange={onEnableHotspotChange}
                className="h-4 w-4"
              />
            </div>
            <div className={`font-semibold text-sm ${enableHotspot ? 'text-violet-900' : 'text-slate-700'}`}>
              Hotspot
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Captive portal with vouchers
            </div>
            {hotspotService?.active && (
              <span className="inline-block mt-1.5 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                Already Active
              </span>
            )}
          </button>
        </div>
      </Card>

      {/* Anti-Sharing Protection */}
      {enableHotspot && (
        <Card className={`p-3 transition-all border ${
          enableAntiSharing
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
            : 'border-slate-200'
        }`}>
          <div className="flex items-start gap-3">
            <Checkbox
              id="anti-sharing"
              checked={enableAntiSharing}
              onCheckedChange={onEnableAntiSharingChange}
              className="mt-0.5 h-4 w-4"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shield className={`h-4 w-4 ${enableAntiSharing ? 'text-amber-600' : 'text-slate-400'}`} />
                <label htmlFor="anti-sharing" className="font-semibold text-slate-800 text-sm cursor-pointer">
                  Anti-Sharing Protection
                </label>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Prevents connection sharing via TTL modification (1 user = 1 device)
              </p>
              {enableAntiSharing && (
                <div className="mt-2 p-2 bg-amber-100/60 rounded text-[10px] text-amber-800">
                  <strong>Note:</strong> Adds firewall rules to block sharing attempts.
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Validation Messages */}
      {(!enableHotspot && !enablePppoe) && (
        <p className="text-xs text-red-500 text-center bg-red-50 p-2 rounded-lg">
          Please select at least one service type
        </p>
      )}
      {ethernetPorts.length === 0 && availablePorts.length > 0 && (
        <p className="text-xs text-red-500 text-center bg-red-50 p-2 rounded-lg">
          Please select at least one ethernet port for the bridge
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <Button variant="outline" onClick={onPrevious} size="sm" className="h-9">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={isStarting || (!enableHotspot && !enablePppoe) || ethernetPorts.length === 0}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-9 px-5"
          size="sm"
        >
          {isStarting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Configuring...
            </>
          ) : (
            <>
              Configure Services <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </>
          )}
        </Button>
      </div>

      {/* Script-Based Provisioning (when backend cannot reach router directly) */}
      {scriptBasedProvisioning && provisioningScriptCommand && (
        <div className="space-y-3 mt-4">
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 text-sm">Script-Based Provisioning</h3>
                <p className="text-xs text-amber-700 mt-1">
                  The backend cannot connect to your router directly. Paste the command below in your MikroTik terminal to complete provisioning.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gray-900 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-green-400">$</span>
                <span className="font-semibold text-sm">PROVISIONING COMMAND</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(provisioningScriptCommand);
                    toast.success('Command copied to clipboard');
                  } catch {
                    toast.error('Failed to copy command');
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
              >
                Click to copy
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-black p-4 rounded font-mono text-xs sm:text-sm overflow-x-auto">
              <pre className="text-green-400 whitespace-pre-wrap break-all">
                {provisioningScriptCommand}
              </pre>
            </div>

            <div className="mt-3 p-3 bg-blue-900/50 border border-blue-700 rounded">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-xs text-blue-200">
                  <p>Open your MikroTik terminal (via Winbox, SSH, or WebFig) and paste this command. The router will download and execute the provisioning script automatically.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Live logs for script-based provisioning completion */}
          {sessionId && (
            <RealtimeLogViewer
              sessionId={sessionId}
              title="Waiting for Provisioning"
              subtitle="The router will report back when provisioning is complete"
              autoConnect={true}
              showConnectionStatus={true}
              height="h-48"
              onProvisioningComplete={onProvisioningComplete}
              onProgressUpdate={onProgressUpdate}
              initialMessage="Waiting for router to execute provisioning script..."
            />
          )}
        </div>
      )}

      {/* Progress Bar and Live Logs (direct provisioning) */}
      {isStarting && !scriptBasedProvisioning && (
        <div className="space-y-3 mt-4">
          <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-blue-900">
                {currentOperation || 'Applying configuration...'}
              </span>
              <span className="text-xs font-bold text-blue-700">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-blue-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Please do not close this window</span>
            </div>
          </Card>

          <RealtimeLogViewer
            sessionId={sessionId}
            title="Configuration Progress"
            subtitle="Real-time provisioning logs"
            autoConnect={!!sessionId}
            showConnectionStatus={true}
            height="h-48"
            onProvisioningComplete={onProvisioningComplete}
            onProgressUpdate={onProgressUpdate}
            initialMessage="Starting configuration..."
          />
        </div>
      )}
    </div>
  );
}
