'use client';

import {
    DateTimeField,
    FormDialog,
    FormSection,
    PasswordField,
    PhoneField,
    SelectField,
    TextareaField,
    TextField,
    type SelectOption,
} from '@/components/shared/forms';
import { usePlans } from '@/features/packages/api';
import { useCreateUser } from '@/features/users/api';
import { Mail, MapPin, Package, User } from 'lucide-react';
import { useState } from 'react';

interface UserFormData {
  type: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  package: string;
  expiryDate: string;
  expiryTime: string;
  phoneNumber: string;
  email: string;
  address: string;
  comment: string;
}

const initialFormData: UserFormData = {
  type: '',
  firstName: '',
  lastName: '',
  username: '',
  password: '',
  package: '',
  expiryDate: '',
  expiryTime: '',
  phoneNumber: '',
  email: '',
  address: '',
  comment: '',
};

const userTypeOptions: SelectOption[] = [
  { value: 'hotspot', label: 'Hotspot' },
  { value: 'pppoe', label: 'PPPoE' },
  { value: 'static', label: 'Static' },
];

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode - pass existing user data */
  editData?: Partial<UserFormData>;
  /** User ID for edit mode */
  userId?: number;
}

/**
 * Unified User Form Dialog
 * 
 * This component handles both Create and Edit operations for users.
 * Uses shared form components for consistent UI and reduced code duplication.
 * 
 * @example
 * ```tsx
 * // Create mode
 * <UserFormDialog open={isOpen} onOpenChange={setIsOpen} />
 * 
 * // Edit mode
 * <UserFormDialog 
 *   open={isOpen} 
 *   onOpenChange={setIsOpen}
 *   editData={existingUser}
 *   userId={123}
 * />
 * ```
 */
export default function UserFormDialog({
  open,
  onOpenChange,
  editData,
  userId,
}: UserFormProps) {
  const isEditMode = !!userId;
  
  const [formData, setFormData] = useState<UserFormData>({
    ...initialFormData,
    ...editData,
  });

  // API hooks
  const createUser = useCreateUser();
  const { data: plansData } = usePlans({ page: 1, size: 100 });
  
  // Transform plans to select options
  const packageOptions: SelectOption[] = (plansData?.items || []).map((plan) => ({
    value: plan.id.toString(),
    label: `${plan.name} - ${plan.currency} ${plan.price}`,
  }));

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      user_type: formData.type,
      first_name: formData.firstName,
      last_name: formData.lastName,
      full_name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
      username: formData.username,
      password: formData.password,
      plan_id: formData.package ? parseInt(formData.package) : undefined,
      expiry_date: formData.expiryDate && formData.expiryTime
        ? `${formData.expiryDate}T${formData.expiryTime}:00`
        : formData.expiryDate || undefined,
      phone_number: formData.phoneNumber,
      email: formData.email,
      address: formData.address,
      comment: formData.comment,
    };

    if (isEditMode) {
      // TODO: Call update mutation when available
      // await updateUser.mutateAsync({ id: userId, ...payload });
    } else {
      await createUser.mutateAsync(payload);
    }

    onOpenChange(false);
    setFormData(initialFormData);
  };

  const isSubmitting = createUser.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit User' : 'Create User'}
      description={isEditMode 
        ? 'Update the user information below.'
        : 'Create a new user by filling out the form below.'
      }
      icon={User}
      onSubmit={handleSubmit}
      submitText={isEditMode ? 'Update User' : 'Create User'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-6">
        {/* User Type Section */}
        <FormSection
          title="User Type"
          description="Select the connection type for this user"
          icon={User}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        >
          <SelectField
            label="Type"
            options={userTypeOptions}
            value={formData.type}
            onValueChange={(value) => handleInputChange('type', value)}
            placeholder="Select user type"
            required
          />
        </FormSection>

        {/* Personal Information */}
        <FormSection
          title="Personal Information"
          description="Basic user details"
          icon={User}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="First Name"
              icon={User}
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
            />
            <TextField
              label="Last Name"
              icon={User}
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Username"
              icon={User}
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              required
            />
            <PasswordField
              label="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter password"
              required={!isEditMode}
              helperText={isEditMode ? 'Leave blank to keep current password' : undefined}
              showStrength={!isEditMode}
            />
          </div>
        </FormSection>

        {/* Subscription */}
        <FormSection
          title="Subscription"
          description="Package and expiry settings"
          icon={Package}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        >
          <SelectField
            label="Package"
            options={packageOptions}
            value={formData.package}
            onValueChange={(value) => handleInputChange('package', value)}
            placeholder="Select a package"
            required
          />

          <DateTimeField
            label="Expiry Date & Time"
            dateValue={formData.expiryDate}
            timeValue={formData.expiryTime}
            onDateChange={(value) => handleInputChange('expiryDate', value)}
            onTimeChange={(value) => handleInputChange('expiryTime', value)}
            minDate={new Date().toISOString().split('T')[0]}
          />
        </FormSection>

        {/* Contact Information */}
        <FormSection
          title="Contact Information"
          description="How to reach this user"
          icon={Mail}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhoneField
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(value) => handleInputChange('phoneNumber', value)}
            />
            <TextField
              label="Email"
              icon={Mail}
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <TextField
            label="Address"
            icon={MapPin}
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter address"
          />
        </FormSection>

        {/* Additional Notes */}
        <TextareaField
          label="Comments"
          value={formData.comment}
          onChange={(e) => handleInputChange('comment', e.target.value)}
          placeholder="Add any notes or comments about this user..."
          rows={3}
          maxLength={500}
          showCount
        />
      </div>
    </FormDialog>
  );
}
