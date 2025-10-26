'use client';

import { ConnectionStep } from '@/components/provisioning/ConnectionStep';
import { DeviceDetailsStep } from '@/components/provisioning/DeviceDetailsStep';
import { LiveProvisioningLog } from '@/components/provisioning/LiveProvisioningLog';
import { ProvisioningStepper } from '@/components/provisioning/ProvisioningStepper';
import { ServiceSetupStep } from '@/components/provisioning/ServiceSetupStep';
import { Card } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProvisionPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState('MikroTik4');
  const [apiPort, setApiPort] = useState('8728');
  const [interfaceName, setInterfaceName] = useState('ether1');
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  // Check if this is reprovisioning mode
  useEffect(() => {
    const reprovisionRouterId = searchParams.get('reprovision');
    if (reprovisionRouterId) {
      setFirstTimeProvisioning(false);
      setStep(1); // Start at step 1 (Device Details) for reprovisioning
      // TODO: Load existing router data for reprovisioning
    }
  }, [searchParams, setFirstTimeProvisioning]);

  // Network calculation using store configuration
  const calculatedNetworkConfig = {
    network: `${configuration.subnetAddress}/${configuration.cidr}`,
    gateway: `${configuration.subnetAddress.split('.').slice(0, 3).join('.')}.1`,
    dhcpPool: `${configuration.subnetAddress.split('.').slice(0, 3).join('.')}.2 - ${configuration.subnetAddress.split('.').slice(0, 3).join('.')}.254`
  };

  // Mock bootstrap URL
  const bootstrapUrl = '/provisioning/bootstrap/command';

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
    // Both first-time and reprovisioning need device connection check
    setIsScanningDevice(true);
    try {
      // Check device connection first
      setDeviceConnected(true); // Simulate successful connection
      
      // Create router for scanning
      const tempRouter = await createRouter({
        name: identity,
        ip_address: '192.168.88.1', // Default MikroTik IP
        api_port: parseInt(apiPort),
        username: 'admin',
        password: 'admin'
      });
      
      // Scan the device for interfaces and services
      const scannedData = await scanDevice(tempRouter.id);
      
      setAvailablePorts(scannedData.interfaces);
      setDeviceInfo(scannedData);
      setEthernetPorts(scannedData.interfaces.filter((port: string) => port !== 'ether1')); // Default selection
      setStep(3);
    } catch (error) {
      console.error('Failed to scan device:', error);
      setDeviceConnected(false);
      // Fallback to mock data if scanning fails
      const fallbackData = {
        interfaces: ['ether1', 'ether2', 'ether3', 'ether4', 'ether5', 'ether6', 'ether7', 'ether8', 'sfp1'],
        services: ['hotspot', 'pppoe'],
        current_subnet: '192.168.88.0/24',
        available_services: ['hotspot', 'pppoe']
      };
      setAvailablePorts(fallbackData.interfaces);
      setDeviceInfo(fallbackData);
      setEthernetPorts(fallbackData.interfaces.filter((port: string) => port !== 'ether1'));
      setStep(3);
    } finally {
      setIsScanningDevice(false);
    }
  };

  const handleStep3Next = async () => {
    try {
      // Create router first
      const router = await createRouter({
        name: identity,
        ip_address: '192.168.1.1', // Mock IP
        api_port: parseInt(apiPort),
        username: 'admin',
        password: 'admin'
      });

      // Start provisioning workflow
      const result = await startProvisioning({
        router_id: router.id,
        service_type: enableHotspot && enablePppoe ? 'both' : enableHotspot ? 'hotspot' : 'pppoe_server',
        configuration: {
          router_identity: identity,
          bridge_ports: ethernetPorts,
          enable_hotspot_anti_sharing: enableAntiSharing,
          custom_subnet: useCustomSubnet,
          subnet_address: subnetAddress,
          cidr: parseInt(cidr),
          enable_hotspot: enableHotspot,
          enable_pppoe: enablePppoe
        }
      });

      setSessionId(result.session_id);
      // Step 3 will show live provisioning logs
    } catch (error) {
      console.error('Failed to start provisioning:', error);
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
            onClick={() => setIsFirstTimeProvisioning(!isFirstTimeProvisioning)}
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
            onApiPortChange={setApiPort}
            onInterfaceChange={setInterfaceName}
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
              isActive={isStarting || step === 3} 
            />
          </div>
        )}
      </Card>
    </div>
  );
}