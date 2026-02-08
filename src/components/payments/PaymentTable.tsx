"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePayments } from '@/features/payments/api';
import { Filter, MoreHorizontal, Search } from 'lucide-react';
import { useState } from 'react';

export default function PaymentTable() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [method, setMethod] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<string | undefined>(undefined);
  
  const { data, isLoading, error } = usePayments({ 
    page: 1, 
    size: 20,
    status
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) return <PaySkeleton />;
  if (error) return <div className="text-red-600">{String(error)}</div>;

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search by ID, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={status || ''}
            onChange={(e) => setStatus(e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={method || ''}
            onChange={(e) => setMethod(e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Methods</option>
            <option value="mpesa">M-Pesa</option>
            <option value="paystack">Paystack</option>
            <option value="stripe">Stripe</option>
          </select>
          <select
            value={dateRange || ''}
            onChange={(e) => setDateRange(e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                ID
                <span className="ml-1 text-gray-400">↓</span>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                User
                <span className="ml-1 text-gray-400">↓</span>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Amount
                <span className="ml-1 text-gray-400">↓</span>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Method
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Date
                <span className="ml-1 text-gray-400">↓</span>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-900">{p.id}</span>
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {p.user_id}
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-900">{formatAmount(p.amount)}</span>
                </td>
                <td className="py-4 px-4">
                  <Badge variant="outline" className="capitalize">
                    {p.method}
                  </Badge>
                </td>
                <td className="py-4 px-4">{getStatusBadge(p.status)}</td>
                <td className="py-4 px-4 text-gray-600">{formatDate(p.created_at)}</td>
                <td className="py-4 px-4">
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.items && data.items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No payments found</p>
          {search && (
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search criteria
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PaySkeleton() {
  return (
    <div className="space-y-2 mt-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
