/**
 * Re-export provisioning store from new location
 * This file exists for backward compatibility with imports from '@/lib/store/provisioning'
 */
export { useProvisioningStore } from "../stores/provisioning";
export type {
  ProvisioningSession,
  RouterInfo,
  DeviceScanResult,
  ProvisioningState,
} from "../stores/provisioning";
