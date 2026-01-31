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
          toast.success('Device detected online - ready for configuration!');
          // Auto-advance to step 3 after brief delay
          setTimeout(() => {
            setStep(3);
          }, 1500);
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

  const handleProvisioningComplete = () => {
    setIsProvisioning(false);
    setProgressPercentage(100);
    setCurrentOperation('Completed!');
    toast.success('Provisioning completed! Redirecting to routers...');
    resetProvisioning();
    navigationRouter.push('/routers');
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
    </div>
  );
}
