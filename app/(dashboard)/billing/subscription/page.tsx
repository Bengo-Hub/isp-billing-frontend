'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Calendar, CreditCard, Download } from 'lucide-react';
import { useState } from 'react';

export default function BillingSubscriptionPage() {
  const [subscription] = useState({
    plan: 'Professional',
    status: 'active',
    expiresAt: '2025-11-10T13:41:00Z',
    amount: 500,
    currency: 'KES',
    nextBillingDate: '2025-12-10T13:41:00Z'
  });

  const [payments] = useState([
    {
      id: 'INV-codevertexitsolutions-20251010',
      amount: 500,
      currency: 'KES',
      date: '2025-10-06T22:11:00Z',
      status: 'completed',
      message: 'The service request is processed successfully.'
    },
    {
      id: 'INV-codevertexitsolutions-20250910',
      amount: 500,
      currency: 'KES',
      date: '2025-09-05T14:24:00Z',
      status: 'completed',
      message: 'The service request is processed successfully.'
    },
    {
      id: 'INV-codevertexitsolutions-20250810',
      amount: 500,
      currency: 'KES',
      date: '2025-08-08T09:27:00Z',
      status: 'completed',
      message: 'The service request is processed successfully.'
    },
    {
      id: 'INV-codevertexitsolutions-20250710',
      amount: 500,
      currency: 'KES',
      date: '2025-07-08T15:36:00Z',
      status: 'completed',
      message: 'The service request is processed successfully.'
    },
    {
      id: 'INV-202506-0357',
      amount: 500,
      currency: 'KES',
      date: '2025-06-08T20:33:00Z',
      status: 'completed',
      message: 'The service request is processed successfully.'
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-8 w-8 text-pink-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and view payment history</p>
        </div>
      </div>

      {/* Subscription Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
          {getStatusBadge(subscription.status)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Plan</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{subscription.plan}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Expires</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(subscription.expiresAt)}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard className="h-4 w-4" />
              <span>Next Billing</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(subscription.nextBillingDate)}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Your subscription expires on {formatDate(subscription.expiresAt)}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Please renew your subscription before it expires to avoid service interruption.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Button className="bg-pink-600 hover:bg-pink-700">
            <CreditCard className="h-4 w-4 mr-2" />
            View Invoice & Payment Details
          </Button>
          <Button variant="outline">
            Upgrade Plan
          </Button>
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Amount
                  <span className="ml-1 text-gray-400">↓</span>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Message
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Payment Date
                  <span className="ml-1 text-gray-400">↓</span>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Invoice
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                      {getStatusBadge(payment.status)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {payment.message}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {formatDate(payment.date)}
                  </td>
                  <td className="py-4 px-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                      {payment.id}
                    </code>
                  </td>
                  <td className="py-4 px-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing 1 to {payments.length} of {payments.length} results
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Per page</span>
            <select className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Billing Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <CreditCard className="h-8 w-8 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">M-Pesa</p>
                <p className="text-sm text-gray-600">Paybill: 123456</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Billing Address</h3>
            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="text-gray-900">CodeVertex IT Solutions</p>
              <p className="text-gray-600">Nairobi, Kenya</p>
              <p className="text-gray-600">titusowuor30@gmail.com</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
