'use client';

import { ConnectionStep } from '@/components/provisioning/ConnectionStep';
import { DeviceDetailsStep } from '@/components/provisioning/DeviceDetailsStep';
import { LiveProvisioningLog } from '@/components/provisioning/LiveProvisioningLog';
import { ProvisioningStepper } from '@/components/provisioning/ProvisioningStepper';
import { ServiceSetupStep } from '@/components/provisioning/ServiceSetupStep';
import { Card } from '@/components/ui/card';
import { useCreateRouter, useRouter } from '@/features/routers/api';
import { apiClient } from '@/lib/api/api-client';
import { useProvisioningStore } from '@/lib/store/provisioning';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProvisionPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState('MikroTik4');
  const [apiPort, setApiPort] = useState('8728');
  const [interfaceName, setInterfaceName] = useState('ether1');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState('192.168.88.1');
  const [routerUsername, setRouterUsername] = useState('admin');
  const [routerPassword, setRouterPassword] = useState('');
  const [reprovisionRouterId, setReprovisionRouterId] = useState<number | null>(null);
  const [provisioningCommand, setProvisioningCommand] = useState('');
  const [bootstrapUrl, setBootstrapUrl] = useState('');
  const [canUseDirectApi, setCanUseDirectApi] = useState(false);
  const [checkingApiAccess, setCheckingApiAccess] = useState(false);

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

  // Router creation mutation
  const createRouterMutation = useCreateRouter();
  const createRouter = async (data: any) => createRouterMutation.mutateAsync(data);

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
      const response = await apiClient.get(`/provisioning/can-use-direct-api/${routerId}`);
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
      setIpAddress(existingRouter.ip_address || '192.168.88.1');
      setRouterUsername(existingRouter.username || 'admin');
      // Note: We don't load password for security - user must re-enter
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
    if (!ipAddress || !routerUsername) {
      toast.error('Please enter IP address and username');
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
        // Create new router for first-time provisioning
        const tempRouter = await createRouter({
          name: identity,
          ip_address: ipAddress,
          api_port: parseInt(apiPort),
          username: routerUsername,
          password: routerPassword || 'admin' // MikroTik default
        });
        routerId = tempRouter.id;
        setDeviceConnected(true);
      }

      // Scan the device for interfaces and services
      const scannedData = await scanDevice(routerId);

      setAvailablePorts(scannedData.interfaces);
      setDeviceInfo(scannedData);
      setSelectedPorts(scannedData.interfaces.filter((port: string) => port !== interfaceName)); // Exclude WAN interface
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
        services: ['hotspot', 'pppoe'],
        current_subnet: '192.168.88.0/24',
        available_services: ['hotspot', 'pppoe'],
        system_info: { model: 'Manual Configuration', version: 'Unknown' }
      });
      setSelectedPorts(fallbackInterfaces.filter((port: string) => port !== interfaceName));

      // Still proceed to let user configure manually
      toast.warning('Using default interface list. Please verify your configuration.');
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
        // If not, create it now
        const router = await createRouter({
          name: identity,
          ip_address: ipAddress,
          api_port: parseInt(apiPort),
          username: routerUsername,
          password: routerPassword || 'admin'
        });
        routerId = router.id;
      }

      toast.info('Starting provisioning workflow...');

      // Start provisioning workflow
      const result = await startProvisioning(routerId, {
        identity,
        selectedPorts,
        enableAntiSharing: configuration.enableAntiSharing,
        useCustomSubnet: configuration.useCustomSubnet,
        subnetAddress: configuration.subnetAddress,
        cidr: configuration.cidr,
        enableHotspot: configuration.enableHotspot,
        enablePppoe: configuration.enablePppoe
      });

      // Update session ID with the actual provisioning session
      setSessionId(result.id);
      toast.success('Provisioning started');
      // Step 3 will show live provisioning logs
    } catch (error: any) {
      console.error('Failed to start provisioning:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to start provisioning';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
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
      <Card className="p-6">
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
            networkInterface={interfaceName}
            ipAddress={ipAddress}
            routerUsername={routerUsername}
            routerPassword={routerPassword}
            onApiPortChange={setApiPort}
            onInterfaceChange={setInterfaceName}
            onIpAddressChange={setIpAddress}
            onUsernameChange={setRouterUsername}
            onPasswordChange={setRouterPassword}
            onPrevious={() => setStep(isFirstTimeProvisioning ? 1 : 1)}
            onNext={handleStep2Next}
            deviceConnected={deviceConnected}
            provisioningCommand={provisioningCommand}
            isFirstTimeProvisioning={isFirstTimeProvisioning}
            isReprovisioning={!isFirstTimeProvisioning && canUseDirectApi}
            isScanningDevice={isScanningDevice}
            sessionId={sessionId}
            onDeviceOnline={() => setDeviceConnected(true)}
          />
        )}

        {step === 3 && (
          <div className="space-y-6">
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
                   isStarting={false}
                   networkConfig={calculatedNetworkConfig}
                 />

            {/* Live Configuration Log */}
            <LiveProvisioningLog 
              sessionId={sessionId} 
              isActive={isScanningDevice || step === 3} 
            />
          </div>
        )}
      </Card>
    </div>
  );
}
