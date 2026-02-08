'use client';

import { AlertCircle, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ErrorType = 'error' | 'warning' | 'network' | 'permission';

export interface ErrorStateProps {
  /** Type of error (affects icon and styling) */
  type?: ErrorType;
  /** Error title */
  title?: string;
  /** Error message/description */
  message?: string;
  /** Retry action */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Whether retry is in progress */
  isRetrying?: boolean;
  /** Additional action */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Container className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show as inline (no padding) */
  inline?: boolean;
}

const typeConfig: Record<ErrorType, { icon: typeof AlertCircle; title: string; color: string }> = {
  error: {
    icon: XCircle,
    title: 'Something went wrong',
    color: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    title: 'Warning',
    color: 'text-yellow-500',
  },
  network: {
    icon: AlertCircle,
    title: 'Network error',
    color: 'text-red-500',
  },
  permission: {
    icon: AlertCircle,
    title: 'Access denied',
    color: 'text-red-500',
  },
};

const sizeClasses = {
  sm: {
    container: 'py-6',
    icon: 'h-8 w-8',
    title: 'text-sm',
    message: 'text-xs',
  },
  md: {
    container: 'py-10',
    icon: 'h-10 w-10',
    title: 'text-base',
    message: 'text-sm',
  },
  lg: {
    container: 'py-14',
    icon: 'h-12 w-12',
    title: 'text-lg',
    message: 'text-base',
  },
};

/**
 * Reusable error state component for displaying errors in tables, pages, and components.
 * 
 * @example
 * ```tsx
 * <ErrorState
 *   type="network"
 *   message="Failed to load data. Please check your connection."
 *   onRetry={refetch}
 *   isRetrying={isLoading}
 * />
 * ```
 */
export function ErrorState({
  type = 'error',
  title,
  message,
  onRetry,
  retryText = 'Try again',
  isRetrying = false,
  action,
  className,
  size = 'md',
  inline = false,
}: ErrorStateProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        !inline && sizes.container,
        className
      )}
      role="alert"
    >
      <div className={cn('rounded-full bg-red-50 p-3 mb-3', type === 'warning' && 'bg-yellow-50')}>
        <Icon className={cn(config.color, sizes.icon)} />
      </div>
      <h3 className={cn('font-semibold text-gray-900 mb-1', sizes.title)}>
        {title || config.title}
      </h3>
      {message && (
        <p className={cn('text-gray-500 max-w-sm mb-4', sizes.message)}>
          {message}
        </p>
      )}
      {(onRetry || action) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              className="bg-brand-600 hover:bg-brand-700"
            >
              {isRetrying ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRetrying ? 'Retrying...' : retryText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ErrorState;
