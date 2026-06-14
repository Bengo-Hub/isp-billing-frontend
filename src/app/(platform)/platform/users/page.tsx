'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Search, Users, Shield } from 'lucide-react';
import { useState } from 'react';
import { usePlatformUsers, useDeleteUser, useActivateUser, useDeactivateUser } from '@/features/users/api';

export default function PlatformUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = usePlatformUsers({
    page,
    size: 25,
    search: searchQuery || undefined,
  });
  const deleteUser = useDeleteUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();

  const users = data?.users ?? [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
    }
  };

  const [actionMenuId, setActionMenuId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Platform Users</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Users</h1>
        <Card className="p-6"><p className="text-red-600">Failed to load platform users: {String(error)}</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-brand-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Users</h1>
            <p className="text-gray-600">Manage platform owner accounts</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search platform users..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card className="p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden sm:table-cell">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden sm:table-cell">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">Last Login</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No platform users found</p>
                    {searchQuery && <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-brand-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-brand-600">
                            {(user.first_name || user.username || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{user.full_name || user.username}</span>
                          <span className="block text-xs text-gray-500 sm:hidden">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-brand-600 hidden sm:table-cell">{user.email}</td>
                    <td className="py-4 px-4">
                      <Badge className="bg-purple-100 text-purple-800">
                        <Shield className="h-3 w-3 mr-1" />Platform Owner
                      </Badge>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 hidden lg:table-cell">{formatDate(user.last_login)}</td>
                    <td className="py-4 px-4 relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-brand-600 border-brand-300 hover:bg-brand-50"
                        onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {actionMenuId === user.id && (
                        <div className="absolute right-4 top-12 bg-white border rounded-lg shadow-lg z-10 min-w-36">
                          {user.status === 'active' ? (
                            <button
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                              onClick={() => { deactivateUser.mutate(user.id); setActionMenuId(null); }}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                              onClick={() => { activateUser.mutate(user.id); setActionMenuId(null); }}
                            >
                              Activate
                            </button>
                          )}
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => { deleteUser.mutate(user.id); setActionMenuId(null); }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {users.length} of {data?.total ?? 0} user(s)
          </p>
          {(data?.pages ?? 0) > 1 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= (data?.pages ?? 1)}>Next</Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
