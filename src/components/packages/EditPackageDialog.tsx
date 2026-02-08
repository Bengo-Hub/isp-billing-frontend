"use client";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdatePlan, type PlanItem } from '@/features/packages/api';
import { Loader2, Package } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EditPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageData: PlanItem;
}

export default function EditPackageDialog({
  open,
  onOpenChange,
  packageData,
}: EditPackageDialogProps) {
  const updatePlan = useUpdatePlan();
  const [formData, setFormData] = useState({
    name: packageData.name,
    price: packageData.price.toString(),
    speed: packageData.speed || '',
    duration: packageData.duration || '',
    device_count: packageData.device_count?.toString() || '1',
    is_active: packageData.is_active,
  });

  useEffect(() => {
    // Update form when packageData changes
    setFormData({
      name: packageData.name,
      price: packageData.price.toString(),
      speed: packageData.speed || '',
      duration: packageData.duration || '',
      device_count: packageData.device_count?.toString() || '1',
      is_active: packageData.is_active,
    });
  }, [packageData]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const updateData = {
      planId: packageData.id,
      data: {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        speed_limit: formData.speed ? parseInt(formData.speed) : undefined,
        simultaneous_sessions: parseInt(formData.device_count) || 1,
        is_active: formData.is_active,
      },
    };

    updatePlan.mutate(updateData, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-600" />
            Edit Package
          </DialogTitle>
          <DialogDescription>
            Update package details for {packageData.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>

              <div>
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., 10Mbps Unlimited"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ({packageData.currency}) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="speed">Speed (Mbps)</Label>
                  <Input
                    id="speed"
                    value={formData.speed}
                    onChange={(e) => handleInputChange('speed', e.target.value)}
                    placeholder="10"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="1 Month"
                    className="mt-1"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Duration cannot be changed after creation
                  </p>
                </div>

                <div>
                  <Label htmlFor="device_count">Device Limit</Label>
                  <Input
                    id="device_count"
                    type="number"
                    value={formData.device_count}
                    onChange={(e) => handleInputChange('device_count', e.target.value)}
                    placeholder="1"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Status */}
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Status</h3>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Package Status</Label>
                  <p className="text-sm text-gray-600">
                    {formData.is_active
                      ? 'Package is active and available for purchase'
                      : 'Package is inactive and hidden from customers'}
                  </p>
                </div>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleInputChange('is_active', true)}
                    className={`px-4 py-2 text-sm font-medium ${
                      formData.is_active
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('is_active', false)}
                    className={`px-4 py-2 text-sm font-medium ${
                      !formData.is_active
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updatePlan.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updatePlan.isPending}
            className="bg-brand-600 hover:bg-brand-700"
          >
            {updatePlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
