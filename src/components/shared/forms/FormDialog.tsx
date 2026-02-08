'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormActions } from './FormActions';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface FormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Handler for open state change */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description?: string;
  /** Icon to show next to title */
  icon?: LucideIcon;
  /** Icon color class */
  iconColor?: string;
  /** Form content */
  children: React.ReactNode;
  /** Form submit handler */
  onSubmit?: (e: React.FormEvent) => void;
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Whether submit is disabled */
  submitDisabled?: boolean;
  /** Maximum width class */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Form id for external submit button */
  formId?: string;
  /** Hide footer */
  hideFooter?: boolean;
  /** Custom footer content */
  footer?: React.ReactNode;
  /** Container className */
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

/**
 * Reusable form dialog component with consistent styling.
 * Handles form submission, loading states, and cancel actions.
 * 
 * @example
 * ```tsx
 * <FormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Create User"
 *   description="Add a new user to the system"
 *   onSubmit={handleSubmit}
 *   isSubmitting={mutation.isPending}
 * >
 *   <TextField label="Name" name="name" required />
 *   <TextField label="Email" name="email" type="email" required />
 * </FormDialog>
 * ```
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconColor = 'text-brand-600',
  children,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  isSubmitting = false,
  submitDisabled = false,
  maxWidth = '4xl',
  formId,
  hideFooter = false,
  footer,
  className,
}: FormDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent
        className={cn(
          maxWidthClasses[maxWidth],
          'max-h-[90vh] overflow-y-auto',
          className
        )}
        onInteractOutside={(e) => {
          if (isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {Icon && <Icon className={cn('h-5 w-5', iconColor)} />}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="space-y-6">
          {children}

          {!hideFooter && (
            <DialogFooter>
              {footer || (
                <FormActions
                  submitText={submitText}
                  cancelText={cancelText}
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                  disabled={submitDisabled}
                />
              )}
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default FormDialog;
