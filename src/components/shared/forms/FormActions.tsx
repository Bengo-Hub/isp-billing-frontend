'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormActionsProps {
  /** Text for the submit button */
  submitText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Handler for cancel action */
  onCancel?: () => void;
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Whether the submit button should be disabled */
  disabled?: boolean;
  /** Additional actions to render between cancel and submit */
  children?: React.ReactNode;
  /** Alignment of the buttons */
  align?: 'left' | 'center' | 'right' | 'between';
  /** Container className */
  className?: string;
  /** Hide cancel button */
  hideCancel?: boolean;
}

/**
 * Reusable form actions component with cancel and submit buttons.
 * Handles loading state automatically.
 */
export function FormActions({
  submitText = 'Save',
  cancelText = 'Cancel',
  onCancel,
  isSubmitting = false,
  disabled = false,
  children,
  align = 'right',
  className,
  hideCancel = false,
}: FormActionsProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 pt-4',
        alignmentClasses[align],
        className
      )}
    >
      {!hideCancel && onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelText}
        </Button>
      )}
      {children}
      <Button
        type="submit"
        disabled={disabled || isSubmitting}
        className="bg-brand-600 hover:bg-brand-700"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Saving...' : submitText}
      </Button>
    </div>
  );
}

export default FormActions;
