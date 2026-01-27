'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon, Check, X, Clock, AlertTriangle, Pause, Play, Ban } from 'lucide-react';

export type StatusType = 
  | 'active' | 'inactive' 
  | 'online' | 'offline'
  | 'success' | 'error' | 'warning' | 'info'
  | 'pending' | 'completed' | 'failed' | 'cancelled'
  | 'paid' | 'unpaid' | 'overdue' | 'partial'
  | 'enabled' | 'disabled'
  | 'connected' | 'disconnected'
  | 'expired' | 'expiring'
  | 'suspended' | 'running'
  | string;

export interface StatusConfig {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  icon?: LucideIcon;
  className?: string;
}

const statusConfigs: Record<string, StatusConfig> = {
  // General statuses
  active: { label: 'Active', variant: 'success', icon: Check },
  inactive: { label: 'Inactive', variant: 'secondary', icon: X },
  
  // Connection statuses
  online: { label: 'Online', variant: 'success', icon: Check },
  offline: { label: 'Offline', variant: 'error', icon: X },
  connected: { label: 'Connected', variant: 'success', icon: Check },
  disconnected: { label: 'Disconnected', variant: 'error', icon: X },
  
  // Result statuses
  success: { label: 'Success', variant: 'success', icon: Check },
  error: { label: 'Error', variant: 'error', icon: X },
  warning: { label: 'Warning', variant: 'warning', icon: AlertTriangle },
  info: { label: 'Info', variant: 'info' },
  
  // Process statuses
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  completed: { label: 'Completed', variant: 'success', icon: Check },
  failed: { label: 'Failed', variant: 'error', icon: X },
  cancelled: { label: 'Cancelled', variant: 'secondary', icon: Ban },
  
  // Payment statuses
  paid: { label: 'Paid', variant: 'success', icon: Check },
  unpaid: { label: 'Unpaid', variant: 'error', icon: X },
  overdue: { label: 'Overdue', variant: 'error', icon: AlertTriangle },
  partial: { label: 'Partial', variant: 'warning', icon: Clock },
  
  // Toggle statuses
  enabled: { label: 'Enabled', variant: 'success', icon: Check },
  disabled: { label: 'Disabled', variant: 'secondary', icon: X },
  
  // Subscription statuses
  expired: { label: 'Expired', variant: 'error', icon: X },
  expiring: { label: 'Expiring Soon', variant: 'warning', icon: AlertTriangle },
  suspended: { label: 'Suspended', variant: 'warning', icon: Pause },
  running: { label: 'Running', variant: 'success', icon: Play },
};

const variantClasses = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  secondary: 'bg-gray-100 text-gray-600 border-gray-200',
};

export interface StatusBadgeProps {
  /** The status value */
  status: StatusType;
  /** Custom label (overrides default) */
  label?: string;
  /** Custom variant (overrides default) */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  /** Custom icon (overrides default) */
  icon?: LucideIcon;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
  /** Whether to show as a dot instead of full badge */
  dot?: boolean;
}

/**
 * Reusable status badge component with consistent styling across the application.
 * Automatically maps status strings to appropriate colors and icons.
 * 
 * @example
 * ```tsx
 * <StatusBadge status="active" />
 * <StatusBadge status="paid" showIcon />
 * <StatusBadge status="pending" size="lg" />
 * <StatusBadge status="custom" label="Custom Status" variant="info" />
 * ```
 */
export function StatusBadge({
  status,
  label,
  variant,
  icon,
  showIcon = false,
  size = 'md',
  className,
  dot = false,
}: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/[^a-z]/g, '');
  const config = statusConfigs[normalizedStatus] || {
    label: status,
    variant: 'default' as const,
  };

  const displayLabel = label || config.label;
  const displayVariant = variant || config.variant;
  const DisplayIcon = icon || config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1',
  };

  if (dot) {
    const dotColorClasses = {
      default: 'bg-gray-400',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      secondary: 'bg-gray-400',
    };

    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            dotColorClasses[displayVariant]
          )}
        />
        <span className="text-sm text-gray-700">{displayLabel}</span>
      </span>
    );
  }

  return (
    <Badge
      className={cn(
        'border font-medium inline-flex items-center gap-1',
        variantClasses[displayVariant],
        sizeClasses[size],
        className
      )}
    >
      {showIcon && DisplayIcon && (
        <DisplayIcon className={cn(
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-3.5 w-3.5',
          size === 'lg' && 'h-4 w-4',
        )} />
      )}
      {displayLabel}
    </Badge>
  );
}

export default StatusBadge;
