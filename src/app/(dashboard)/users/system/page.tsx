'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, MoreHorizontal, Plus, Search, Users, Shield, Wrench } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useUsers, useDeleteUser, useActivateUser, useDeactivateUser, type UserItem } from '@/features/users/api';

export default function SystemUsersPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'technician'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Fetch system users (admins + technicians) - exclude customers
  const { data, isLoading, error } = useUsers({
    page,
    size: 25,
    role: activeTab === 'all' ? undefined : activeTab,
    search: searchQuery || undefined,
  });
  const deleteUser = useDeleteUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();

  // Filter out customers in the "all" view (only show admin/technician)
  const users = useMemo(() => {
    const allUsers = data?.users ?? [];
    if (activeTab === 'all') {
      return allUsers.filter((u) => u.role === 'admin' || u.role === 'technician');
    }
    return allUsers;
  }, [data?.users, activeTab]);

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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-pink-100 text-pink-800"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'technician':
        return <Badge className="bg-blue-100 text-blue-800"><Wrench className="h-3 w-3 mr-1" />Technician</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>;
    }
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
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-pink-600" />
          <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
        <Card className="p-6"><p className="text-red-600">Failed to load users: {String(error)}</p></Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-pink-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
            <p className="text-gray-600">Manage system administrators and support staff</p>
          </div>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto">
        {([
          { key: 'all' as const, label: 'All Staff', icon: Users },
          { key: 'admin' as const, label: 'Administrators', icon: Shield },
          { key: 'technician' as const, label: 'Technicians', icon: Wrench },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card className="p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden sm:table-cell">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden md:table-cell">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden sm:table-cell">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">Last Login</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No system users found</p>
                    {searchQuery && <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-pink-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-pink-600">
                            {(user.first_name || user.username || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{user.full_name || user.username}</span>
                          <span className="block text-xs text-gray-500 md:hidden">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-pink-600 hidden sm:table-cell">{user.phone || '-'}</td>
                    <td className="py-4 px-4 text-pink-600 hidden md:table-cell">{user.email}</td>
                    <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-4 hidden sm:table-cell">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 hidden lg:table-cell">{formatDate(user.last_login)}</td>
                    <td className="py-4 px-4 relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-pink-600 border-pink-300 hover:bg-pink-50"
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
