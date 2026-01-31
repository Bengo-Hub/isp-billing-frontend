import { create } from 'zustand';
import { apiClient } from '@/lib/api';

export interface ProvisioningSession {
  id: string;
  session_id?: string;  // Backend returns session_id, frontend uses id
  router_id: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'started';
  progress_percentage: number;
  current_step: string;
  current_operation?: string;
  error_message?: string;
  message?: string;  // Backend includes message field
  created_at: string;
  updated_at: string;
}

// Note: Credentials are NOT stored in frontend - they are managed by backend
// and pulled from environment variables (MIKROTIK_API_USERNAME, MIKROTIK_API_PASSWORD)
export interface RouterInfo {
  id: number;
  name: string;
  ip_address: string;
  api_port: number;
  status: string;
  identity?: string;
  provisioning_status?: string;
  bootstrap_completed?: boolean;
}

export interface ServiceStatus {
  name: string;
  active: boolean;
  available: boolean;
}

export interface NetworkConfig {
  current_subnet: string;
  network: string;
  gateway: string;
  dhcp_start: string;
  dhcp_end: string;
  dhcp_pool: string;
  subnet_mask: string;
  cidr: number;
}

export interface SystemInfo {
  identity: string;
  board_name: string;
  model: string;
  version: string;
  architecture: string;
  cpu_count?: number;
  cpu_load?: string;
  total_memory?: string;
  free_memory?: string;
  uptime?: string;
  time: string;
  timezone: string;
}

export interface DeviceScanResult {
  interfaces: string[];
  wan_interface?: string;
  services: ServiceStatus[];
  network_config?: NetworkConfig;
  system_info: SystemInfo | Record<string, any>;
  // Legacy fields for backward compatibility
  current_subnet: string;
  available_services: string[];
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

// API response wrapper type
interface ApiDataResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
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
    network: '',
    gateway: '',
    dhcpPool: '',
  },
  configuration: {
    enableHotspot: true,
    enablePppoe: true,
    enableAntiSharing: true,
    useCustomSubnet: false,  // Default: use auto-calculated from scan
    subnetAddress: '',  // Auto-populated from device scan
    cidr: '',  // Auto-populated from device scan
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
    const response = await apiClient.get<ApiDataResponse<{ command: string }>>(
      `/provisioning/bootstrap/command?identity=${encodeURIComponent(identity)}&api_port=${apiPort}&interface=${encodeURIComponent(networkInterface)}`
    );
    return response.data.data.command;
  },

  scanDevice: async (routerId: number): Promise<DeviceScanResult> => {
    const response = await apiClient.post<ApiDataResponse<DeviceScanResult>>(
      '/provisioning/device/scan',
      { router_id: routerId }
    );
    // Handle both wrapped {data: ...} and direct response formats
    const responseData = response.data;
    return responseData.data || responseData as unknown as DeviceScanResult;
  },

  startProvisioning: async (routerId: number, configuration: any): Promise<ProvisioningSession> => {
    const response = await apiClient.post<ApiDataResponse<ProvisioningSession>>(
      '/provisioning/workflow',
      {
        router_id: routerId,
        service_type: configuration.enableHotspot && configuration.enablePppoe ? 'both' : configuration.enableHotspot ? 'hotspot' : 'pppoe_server',
        configuration: {
          router_identity: configuration.identity,
          bridge_ports: configuration.selectedPorts,
          // CRITICAL: Include WAN interface to prevent it from being bridged
          // This is a safety measure - backend also validates to prevent network lockout
          wan_interface: configuration.wanInterface || 'ether1',
          enable_hotspot_anti_sharing: configuration.enableAntiSharing,
          custom_subnet: configuration.useCustomSubnet,
          subnet_address: configuration.subnetAddress,
          cidr: parseInt(configuration.cidr),
          enable_hotspot: configuration.enableHotspot,
          enable_pppoe: configuration.enablePppoe
        }
      }
    );
    const responseData = response.data;
    const session = responseData.data || responseData as unknown as ProvisioningSession;
    // Normalize: backend returns session_id, frontend uses id
    if (!session.id && session.session_id) {
      session.id = session.session_id;
    }
    return session;
  },

  getProvisioningStatus: async (sessionId: string): Promise<ProvisioningSession> => {
    const response = await apiClient.get<ApiDataResponse<ProvisioningSession>>(
      `/provisioning/sessions/${sessionId}/status`
    );
    const responseData = response.data;
    return responseData.data || responseData as unknown as ProvisioningSession;
  },

  cancelProvisioning: async (sessionId: string) => {
    const response = await apiClient.post(`/provisioning/sessions/${sessionId}/cancel`);
    return response.data;
  },

  retryProvisioning: async (sessionId: string) => {
    const response = await apiClient.post(`/provisioning/sessions/${sessionId}/retry`);
    return response.data;
  },

  rollbackProvisioning: async (sessionId: string) => {
    const response = await apiClient.post(`/provisioning/sessions/${sessionId}/rollback`);
    return response.data;
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
    networkConfig: {
      network: '',
      gateway: '',
      dhcpPool: '',
    },
    configuration: {
      enableHotspot: true,
      enablePppoe: true,
      enableAntiSharing: true,
      useCustomSubnet: false,  // Default: use auto-calculated from scan
      subnetAddress: '',  // Auto-populated from device scan
      cidr: '',  // Auto-populated from device scan
    },
  }),
}));
