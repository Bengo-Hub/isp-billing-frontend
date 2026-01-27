'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PlatformBillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Billing</h1>
          <p className="text-gray-600">Manage invoices and payments from ISP providers</p>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700">
          Generate Invoices
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Collected This Month</p>
              <p className="text-xl font-bold">KES 0</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Invoiced</p>
              <p className="text-xl font-bold">KES 0</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold">KES 0</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-xl font-bold">KES 0</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
        </div>
        <div className="text-center py-12 text-gray-500">
          <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No invoices generated yet</p>
          <p className="text-sm">Invoices will appear here after the billing cycle</p>
        </div>
      </Card>
    </div>
  );
}
