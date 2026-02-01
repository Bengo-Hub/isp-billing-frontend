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
import { ArrowLeft, ArrowRight, Loader2, Package, Zap, DollarSign, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';

interface CreatePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    type?: string;
    name?: string;
    duration?: string;
    uploadSpeed?: string;
    downloadSpeed?: string;
    price?: string;
    deviceLimit?: string;
    enableBurst?: boolean;
    burstUpload?: string;
    burstDownload?: string;
    burstThreshold?: string;
    burstTime?: string;
    enableSchedule?: boolean;
    startTime?: string;
    endTime?: string;
    isActive?: boolean;
    isPopular?: boolean;
  };
}

export default function CreatePackageDialog({ open, onOpenChange, initialData }: CreatePackageDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const createPlan = useCreatePlan();
  const [formData, setFormData] = useState({
    // Basic Configuration
    type: initialData?.type || '',
    name: initialData?.name || '',
    duration: initialData?.duration || '',

    // Speed & Performance
    uploadSpeed: initialData?.uploadSpeed || '',
    downloadSpeed: initialData?.downloadSpeed || '',

    // Pricing & Devices
    price: initialData?.price || '',
    deviceLimit: initialData?.deviceLimit || '1',

    // Advanced Features - Burst
    enableBurst: initialData?.enableBurst || false,
    burstUpload: initialData?.burstUpload || '',
    burstDownload: initialData?.burstDownload || '',
    burstThreshold: initialData?.burstThreshold || '80',
    burstTime: initialData?.burstTime || '30',

    // Advanced Features - Schedule
    enableSchedule: initialData?.enableSchedule || false,
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',

    // Availability & Visibility
    isActive: initialData?.isActive ?? true,
    isPopular: initialData?.isPopular || false,
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || '',
        name: initialData.name || '',
        duration: initialData.duration || '',
        uploadSpeed: initialData.uploadSpeed || '',
        downloadSpeed: initialData.downloadSpeed || '',
        price: initialData.price || '',
        deviceLimit: initialData.deviceLimit || '1',
        enableBurst: initialData.enableBurst || false,
        burstUpload: initialData.burstUpload || '',
        burstDownload: initialData.burstDownload || '',
        burstThreshold: initialData.burstThreshold || '80',
        burstTime: initialData.burstTime || '30',
        enableSchedule: initialData.enableSchedule || false,
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        isActive: initialData.isActive ?? true,
        isPopular: initialData.isPopular || false,
      });
    }
  }, [initialData]);

  const packageTypes = [
    { value: 'HOTSPOT', label: 'Hotspot' },
    { value: 'PPPOE', label: 'PPPoE' },
    { value: 'INTERNET', label: 'Internet' },
    { value: 'BOTH', label: 'Both (Hotspot & PPPoE)' }
  ];

  const durations = [
    { value: '1', label: '1 Hour', hours: 1, cycle: 'ONE_TIME' },
    { value: '2', label: '2 Hours', hours: 2, cycle: 'ONE_TIME' },
    { value: '7', label: '7 Hours', hours: 7, cycle: 'ONE_TIME' },
    { value: '24', label: '1 Day', hours: 24, cycle: 'DAILY' },
    { value: '144', label: '6 Days', hours: 144, cycle: 'WEEKLY' },
    { value: '720', label: '1 Month', hours: 720, cycle: 'MONTHLY' },
    { value: '2160', label: '3 Months', hours: 2160, cycle: 'QUARTERLY' },
    { value: '4320', label: '6 Months', hours: 4320, cycle: 'QUARTERLY' },
    { value: '8760', label: '1 Year', hours: 8760, cycle: 'YEARLY' }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const durationData = durations.find(d => d.value === formData.duration);

    const planData = {
      name: formData.name,
      plan_type: formData.type as 'INTERNET' | 'HOTSPOT' | 'PPPOE' | 'BOTH',
      price: parseFloat(formData.price) || 0,
      currency: 'KES',
      billing_cycle: (durationData?.cycle || 'MONTHLY') as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME',
      validity_days: Math.ceil((durationData?.hours || 720) / 24),

      // Speed settings
      download_speed: parseInt(formData.downloadSpeed) || 0,
      upload_speed: parseInt(formData.uploadSpeed) || 0,

      // Limits
      data_limit: -1, // Unlimited by default
      time_limit: -1, // Unlimited by default
      concurrent_sessions: parseInt(formData.deviceLimit) || 1,

      // Burst configuration
      enable_burst: formData.enableBurst,
      burst_upload: formData.enableBurst ? parseInt(formData.burstUpload) : undefined,
      burst_download: formData.enableBurst ? parseInt(formData.burstDownload) : undefined,
      burst_threshold: formData.enableBurst ? parseInt(formData.burstThreshold) : undefined,
      burst_time: formData.enableBurst ? parseInt(formData.burstTime) : undefined,

      // Schedule configuration
      enable_schedule: formData.enableSchedule,
      schedule_start_time: formData.enableSchedule ? formData.startTime : undefined,
      schedule_end_time: formData.enableSchedule ? formData.endTime : undefined,

      // Visibility
      is_active: formData.isActive,
      is_popular: formData.isPopular,
    };

    createPlan.mutate(planData, {
      onSuccess: () => {
        onOpenChange(false);
        setCurrentStep(1);
        setFormData({
          type: '',
          name: '',
          duration: '',
          uploadSpeed: '',
          downloadSpeed: '',
          price: '',
          deviceLimit: '1',
          enableBurst: false,
          burstUpload: '',
          burstDownload: '',
          burstThreshold: '80',
          burstTime: '30',
          enableSchedule: false,
          startTime: '',
          endTime: '',
          isActive: true,
          isPopular: false,
        });
      },
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.type && formData.name && formData.duration;
      case 2:
        return formData.uploadSpeed && formData.downloadSpeed;
      case 3:
        return formData.price;
      case 4:
        return true;
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
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
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
                {step < 4 && (
                  <div
                    className={`w-12 h-1 mx-1 ${
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

          {/* Step 2: Speed & Performance */}
          {currentStep === 2 && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Speed & Performance</h3>
                    <p className="text-sm text-gray-600">Configure upload and download speeds</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="uploadSpeed" className="text-sm font-medium text-gray-700">
                      Upload Speed (Mbps) *
                    </Label>
                    <Input
                      id="uploadSpeed"
                      type="number"
                      value={formData.uploadSpeed}
                      onChange={(e) => handleInputChange('uploadSpeed', e.target.value)}
                      placeholder="10"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="downloadSpeed" className="text-sm font-medium text-gray-700">
                      Download Speed (Mbps) *
                    </Label>
                    <Input
                      id="downloadSpeed"
                      type="number"
                      value={formData.downloadSpeed}
                      onChange={(e) => handleInputChange('downloadSpeed', e.target.value)}
                      placeholder="10"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Pricing & Devices */}
          {currentStep === 3 && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
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
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        className="pl-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deviceLimit" className="text-sm font-medium text-gray-700">
                      Device Limit (Concurrent Sessions)
                    </Label>
                    <Input
                      id="deviceLimit"
                      type="number"
                      value={formData.deviceLimit}
                      onChange={(e) => handleInputChange('deviceLimit', e.target.value)}
                      placeholder="1"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Advanced Features & Visibility */}
          {currentStep === 4 && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Settings className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Advanced Features</h3>
                    <p className="text-sm text-gray-600">Configure burst, scheduling, and visibility</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Burst Configuration */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Enable burst for this package?</h4>
                        <p className="text-sm text-gray-600">Allow temporary speed boost when network is underutilized</p>
                      </div>
                      <Switch
                        checked={formData.enableBurst}
                        onCheckedChange={(checked) => handleInputChange('enableBurst', checked)}
                      />
                    </div>

                    {formData.enableBurst && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="burstUpload" className="text-sm font-medium text-gray-700">
                            Burst Upload Speed (Mbps)
                          </Label>
                          <Input
                            id="burstUpload"
                            type="number"
                            value={formData.burstUpload}
                            onChange={(e) => handleInputChange('burstUpload', e.target.value)}
                            placeholder="20"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="burstDownload" className="text-sm font-medium text-gray-700">
                            Burst Download Speed (Mbps)
                          </Label>
                          <Input
                            id="burstDownload"
                            type="number"
                            value={formData.burstDownload}
                            onChange={(e) => handleInputChange('burstDownload', e.target.value)}
                            placeholder="20"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="burstThreshold" className="text-sm font-medium text-gray-700">
                            Burst Threshold (%)
                          </Label>
                          <Input
                            id="burstThreshold"
                            type="number"
                            value={formData.burstThreshold}
                            onChange={(e) => handleInputChange('burstThreshold', e.target.value)}
                            placeholder="80"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="burstTime" className="text-sm font-medium text-gray-700">
                            Burst Time (seconds)
                          </Label>
                          <Input
                            id="burstTime"
                            type="number"
                            value={formData.burstTime}
                            onChange={(e) => handleInputChange('burstTime', e.target.value)}
                            placeholder="30"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Schedule Configuration */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Enable schedule for this package?</h4>
                        <p className="text-sm text-gray-600">Make this package available only during specific times</p>
                      </div>
                      <Switch
                        checked={formData.enableSchedule}
                        onCheckedChange={(checked) => handleInputChange('enableSchedule', checked)}
                      />
                    </div>

                    {formData.enableSchedule && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                            Start Time
                          </Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => handleInputChange('startTime', e.target.value)}
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
                            value={formData.endTime}
                            onChange={(e) => handleInputChange('endTime', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Availability & Visibility */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Availability & Visibility</h4>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium text-gray-900">Active Package</Label>
                          <p className="text-sm text-gray-600">Make this package available for purchase</p>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium text-gray-900">Popular Package</Label>
                          <p className="text-sm text-gray-600">Feature this package as popular/recommended</p>
                        </div>
                        <Switch
                          checked={formData.isPopular}
                          onCheckedChange={(checked) => handleInputChange('isPopular', checked)}
                        />
                      </div>
                    </div>
                  </div>
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
            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={!isStepValid()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isStepValid() || createPlan.isPending}>
                {createPlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Package
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
