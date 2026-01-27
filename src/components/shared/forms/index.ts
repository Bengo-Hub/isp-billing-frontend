/**
 * Shared Form Components
 * 
 * A collection of reusable form components for consistent UI across the application.
 * These components handle common patterns like labels, icons, errors, and validation.
 * 
 * @example
 * ```tsx
 * import { TextField, PasswordField, SelectField, FormDialog } from '@/components/shared/forms';
 * 
 * function MyForm() {
 *   return (
 *     <FormDialog title="Create User" open={open} onOpenChange={setOpen}>
 *       <TextField label="Username" name="username" required />
 *       <PasswordField label="Password" name="password" required showStrength />
 *       <SelectField 
 *         label="Role" 
 *         options={[
 *           { value: 'admin', label: 'Admin' },
 *           { value: 'user', label: 'User' },
 *         ]} 
 *       />
 *     </FormDialog>
 *   );
 * }
 * ```
 */

// Form Field Components
export { TextField, type TextFieldProps } from './TextField';
export { PasswordField, type PasswordFieldProps } from './PasswordField';
export { SelectField, type SelectFieldProps, type SelectOption } from './SelectField';
export { TextareaField, type TextareaFieldProps } from './TextareaField';
export { CheckboxField, type CheckboxFieldProps } from './CheckboxField';
export { DateTimeField, type DateTimeFieldProps } from './DateTimeField';
export { PhoneField, type PhoneFieldProps } from './PhoneField';

// Form Layout Components
export { FormSection, type FormSectionProps } from './FormSection';
export { FormActions, type FormActionsProps } from './FormActions';

// Dialog Components
export { FormDialog, type FormDialogProps } from './FormDialog';
