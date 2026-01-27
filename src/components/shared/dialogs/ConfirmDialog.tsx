'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle, Trash2, Info, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'default';

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Handler for open state change */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Confirm action handler */
  onConfirm: () => void | Promise<void>;
  /** Cancel action handler */
  onCancel?: () => void;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether the confirm action is in progress */
  isConfirming?: boolean;
  /** Dialog variant (affects icon and button color) */
  variant?: ConfirmDialogVariant;
  /** Whether to show the icon */
  showIcon?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-600',
    defaultConfirmText: 'Delete',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    buttonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600',
    defaultConfirmText: 'Continue',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-600',
    defaultConfirmText: 'Confirm',
  },
  default: {
    icon: HelpCircle,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    buttonClass: 'bg-pink-600 hover:bg-pink-700 focus:ring-pink-600',
    defaultConfirmText: 'Confirm',
  },
};

/**
 * Reusable confirmation dialog for destructive or important actions.
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete User"
 *   description="Are you sure you want to delete this user? This action cannot be undone."
 *   onConfirm={handleDelete}
 *   variant="danger"
 *   isConfirming={isDeleting}
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText,
  cancelText = 'Cancel',
  isConfirming = false,
  variant = 'default',
  showIcon = true,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const displayConfirmText = confirmText || config.defaultConfirmText;

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={isConfirming ? undefined : onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {showIcon && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <div className={cn('p-3 rounded-full', config.iconBg)}>
                <Icon className={cn('h-6 w-6', config.iconColor)} />
              </div>
            </div>
          )}
          <AlertDialogTitle className={showIcon ? 'text-center' : ''}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className={showIcon ? 'text-center' : ''}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={showIcon ? 'sm:justify-center' : ''}>
          <AlertDialogCancel onClick={handleCancel} disabled={isConfirming}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirming}
            className={cn(config.buttonClass)}
          >
            {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isConfirming ? 'Processing...' : displayConfirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;
