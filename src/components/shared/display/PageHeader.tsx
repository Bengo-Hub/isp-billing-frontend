'use client';

import { Button } from '@/components/ui/button';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Icon to display */
  icon?: LucideIcon;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'default' | 'outline' | 'ghost';
  };
  /** Secondary actions */
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
  /** Back button handler */
  onBack?: () => void;
  /** Badge/status to show next to title */
  badge?: React.ReactNode;
  /** Additional content (e.g., tabs, filters) */
  children?: React.ReactNode;
  /** Container className */
  className?: string;
}

/**
 * Reusable page header component with title, actions, and optional back button.
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="Users"
 *   description="Manage your users and their permissions"
 *   action={{ label: "Add User", onClick: openDialog, icon: Plus }}
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  secondaryActions,
  onBack,
  badge,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {Icon && (
            <div className="p-2 bg-brand-100 rounded-lg">
              <Icon className="h-5 w-5 text-brand-600" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {badge}
            </div>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {secondaryActions?.map((secondaryAction, index) => (
            <Button
              key={index}
              variant={secondaryAction.variant || 'outline'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="h-4 w-4 mr-2" />
              )}
              {secondaryAction.label}
            </Button>
          ))}
          {action && (
            <Button
              variant={action.variant || 'default'}
              onClick={action.onClick}
              className={action.variant === 'default' || !action.variant ? 'bg-brand-600 hover:bg-brand-700' : ''}
            >
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default PageHeader;
