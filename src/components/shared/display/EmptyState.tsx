'use client';

import { LucideIcon, FileQuestion, Search, Database, AlertCircle, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EmptyStateType = 'default' | 'search' | 'no-data' | 'error' | 'folder';

export interface EmptyStateProps {
  /** Type of empty state (affects default icon) */
  type?: EmptyStateType;
  /** Custom icon */
  icon?: LucideIcon;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Additional content */
  children?: React.ReactNode;
  /** Container className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const typeIcons: Record<EmptyStateType, LucideIcon> = {
  default: FileQuestion,
  search: Search,
  'no-data': Database,
  error: AlertCircle,
  folder: FolderOpen,
};

const sizeClasses = {
  sm: {
    container: 'py-8',
    icon: 'h-10 w-10',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'h-12 w-12',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'h-16 w-16',
    title: 'text-xl',
    description: 'text-base',
  },
};

/**
 * Reusable empty state component for tables, lists, and pages.
 * Shows when there's no data to display.
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   type="search"
 *   title="No results found"
 *   description="Try adjusting your search or filter criteria"
 *   action={{ label: "Clear filters", onClick: clearFilters }}
 * />
 * ```
 */
export function EmptyState({
  type = 'default',
  icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className,
  size = 'md',
}: EmptyStateProps) {
  const Icon = icon || typeIcons[type];
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
    >
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <Icon className={cn('text-gray-400', sizes.icon)} />
      </div>
      <h3 className={cn('font-semibold text-gray-900 mb-1', sizes.title)}>
        {title}
      </h3>
      {description && (
        <p className={cn('text-gray-500 max-w-sm mb-4', sizes.description)}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button onClick={action.onClick} className="bg-brand-600 hover:bg-brand-700">
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export default EmptyState;
