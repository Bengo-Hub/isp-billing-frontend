"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers } from '@/features/users/api';
import { Filter, MoreHorizontal, Search } from 'lucide-react';
import { useState } from 'react';

export default function UserTable() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data, isLoading, error } = useUsers({ page: 1, size: 20, role, status, search });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-brand-100 text-brand-800">Admin</Badge>;
      case 'technician':
        return <Badge className="bg-blue-100 text-blue-800">Technician</Badge>;
      case 'customer':
        return <Badge className="bg-gray-100 text-gray-800">Customer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={role || ''}
            onChange={(e) => setRole(e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="technician">Technician</option>
            <option value="customer">Customer</option>
          </select>
          <select
            value={status || ''}
            onChange={(e) => setStatus(e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {isLoading && <UsersSkeleton />}
      {error && <div className="text-red-600">{String(error)}</div>}
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Username
                  <span className="ml-1 text-gray-400">↓</span>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Email
                  <span className="ml-1 text-gray-400">↓</span>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {u.username?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{u.username || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{u.email || 'No email'}</td>
                  <td className="py-4 px-4">{getRoleBadge(u.role || 'unknown')}</td>
                  <td className="py-4 px-4">{getStatusBadge(u.status || 'unknown')}</td>
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
      )}

      {data?.users && data.users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
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

function UsersSkeleton() {
  return (
    <div className="space-y-2 mt-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
