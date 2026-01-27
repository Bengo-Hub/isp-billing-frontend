import { create } from 'zustand';
import { useApiStore } from './api';

export interface ProvisioningSession {
  id: string;
  router_id: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress_percentage: number;
  current_step: string;
  current_operation?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface RouterInfo {
  id: number;
  name: string;
  ip_address: string;
  api_port: number;
  username: string;
  status: string;
  identity?: string;
}

export interface DeviceScanResult {
  interfaces: string[];
  services: string[];
  current_subnet: string;
  available_services: string[];
  system_info: Record<string, any>;
}

export interface ProvisioningState {
  currentSession: ProvisioningSession | null;
  isFirstTimeProvisioning: boolean;
  deviceConnected: boolean;
  isGeneratingCommand: boolean;
  isScanningDevice: boolean;
  deviceInfo: DeviceScanResult | null;
  availablePorts: string[];
  selectedPorts: string[];
  networkConfig: {
    network: string;
    gateway: string;
    dhcpPool: string;
  };
  configuration: {
    enableHotspot: boolean;
    enablePppoe: boolean;
    enableAntiSharing: boolean;
    useCustomSubnet: boolean;
    subnetAddress: string;
    cidr: string;
  };
  
  // Actions
  setFirstTimeProvisioning: (value: boolean) => void;
  setDeviceConnected: (value: boolean) => void;
  setGeneratingCommand: (value: boolean) => void;
  setScanningDevice: (value: boolean) => void;
  setDeviceInfo: (info: DeviceScanResult | null) => void;
  setAvailablePorts: (ports: string[]) => void;
  setSelectedPorts: (ports: string[]) => void;
  setNetworkConfig: (config: { network: string; gateway: string; dhcpPool: string }) => void;
  updateConfiguration: (config: Partial<ProvisioningState['configuration']>) => void;
  
  // API Actions
  generateProvisioningCommand: (routerId: number, identity: string, apiPort: number, networkInterface: string) => Promise<string>;
  scanDevice: (routerId: number) => Promise<DeviceScanResult>;
  startProvisioning: (routerId: number, configuration: any) => Promise<ProvisioningSession>;
  getProvisioningStatus: (sessionId: string) => Promise<ProvisioningSession>;
  cancelProvisioning: (sessionId: string) => Promise<any>;
  retryProvisioning: (sessionId: string) => Promise<any>;
  rollbackProvisioning: (sessionId: string) => Promise<any>;
  
  // Reset
  resetProvisioning: () => void;
}

export const useProvisioningStore = create<ProvisioningState>((set, get) => ({
  currentSession: null,
  isFirstTimeProvisioning: true,
  deviceConnected: false,
  isGeneratingCommand: false,
  isScanningDevice: false,
  deviceInfo: null,
  availablePorts: [],
  selectedPorts: [],
  networkConfig: {
    network: '172.31.0.0/16',
    gateway: '172.31.0.1',
    dhcpPool: '172.31.0.2 - 172.31.254',
  },
  configuration: {
    enableHotspot: true,
    enablePppoe: true,
    enableAntiSharing: true,
    useCustomSubnet: true,
    subnetAddress: '172.31.0.0',
    cidr: '16',
  },

  setFirstTimeProvisioning: (value) => set({ isFirstTimeProvisioning: value }),
  setDeviceConnected: (value) => set({ deviceConnected: value }),
  setGeneratingCommand: (value) => set({ isGeneratingCommand: value }),
  setScanningDevice: (value) => set({ isScanningDevice: value }),
  setDeviceInfo: (info) => set({ deviceInfo: info }),
  setAvailablePorts: (ports) => set({ availablePorts: ports }),
  setSelectedPorts: (ports) => set({ selectedPorts: ports }),
  setNetworkConfig: (config) => set({ networkConfig: config }),
  
  updateConfiguration: (config) => 
    set((state) => ({
      configuration: { ...state.configuration, ...config }
    })),

  generateProvisioningCommand: async (routerId: number, identity: string, apiPort: number, networkInterface: string) => {
    const api = useApiStore.getState();
    const response = await api.makeRequest<{command: string}>(`/provisioning/bootstrap/command?identity=${identity}&api_port=${apiPort}&interface=${networkInterface}`, {
      method: 'GET',
    });
    return response.command;
  },

  scanDevice: async (routerId: number): Promise<DeviceScanResult> => {
    const api = useApiStore.getState();
    const response = await api.makeRequest<DeviceScanResult>(`/provisioning/device/scan`, {
      method: 'POST',
      data: { router_id: routerId },
    });
    return response;
  },

  startProvisioning: async (routerId: number, configuration: any): Promise<ProvisioningSession> => {
    const api = useApiStore.getState();
    const response = await api.makeRequest<ProvisioningSession>(`/provisioning/workflow`, {
      method: 'POST',
      data: {
        router_id: routerId,
        service_type: configuration.enableHotspot && configuration.enablePppoe ? 'both' : configuration.enableHotspot ? 'hotspot' : 'pppoe_server',
        configuration: {
          router_identity: configuration.identity,
          bridge_ports: configuration.selectedPorts,
          enable_hotspot_anti_sharing: configuration.enableAntiSharing,
          custom_subnet: configuration.useCustomSubnet,
          subnet_address: configuration.subnetAddress,
          cidr: parseInt(configuration.cidr),
          enable_hotspot: configuration.enableHotspot,
          enable_pppoe: configuration.enablePppoe
        }
      },
    });
    return response;
  },

  getProvisioningStatus: async (sessionId: string): Promise<ProvisioningSession> => {
    const api = useApiStore.getState();
    const response = await api.makeRequest<ProvisioningSession>(`/provisioning/sessions/${sessionId}/status`);
    return response;
  },

  cancelProvisioning: async (sessionId: string) => {
    const api = useApiStore.getState();
    const response = await api.makeRequest(`/provisioning/sessions/${sessionId}/cancel`, {
      method: 'POST',
    });
    return response;
  },

  retryProvisioning: async (sessionId: string) => {
    const api = useApiStore.getState();
    const response = await api.makeRequest(`/provisioning/sessions/${sessionId}/retry`, {
      method: 'POST',
    });
    return response;
  },

  rollbackProvisioning: async (sessionId: string) => {
    const api = useApiStore.getState();
    const response = await api.makeRequest(`/provisioning/sessions/${sessionId}/rollback`, {
      method: 'POST',
    });
    return response;
  },

  resetProvisioning: () => set({
    currentSession: null,
    isFirstTimeProvisioning: true,
    deviceConnected: false,
    isGeneratingCommand: false,
    isScanningDevice: false,
    deviceInfo: null,
    availablePorts: [],
    selectedPorts: [],
    configuration: {
      enableHotspot: true,
      enablePppoe: true,
      enableAntiSharing: true,
      useCustomSubnet: true,
      subnetAddress: '172.31.0.0',
      cidr: '16',
    },
  }),
}));
