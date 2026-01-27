'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
  networkConfig
}: ServiceSetupStepProps) {
  const toggleEthernetPort = (port: string) => {
    const newPorts = ethernetPorts.includes(port) 
      ? ethernetPorts.filter(p => p !== port)
      : [...ethernetPorts, port];
    onEthernetPortsChange(newPorts);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Service Types */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700">Service Types *</div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="pppoe" 
                checked={enablePppoe} 
                onCheckedChange={onEnablePppoeChange}
              />
              <label htmlFor="pppoe" className="text-sm font-medium">PPPoE Server</label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="hotspot" 
                checked={enableHotspot} 
                onCheckedChange={onEnableHotspotChange}
              />
              <label htmlFor="hotspot" className="text-sm font-medium">Hotspot</label>
            </div>
          </div>
          <p className="text-xs text-gray-500">Select one or both services to configure.</p>
        </div>

        {/* Anti-Sharing */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="anti-sharing" 
              checked={enableAntiSharing} 
              onCheckedChange={onEnableAntiSharingChange}
            />
            <label htmlFor="anti-sharing" className="text-sm font-medium">Enable Hotspot Anti-Sharing Protection</label>
          </div>
          <p className="text-sm text-gray-600">Prevents users from sharing their hotspot connection with multiple devices. This feature modifies the TTL (Time To Live) value to detect and block connection sharing attempts, ensuring one user = one connection.</p>
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
            <p className="text-sm text-yellow-800">This will add firewall mangle rules to enforce single-device usage per hotspot account.</p>
          </div>
        </div>

        {/* Custom Subnet */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="custom-subnet" 
              checked={useCustomSubnet} 
              onCheckedChange={onUseCustomSubnetChange}
            />
            <label htmlFor="custom-subnet" className="text-sm font-medium">Use Custom Subnet Configuration</label>
          </div>
          <p className="text-sm text-gray-600">Configure a custom IP subnet for your network. Default is 172.31.0.0/16.</p>
          
          {useCustomSubnet && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subnet Address</label>
                <Input value={subnetAddress} onChange={(e) => onSubnetAddressChange(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subnet Mask (CIDR)</label>
                <Select value={cidr} onValueChange={onCidrChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">/24 - 254 hosts</SelectItem>
                    <SelectItem value="16">/16 - 65534 hosts</SelectItem>
                    <SelectItem value="8">/8 - 16777214 hosts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <div className="text-sm font-semibold text-blue-800 mb-2">Auto-Calculated Network Configuration</div>
            <div className="space-y-1 text-sm text-blue-700">
              <div>Network: {networkConfig.network}</div>
              <div>Gateway: {networkConfig.gateway} (auto-calculated)</div>
              <div>DHCP Pool: {networkConfig.dhcpPool} (auto-calculated)</div>
            </div>
          </div>
        </div>

        {/* Ethernet Ports */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700">Ethernet Ports *</div>
          {availablePorts.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {availablePorts.map((port) => (
                <div key={port} className="flex items-center space-x-2">
                  <Checkbox 
                    id={port}
                    checked={ethernetPorts.includes(port)}
                    onCheckedChange={() => toggleEthernetPort(port)}
                  />
                  <label htmlFor={port} className="text-sm">{port}</label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">Scanning device to discover available ports...</div>
          )}
          <p className="text-xs text-gray-500">Select the ethernet ports to add to the bridge.</p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous Step
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onNext}>
          Configure Services <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Progress indicator */}
      {isStarting && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Applying configuration...</span>
            <span className="text-sm text-gray-500">45%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
