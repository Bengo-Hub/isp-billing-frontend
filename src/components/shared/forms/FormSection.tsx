'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormSectionProps {
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Icon to display */
  icon?: LucideIcon;
  /** Icon background color class */
  iconBgColor?: string;
  /** Icon color class */
  iconColor?: string;
  /** Section content */
  children: React.ReactNode;
  /** Container className */
  className?: string;
  /** Whether to show a divider below */
  divider?: boolean;
}

/**
 * Reusable form section wrapper with title, description, and icon.
 * Use this to group related form fields together.
 */
export function FormSection({
  title,
  description,
  icon: Icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  children,
  className,
  divider = false,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-4', divider && 'border-b pb-6', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn('p-2 rounded-lg', iconBgColor)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default FormSection;
