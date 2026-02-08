'use client';

import { ConnectionStep } from '@/components/provisioning/ConnectionStep';
import { DeviceDetailsStep } from '@/components/provisioning/DeviceDetailsStep';
import { ProvisioningStepper } from '@/components/provisioning/ProvisioningStepper';
import { ServiceSetupStep } from '@/components/provisioning/ServiceSetupStep';
import { Card } from '@/components/ui/card';
import { useUpsertRouter, useRouter } from '@/features/routers/api';
import { apiClient } from '@/lib/api/api-client';
import { config } from '@/lib/config';
import { useProvisioningStore } from '@/lib/store/provisioning';
import { useRouter as useNextRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { LogEntry } from '@/components/provisioning/RealtimeLogViewer';

export default function ProvisionPage() {
  const searchParams = useSearchParams();
  const navigationRouter = useNextRouter();
  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState('MikroTik1');
  const [apiPort, setApiPort] = useState('8728');
  const [interfaceName, setInterfaceName] = useState('ether1');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState(config.defaultRouterIp);
  // Note: Credentials are NOT stored in frontend state - they are pulled from
  // environment variables on the backend and stored encrypted after bootstrap.
  const [reprovisionRouterId, setReprovisionRouterId] = useState<number | null>(null);
  const [provisioningCommand, setProvisioningCommand] = useState('');
  const [bootstrapUrl, setBootstrapUrl] = useState('');
  const [canUseDirectApi, setCanUseDirectApi] = useState(false);
  const [checkingApiAccess, setCheckingApiAccess] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [provisioningLogs, setProvisioningLogs] = useState<LogEntry[]>([]);

  // Use centralized provisioning store
  const {
    isFirstTimeProvisioning,
    deviceConnected,
    isGeneratingCommand,
    isScanningDevice,
    deviceInfo,
    availablePorts,
    selectedPorts,
    networkConfig,
    configuration,
    currentSession,
    setFirstTimeProvisioning,
    setDeviceConnected,
    setGeneratingCommand,
    setScanningDevice,
    setDeviceInfo,
    setAvailablePorts,
    setSelectedPorts,
    setNetworkConfig,
    updateConfiguration,
    generateProvisioningCommand,
    scanDevice,
    startProvisioning,
    resetProvisioning
  } = useProvisioningStore();

  // Router upsert mutation (creates or updates by IP address)
  // Note: Credentials are automatically pulled from env settings on backend
  const upsertRouterMutation = useUpsertRouter();
  const upsertRouter = async (data: any) => upsertRouterMutation.mutateAsync(data);

  // Fetch existing router data for reprovisioning
  const { data: existingRouter, isLoading: isLoadingRouter } = useRouter(reprovisionRouterId || 0);

  // Check if this is reprovisioning mode
  useEffect(() => {
    const routerIdParam = searchParams.get('reprovision');
    if (routerIdParam) {
      const routerId = parseInt(routerIdParam, 10);
      if (!isNaN(routerId)) {
        setReprovisionRouterId(routerId);
        setFirstTimeProvisioning(false);
        
        // Check if router can use direct API (credentials stored)
        // But keep at step 1 to show all steps
        checkDirectApiAccess(routerId);
      }
    }
  }, [searchParams, setFirstTimeProvisioning]);

  // Check if router has stored credentials for direct API access
  const checkDirectApiAccess = async (routerId: number) => {
    setCheckingApiAccess(true);
    try {
      const response = await apiClient.get(`/provisioning/bootstrap/can-use-direct-api/${routerId}`);
      const data = response.data;
      setCanUseDirectApi(data.can_use_direct_api || false);
      
      // Stay at step 1, just store the capability info
      if (data.can_use_direct_api) {
        toast.info('Router has saved credentials - will auto-reconnect in step 2');
      } else {
        toast.info('Reprovisioning mode - bootstrap command required');
      }
    } catch (error) {
      console.error('Failed to check direct API access:', error);
    } finally {
      setCheckingApiAccess(false);
    }
  };

  // Auto-detect device online status using stored API credentials
  const startAutoDeviceDetection = async (routerId: number) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 2 seconds = 1 minute
    
    const checkInterval = setInterval(async () => {
      attempts++;
      
      try {
        // Check device status via backend API (using stored credentials)
        const response = await apiClient.get(`/provisioning/device-status/${routerId}`);
        const { online, details } = response.data;
        
        if (online) {
          clearInterval(checkInterval);
          setDeviceConnected(true);
          toast.success('Device detected online - verifying ping and API access...');
          // DO NOT auto-advance - let step 2 verify ping and API first
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          toast.error('Device not detected. Please check router is powered on and connected.');
        }
      } catch (error) {
        console.error('Device detection error:', error);
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          toast.error('Failed to detect device. Please proceed manually.');
        }
      }
    }, 2000); // Check every 2 seconds
  };

  // Load existing router data when reprovisioning
  useEffect(() => {
    if (existingRouter && reprovisionRouterId) {
      setIdentity(existingRouter.name || 'MikroTik');
      setApiPort(String(existingRouter.port || 8728));
      setIpAddress(existingRouter.ip_address || config.defaultRouterIp);
      // Note: Credentials are managed by backend - not loaded to frontend
    }
  }, [existingRouter, reprovisionRouterId]);

  // Network calculation using store configuration
  const calculatedNetworkConfig = {
    network: `${configuration.subnetAddress}/${configuration.cidr}`,
    gateway: `${configuration.subnetAddress.split('.').slice(0, 3).join('.')}.1`,
    dhcpPool: `${configuration.subnetAddress.split('.').slice(0, 3).join('.')}.2 - ${configuration.subnetAddress.split('.').slice(0, 3).join('.')}.254`
  };

  const handleStep1Next = async () => {
    // Generate provisioning command for both first-time and reprovisioning
    // For reprovisioning, it's shown for reference but not required to be run
    setGeneratingCommand(true);
    try {
      const response = await apiClient.get(
        `/provisioning/bootstrap/command?identity=${encodeURIComponent(identity)}&api_port=${apiPort}&interface=${encodeURIComponent(interfaceName)}`
      );

      const commandData = response.data;
      
      // Store the backend-generated command (includes token and correct URL)
      setProvisioningCommand(commandData.command);
      setBootstrapUrl(commandData.script_url);
      
      // Generate a temporary session ID for ping monitoring
      // This will be replaced with the actual provisioning session ID in step 3
      const tempSessionId = `ping-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      setSessionId(tempSessionId);
      
      setStep(2);
      
      if (isFirstTimeProvisioning) {
        toast.success('Provisioning command generated successfully');
      } else {
        toast.success('Ready for device detection');
        // For reprovisioning with saved credentials, start auto-detection
        if (reprovisionRouterId && canUseDirectApi) {
          startAutoDeviceDetection(reprovisionRouterId);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate provisioning command');
      return; // Don't proceed to step 2 on error
    } finally {
      setGeneratingCommand(false);
    }
  };

  const handleStep2Next = async () => {
    // Validate required fields
    if (!ipAddress) {
      toast.error('Please enter IP address');
      return;
    }

    // Both first-time and reprovisioning need device connection check
    setScanningDevice(true);
    try {
      let routerId: number;

      if (reprovisionRouterId && existingRouter) {
        // Use existing router for reprovisioning
        routerId = reprovisionRouterId;
        setDeviceConnected(true);
      } else {
        // Create or update router for first-time provisioning
        // Credentials are automatically pulled from env settings on backend
        const tempRouter = await upsertRouter({
          name: identity,
          ip_address: ipAddress,
          api_port: parseInt(apiPort),
        });
        routerId = tempRouter.id;
        setDeviceConnected(true);
      }

      // Scan the device for interfaces and services
      const scannedData = await scanDevice(routerId);

      setAvailablePorts(scannedData.interfaces);
      setDeviceInfo(scannedData);
      // Exclude the detected WAN interface from selected ports
      const wanPort = scannedData.wan_interface || 'ether1';
      setSelectedPorts(scannedData.interfaces.filter((port: string) => port !== wanPort));

      // IMPORTANT: Use a DEFAULT LAN subnet that's DIFFERENT from the WAN network
      // The scanned network (192.168.100.x) is the WAN/management network
      // The LAN bridge MUST use a different subnet to avoid routing conflicts!
      // Default: 172.31.0.0/16 (allows 65534 hosts)
      const DEFAULT_LAN_SUBNET = '172.31.0.0';
      const DEFAULT_LAN_CIDR = '16';
      const DEFAULT_LAN_GATEWAY = '172.31.0.1';
      const DEFAULT_LAN_DHCP_POOL = '172.31.0.2 - 172.31.255.254';

      updateConfiguration({
        subnetAddress: DEFAULT_LAN_SUBNET,
        cidr: DEFAULT_LAN_CIDR,
      });
      setNetworkConfig({
        network: `${DEFAULT_LAN_SUBNET}/${DEFAULT_LAN_CIDR}`,
        gateway: DEFAULT_LAN_GATEWAY,
        dhcpPool: DEFAULT_LAN_DHCP_POOL,
      });

      // Store the WAN network info for reference (shown in device info banner)
      // but don't use it for LAN configuration

      setStep(3);
      toast.success('Device scanned successfully');
    } catch (error: any) {
      console.error('Failed to scan device:', error);
      setDeviceConnected(false);

      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to connect to device';
      toast.error(`Scan failed: ${errorMessage}`);

      // Allow manual configuration if scan fails
      const fallbackInterfaces = ['ether1', 'ether2', 'ether3', 'ether4', 'ether5', 'ether6', 'ether7', 'ether8', 'sfp1'];
      setAvailablePorts(fallbackInterfaces);
      setDeviceInfo({
        interfaces: fallbackInterfaces,
        services: [{ name: 'hotspot', active: false, available: true }, { name: 'pppoe', active: false, available: true }],
        current_subnet: '',
        available_services: ['hotspot', 'pppoe'],
        system_info: { model: 'Manual Configuration', version: 'Unknown' }
      } as any);
      setSelectedPorts(fallbackInterfaces.filter((port: string) => port !== interfaceName));

      // Use default LAN subnet (same as successful scan)
      updateConfiguration({
        subnetAddress: '172.31.0.0',
        cidr: '16',
        useCustomSubnet: false,  // Use default, user can override if needed
      });
      setNetworkConfig({
        network: '172.31.0.0/16',
        gateway: '172.31.0.1',
        dhcpPool: '172.31.0.2 - 172.31.255.254',
      });

      // Still proceed to let user configure manually
      toast.warning('Using default interface list. Please configure network settings manually.');
      setStep(3);
    } finally {
      setScanningDevice(false);
    }
  };

  const handleStep3Next = async () => {
    try {
      let routerId: number;

      if (reprovisionRouterId) {
        // Use existing router for reprovisioning
        routerId = reprovisionRouterId;
      } else {
        // For first-time provisioning, router should already be created in step 2
        // If not, upsert it now (credentials pulled from env on backend)
        const router = await upsertRouter({
          name: identity,
          ip_address: ipAddress,
          api_port: parseInt(apiPort),
        });
        routerId = router.id;
      }

      toast.info('Starting provisioning workflow...');
      setIsProvisioning(true);
      setProgressPercentage(0);
      setCurrentOperation('Initializing...');

      // Start provisioning workflow
      // CRITICAL: Include wanInterface to prevent it from being bridged
      const result = await startProvisioning(routerId, {
        identity,
        selectedPorts,
        wanInterface: deviceInfo?.wan_interface || 'ether1',
        enableAntiSharing: configuration.enableAntiSharing,
        useCustomSubnet: configuration.useCustomSubnet,
        subnetAddress: configuration.subnetAddress,
        cidr: configuration.cidr,
        enableHotspot: configuration.enableHotspot,
        enablePppoe: configuration.enablePppoe
      });

      // Update session ID with the actual provisioning session
      // Note: Backend returns 'session_id', not 'id'
      const provisioningSessionId = (result as any).session_id || result.id;
      console.log('[Provisioning] Session started:', provisioningSessionId);
      setSessionId(provisioningSessionId);
      toast.success('Provisioning started');
      // ServiceSetupStep will show live provisioning logs via RealtimeLogViewer
    } catch (error: any) {
      console.error('Failed to start provisioning:', error);
      setIsProvisioning(false);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to start provisioning';
      toast.error(errorMessage);
    }
  };

  const handleProvisioningComplete = (logs: LogEntry[]) => {
    setIsProvisioning(false);
    setProgressPercentage(100);
    setCurrentOperation('Completed!');
    setProvisioningLogs(logs);
    setShowCompletionModal(true);
    toast.success('Provisioning completed successfully!');
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    resetProvisioning();
    navigationRouter.push('/routers');
  };

  const handleCopyLogs = () => {
    const logsText = provisioningLogs
      .map(log => `[${log.timestamp}] ${log.message}`)
      .join('\n');

    navigator.clipboard.writeText(logsText)
      .then(() => {
        toast.success('Logs copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy logs:', err);
        toast.error('Failed to copy logs to clipboard');
      });
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Mikrotik Device</h1>
          <p className="text-gray-600">To proceed with the onboarding, connect your Mikrotik router to enable automated provisioning and management.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Mode:</label>
          <button
            onClick={() => setFirstTimeProvisioning(!isFirstTimeProvisioning)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              isFirstTimeProvisioning
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {isFirstTimeProvisioning ? 'First Time' : 'Reprovisioning'}
          </button>
        </div>
      </div>

      {/* Device Configuration */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Configuration</h2>
        <p className="text-gray-600 mb-6">Follow these steps to connect your Mikrotik device to our billing system.</p>

        {/* Stepper */}
        <ProvisioningStepper 
          currentStep={step} 
          isFirstTimeProvisioning={isFirstTimeProvisioning}
          onStepClick={(stepNumber) => {
            // Only allow navigation to previous steps or current step
            if (stepNumber <= step) {
              setStep(stepNumber);
            }
          }}
        />

        {/* Step Content */}
        {step === 1 && (
          <ConnectionStep
            identity={identity}
            onIdentityChange={setIdentity}
            onNext={handleStep1Next}
            isGeneratingCommand={isGeneratingCommand}
            isReprovisioning={!isFirstTimeProvisioning}
          />
        )}

        {step === 2 && (
          <DeviceDetailsStep
            apiPort={apiPort}
            ipAddress={ipAddress}
            onPrevious={() => setStep(1)}
            onNext={handleStep2Next}
            deviceConnected={deviceConnected}
            provisioningCommand={provisioningCommand}
            isReprovisioning={!isFirstTimeProvisioning && canUseDirectApi}
            isScanningDevice={isScanningDevice}
            sessionId={sessionId}
            onDeviceOnline={() => setDeviceConnected(true)}
          />
        )}

        {step === 3 && (
          <ServiceSetupStep
            enableHotspot={configuration.enableHotspot}
            enablePppoe={configuration.enablePppoe}
            enableAntiSharing={configuration.enableAntiSharing}
            useCustomSubnet={configuration.useCustomSubnet}
            subnetAddress={configuration.subnetAddress}
            cidr={configuration.cidr}
            ethernetPorts={selectedPorts}
            availablePorts={availablePorts}
            deviceInfo={deviceInfo}
            onEnableHotspotChange={(value) => updateConfiguration({ enableHotspot: value })}
            onEnablePppoeChange={(value) => updateConfiguration({ enablePppoe: value })}
            onEnableAntiSharingChange={(value) => updateConfiguration({ enableAntiSharing: value })}
            onUseCustomSubnetChange={(value) => updateConfiguration({ useCustomSubnet: value })}
            onSubnetAddressChange={(value) => updateConfiguration({ subnetAddress: value })}
            onCidrChange={(value) => updateConfiguration({ cidr: value })}
            onEthernetPortsChange={setSelectedPorts}
            onPrevious={() => setStep(2)}
            onNext={handleStep3Next}
            isStarting={isProvisioning}
            networkConfig={calculatedNetworkConfig}
            sessionId={sessionId}
            progressPercentage={progressPercentage}
            currentOperation={currentOperation}
            onProvisioningComplete={handleProvisioningComplete}
            onProgressUpdate={(percentage, operation) => {
              setProgressPercentage(percentage);
              setCurrentOperation(operation);
            }}
          />
        )}
      </Card>

      {/* Provisioning Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Provisioning Complete!</h2>
                    <p className="text-sm text-gray-600 mt-1">Your MikroTik device has been configured successfully</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logs Container */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold text-gray-700">Provisioning Logs</h3>
                <span className="text-xs text-gray-500">{provisioningLogs.length} entries</span>
              </div>

              <div className="flex-1 overflow-y-auto bg-black p-4 font-mono text-xs">
                {provisioningLogs.map((log, index) => {
                  const getLogColor = (type: string) => {
                    switch (type) {
                      case 'success':
                        return 'text-green-400';
                      case 'warning':
                        return 'text-yellow-400';
                      case 'error':
                        return 'text-red-400';
                      default:
                        return 'text-green-400';
                    }
                  };

                  return (
                    <div key={index} className="mb-1">
                      <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                      <span className={getLogColor(log.type)}>
                        {log.message}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
              <p className="text-xs text-gray-600">
                You can copy these logs for your records before continuing
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLogs}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Logs
                </button>
                <button
                  onClick={handleCloseCompletionModal}
                  className="px-6 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
