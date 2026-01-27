'use client';

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
import { useCreatePlan } from '@/features/packages/api';
import { ArrowLeft, ArrowRight, Loader2, Package } from 'lucide-react';
import { useState } from 'react';

interface CreatePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePackageDialog({ open, onOpenChange }: CreatePackageDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const createPlan = useCreatePlan();
  const [formData, setFormData] = useState({
    // Basic Configuration
    type: '',
    name: '',
    duration: '',
    
    // Pricing & Devices
    price: '',
    deviceLimit: '1',
    speed: '',
    
    // Advanced Features
    enableBurst: false,
    enableSchedule: false,
  });

  const packageTypes = [
    { value: 'hotspot', label: 'Hotspot' },
    { value: 'pppoe', label: 'PPPoE' },
    { value: 'data', label: 'Data Plan' },
    { value: 'trial', label: 'Free Trial' }
  ];

  const durations = [
    { value: '1_hour', label: '1 Hour' },
    { value: '2_hours', label: '2 Hours' },
    { value: '7_hours', label: '7 Hours' },
    { value: '1_day', label: '1 Day' },
    { value: '6_days', label: '6 Days' },
    { value: '1_month', label: '1 Month' },
    { value: '3_months', label: '3 Months' },
    { value: '6_months', label: '6 Months' },
    { value: '1_year', label: '1 Year' }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Map form data to API format
    const durationMap: Record<string, number> = {
      '1_hour': 1,
      '2_hours': 2,
      '7_hours': 7,
      '1_day': 24,
      '6_days': 144,
      '1_month': 720,
      '3_months': 2160,
      '6_months': 4320,
      '1_year': 8760,
    };

    const billingCycleMap: Record<string, 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'> = {
      '1_hour': 'hourly',
      '2_hours': 'hourly',
      '7_hours': 'hourly',
      '1_day': 'daily',
      '6_days': 'weekly',
      '1_month': 'monthly',
      '3_months': 'monthly',
      '6_months': 'monthly',
      '1_year': 'yearly',
    };

    const planData = {
      name: formData.name,
      plan_type: formData.type as 'hotspot' | 'pppoe',
      price: parseFloat(formData.price) || 0,
      billing_cycle: billingCycleMap[formData.duration] || 'monthly',
      duration_hours: durationMap[formData.duration] || 24,
      speed_limit: formData.speed ? parseInt(formData.speed) : undefined,
      simultaneous_sessions: parseInt(formData.deviceLimit) || 1,
      is_active: true,
    };

    createPlan.mutate(planData, {
      onSuccess: () => {
        onOpenChange(false);
        setCurrentStep(1);
        setFormData({
          type: '',
          name: '',
          duration: '',
          price: '',
          deviceLimit: '1',
          speed: '',
          enableBurst: false,
          enableSchedule: false,
        });
      },
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.type && formData.name && formData.duration;
      case 2:
        return formData.price;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-pink-600" />
            Create Package
          </DialogTitle>
          <DialogDescription>
            Create a new internet package for your clients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-pink-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Configuration */}
          {currentStep === 1 && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Basic Configuration</h3>
                    <p className="text-sm text-gray-600">Define the package type and basic settings</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                      Type of package *
                    </Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">Select an option</option>
                      {packageTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Name of package *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Eg. 10Mbps Unlimited"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                      Duration *
                    </Label>
                    <select
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">Select an option</option>
                      {durations.map(duration => (
                        <option key={duration.value} value={duration.value}>
                          {duration.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Pricing & Devices */}
          {currentStep === 2 && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pricing & Devices</h3>
                    <p className="text-sm text-gray-600">Set package pricing and device limits</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                      Price of the package *
                    </Label>
                    <div className="mt-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Ksh</span>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        className="pl-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deviceLimit" className="text-sm font-medium text-gray-700">
                        Device Limit
                      </Label>
                      <Input
                        id="deviceLimit"
                        type="number"
                        placeholder="1"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="speed" className="text-sm font-medium text-gray-700">
                        Speed (Mbps)
                      </Label>
                      <Input
                        id="speed"
                        placeholder="10"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Advanced Features */}
          {currentStep === 3 && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Advanced Features</h3>
                    <p className="text-sm text-gray-600">Configure burst and scheduling features</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Enable burst for this package?</h4>
                        <p className="text-sm text-gray-600">Allow users to exceed their data limit temporarily</p>
                      </div>
                      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleInputChange('enableBurst', true)}
                          className={`px-4 py-2 text-sm font-medium ${
                            formData.enableBurst
                              ? 'bg-pink-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('enableBurst', false)}
                          className={`px-4 py-2 text-sm font-medium ${
                            !formData.enableBurst
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Enable schedule for this package?</h4>
                        <p className="text-sm text-gray-600">Enable to make this package available only during specific times</p>
                      </div>
                      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleInputChange('enableSchedule', true)}
                          className={`px-4 py-2 text-sm font-medium ${
                            formData.enableSchedule
                              ? 'bg-pink-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('enableSchedule', false)}
                          className={`px-4 py-2 text-sm font-medium ${
                            !formData.enableSchedule
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  {formData.enableSchedule && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                          Start Time
                        </Label>
                        <Input
                          id="startTime"
                          type="time"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                          End Time
                        </Label>
                        <Input
                          id="endTime"
                          type="time"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createPlan.isPending}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={!isStepValid()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isStepValid() || createPlan.isPending}>
                {createPlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
