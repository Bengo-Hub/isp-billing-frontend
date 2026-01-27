'use client';

import { ConnectionStep } from '@/components/provisioning/ConnectionStep';
import { DeviceDetailsStep } from '@/components/provisioning/DeviceDetailsStep';
import { LiveProvisioningLog } from '@/components/provisioning/LiveProvisioningLog';
import { ProvisioningStepper } from '@/components/provisioning/ProvisioningStepper';
import { ServiceSetupStep } from '@/components/provisioning/ServiceSetupStep';
import { Card } from '@/components/ui/card';
import { useCreateRouter, useRouter } from '@/features/routers/api';
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
        setStep(2); // Start at step 2 (Device Details) for reprovisioning - skip first-time setup
      }
    }
  }, [searchParams, setFirstTimeProvisioning]);

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

  // Bootstrap URL from API
  const bootstrapUrl = `/api/v1/provisioning/bootstrap/command?identity=${encodeURIComponent(identity)}&api_port=${apiPort}&interface=${encodeURIComponent(interfaceName)}`;

  const handleStep1Next = async () => {
    if (isFirstTimeProvisioning) {
      // First-time provisioning: Generate command
      setGeneratingCommand(true);
      try {
        // Simulate command generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStep(2);
      } finally {
        setGeneratingCommand(false);
      }
    } else {
      // Reprovisioning: Skip to step 2
      setStep(2);
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
        {step === 1 && isFirstTimeProvisioning && (
          <ConnectionStep
            identity={identity}
            onIdentityChange={setIdentity}
            onNext={handleStep1Next}
            isGeneratingCommand={isGeneratingCommand}
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
            bootstrapUrl={bootstrapUrl}
            isFirstTimeProvisioning={isFirstTimeProvisioning}
            isScanningDevice={isScanningDevice}
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
