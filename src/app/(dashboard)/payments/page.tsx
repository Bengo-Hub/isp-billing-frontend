'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreditCard, Eye, Search } from 'lucide-react';
import { useState } from 'react';

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'checked' | 'unchecked'>('checked');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API calls
  const payments = [
    {
      id: 1,
      user: 'C658',
      phone: '0713276570',
      receipt_no: 'UARRE52KDO',
      amount: 10.00,
      checked: true,
      paid_at: '27.01.2026 16:56',
      disbursement: 'Direct',
    },
    {
      id: 2,
      user: 'C744',
      phone: '0705651499',
      receipt_no: 'UARMP53DIL',
      amount: 10.00,
      checked: true,
      paid_at: '27.01.2026 11:56',
      disbursement: 'Direct',
    },
    {
      id: 3,
      user: 'C16',
      phone: '0722986865',
      receipt_no: 'UARMO4QWCN',
      amount: 20.00,
      checked: true,
      paid_at: '27.01.2026 09:55',
      disbursement: 'Direct',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <Button 
          className="bg-pink-600 hover:bg-pink-700"
          onClick={() => setShowRecordModal(true)}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
          <div className="text-sm opacity-90 mb-2">Daily Earnings</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">Ksh 100.00</div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Total earnings today</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
          <div className="text-sm opacity-90 mb-2">Weekly Earnings</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">Ksh 200.00</div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Total earnings this week</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
          <div className="text-sm opacity-90 mb-2">Monthly Earnings</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">Ksh 3,705.00</div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Total earnings this month</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b flex items-center gap-6">
        <button
          onClick={() => setActiveTab('checked')}
          className={`pb-3 border-b-2 text-sm font-medium flex items-center gap-2 ${
            activeTab === 'checked'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Checked payments
        </button>
        <button
          onClick={() => setActiveTab('unchecked')}
          className={`pb-3 border-b-2 text-sm font-medium flex items-center gap-2 ${
            activeTab === 'unchecked'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Unchecked payments
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Payments Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Receipt No.</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Checked</th>
                <th className="pb-3 font-medium">Paid At</th>
                <th className="pb-3 font-medium">Disbursement</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="py-3 font-medium text-pink-600">{payment.user}</td>
                  <td className="py-3 text-sm">{payment.phone}</td>
                  <td className="py-3 text-sm font-mono">{payment.receipt_no}</td>
                  <td className="py-3 text-sm font-medium">Ksh {payment.amount.toFixed(2)}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                      Yes
                    </span>
                  </td>
                  <td className="py-3 text-sm">{payment.paid_at}</td>
                  <td className="py-3">
                    <span className="text-sm text-pink-600">{payment.disbursement}</span>
                  </td>
                  <td className="py-3">
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
      </Card>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Record Payment</h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User<span className="text-red-500">*</span>
                  </label>
                  <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="">Select an option</option>
                    <option value="C658">C658</option>
                    <option value="C744">C744</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select the user who made the payment</p>
                </div>

                {/* Receipt Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt Number<span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="Enter the receipt number" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount<span className="text-red-500">*</span>
                  </label>
                  <Input type="number" placeholder="Ksh" />
                  <p className="text-xs text-gray-500 mt-1">Enter the amount paid</p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm appearance-none">
                      <option value="">Select an option</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="kopo">Kopo Kopo</option>
                      <option value="mpesa">M-Pesa</option>
                    </select>
                  </div>
                  <div className="mt-2">
                    <Input placeholder="Start typing to search..." className="text-sm" />
                  </div>
                </div>
              </div>

              {/* Has this payment been checked? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Has this payment been checked?<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    className="px-4 py-2 bg-gray-100 hover:bg-green-100 border border-gray-300 rounded text-sm flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Yes
                  </button>
                  <button 
                    type="button"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white border border-red-600 rounded text-sm flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    No
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Click no if the system needs to check this payment and add a scheduler.</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowRecordModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Create
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

