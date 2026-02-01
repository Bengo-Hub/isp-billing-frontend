'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ticket, Search, Download, Plus, MoreHorizontal, Eye, Copy } from 'lucide-react';
import { useState } from 'react';

interface Voucher {
  id: number;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  usageCount: number;
  usageLimit: number;
  expiryDate: string;
  status: 'active' | 'expired' | 'disabled';
  createdBy: string;
  createdAt: string;
}

export default function VouchersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const vouchers: Voucher[] = [
    {
      id: 1,
      code: 'SUMMER2026',
      discount: 20,
      type: 'percentage',
      usageCount: 45,
      usageLimit: 100,
      expiryDate: '2026-08-31',
      status: 'active',
      createdBy: 'Admin',
      createdAt: '2026-01-15'
    },
    {
      id: 2,
      code: 'WELCOME50',
      discount: 50,
      type: 'fixed',
      usageCount: 12,
      usageLimit: 50,
      expiryDate: '2026-03-31',
      status: 'active',
      createdBy: 'Admin',
      createdAt: '2026-01-10'
    },
    {
      id: 3,
      code: 'NEWYEAR2026',
      discount: 15,
      type: 'percentage',
      usageCount: 100,
      usageLimit: 100,
      expiryDate: '2026-01-31',
      status: 'expired',
      createdBy: 'Admin',
      createdAt: '2025-12-20'
    },
    {
      id: 4,
      code: 'LOYALTY25',
      discount: 25,
      type: 'percentage',
      usageCount: 8,
      usageLimit: 200,
      expiryDate: '2026-12-31',
      status: 'active',
      createdBy: 'Manager',
      createdAt: '2026-01-05'
    },
    {
      id: 5,
      code: 'PROMO100',
      discount: 100,
      type: 'fixed',
      usageCount: 23,
      usageLimit: 50,
      expiryDate: '2026-06-30',
      status: 'disabled',
      createdBy: 'Admin',
      createdAt: '2026-01-01'
    }
  ];

  const stats = {
    activeVouchers: vouchers.filter(v => v.status === 'active').length,
    totalRedemptions: vouchers.reduce((sum, v) => sum + v.usageCount, 0),
    totalDiscount: 'Ksh 12,450.00'
  };

  const filteredVouchers = vouchers.filter(voucher =>
    voucher.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Vouchers</h1>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-pink-600 hover:bg-pink-700"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Voucher
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
          <div className="text-sm opacity-90 mb-2">Active Vouchers</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">{stats.activeVouchers}</div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Currently active voucher codes</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
          <div className="text-sm opacity-90 mb-2">Total Redemptions</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">{stats.totalRedemptions}</div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Total vouchers redeemed</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
          <div className="text-sm opacity-90 mb-2">Total Discount Given</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">{stats.totalDiscount}</div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Total discount amount</div>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search vouchers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Vouchers Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="pb-3 font-medium">Code</th>
                <th className="pb-3 font-medium">Discount</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Usage</th>
                <th className="pb-3 font-medium">Expiry Date</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Created By</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No vouchers found
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((voucher) => (
                  <tr key={voucher.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-pink-600">{voucher.code}</span>
                        <button className="text-gray-400 hover:text-pink-600">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-sm font-medium">
                      {voucher.type === 'percentage' ? `${voucher.discount}%` : `Ksh ${voucher.discount}`}
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className="capitalize">
                        {voucher.type}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm">
                      {voucher.usageCount} / {voucher.usageLimit}
                    </td>
                    <td className="py-3 text-sm">
                      {new Date(voucher.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <Badge className={
                        voucher.status === 'active' ? 'bg-green-100 text-green-700' :
                        voucher.status === 'expired' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {voucher.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm">{voucher.createdBy}</td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Create Voucher</h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Voucher Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voucher Code<span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="e.g., SUMMER2026" />
                  <p className="text-xs text-gray-500 mt-1">Unique code for the voucher</p>
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type<span className="text-red-500">*</span>
                  </label>
                  <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value<span className="text-red-500">*</span>
                  </label>
                  <Input type="number" placeholder="e.g., 20" />
                  <p className="text-xs text-gray-500 mt-1">Enter percentage or amount</p>
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Limit<span className="text-red-500">*</span>
                  </label>
                  <Input type="number" placeholder="e.g., 100" />
                  <p className="text-xs text-gray-500 mt-1">Maximum number of uses</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date<span className="text-red-500">*</span>
                  </label>
                  <Input type="date" />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date<span className="text-red-500">*</span>
                  </label>
                  <Input type="date" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Enter voucher description..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Create Voucher
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
