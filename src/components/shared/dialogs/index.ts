/**
 * Shared Dialog Components
 * 
 * Reusable dialog components for consistent modal patterns.
 * 
 * @example
 * ```tsx
 * import { ConfirmDialog } from '@/components/shared/dialogs';
 * 
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete Item"
 *   description="Are you sure?"
 *   onConfirm={handleDelete}
 *   variant="danger"
 * />
 * ```
 */

export { ConfirmDialog, type ConfirmDialogProps, type ConfirmDialogVariant } from './ConfirmDialog';

// Re-export FormDialog from forms for convenience
export { FormDialog, type FormDialogProps } from '../forms/FormDialog';
