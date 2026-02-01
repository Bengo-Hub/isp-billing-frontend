"use client";
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type PlanItem } from '@/features/packages/api';
import {
  Package,
  DollarSign,
  Zap,
  Clock,
  Smartphone,
  CheckCircle2,
  XCircle,
  Calendar,
  Activity,
} from 'lucide-react';

interface PackageDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageData: PlanItem;
}

export default function PackageDetailDialog({
  open,
  onOpenChange,
  packageData,
}: PackageDetailDialogProps) {
  const formatCurrency = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-pink-600" />
            Package Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about {packageData.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Name & Status */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{packageData.name}</h2>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                {packageData.plan_type} Package
              </p>
            </div>
            <Badge
              className={
                packageData.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }
            >
              {packageData.is_active ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(packageData.price, packageData.currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Speed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {packageData.speed || 'Unlimited'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {packageData.duration || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Smartphone className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Device Limit</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {packageData.device_count || '1'} {packageData.device_count === 1 ? 'Device' : 'Devices'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Features</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Burst Mode</span>
                {packageData.enable_burst ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Schedule Mode</span>
                {packageData.enable_schedule ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                )}
              </div>

              {packageData.enable_schedule && packageData.start_time && packageData.end_time && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Active Hours</span>
                  <span className="text-sm font-medium text-gray-900">
                    {packageData.start_time} - {packageData.end_time}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Package Type */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Package Type</h3>
            <Badge className="capitalize text-sm px-3 py-1">
              {packageData.plan_type}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              {packageData.plan_type === 'hotspot' &&
                'Hotspot packages are ideal for public WiFi and shared connections.'}
              {packageData.plan_type === 'pppoe' &&
                'PPPoE packages are designed for dedicated connections with stable speeds.'}
              {packageData.plan_type === 'bundle' &&
                'Bundle packages combine multiple services for comprehensive coverage.'}
            </p>
          </div>

          {/* Metadata */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Package ID:</span>
                <span className="ml-2 font-medium text-gray-900">#{packageData.id}</span>
              </div>
              <div>
                <span className="text-gray-600">Currency:</span>
                <span className="ml-2 font-medium text-gray-900">{packageData.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
