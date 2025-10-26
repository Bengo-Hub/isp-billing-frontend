"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, MoreHorizontal, Plus, Search, Upload, User } from 'lucide-react';
import { useState } from 'react';
import CreateUserDialog from './CreateUserDialog';

export default function AllUsersTable() {
  const [activeTab, setActiveTab] = useState<'all' | 'hotspot' | 'pppoe' | 'paused' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data based on the images
  const allUsers = [
    {
      id: 1,
      username: 'C367',
      phone: '0728053026',
      package: '2HR SURF UNLIMITED',
      expiry: 'Expired',
      status: 'Active',
      lastOnline: '3 hours ago',
      type: 'hotspot'
    },
    {
      id: 2,
      username: 'C366',
      phone: '0745301052',
      package: '2HR SURF UNLIMITED',
      expiry: 'Expired',
      status: 'Active',
      lastOnline: 'Never',
      type: 'hotspot'
    },
    {
      id: 3,
      username: 'C365',
      phone: '0792345678',
      package: '2HR SURF UNLIMITED',
      expiry: 'Expired',
      status: 'Active',
      lastOnline: '16 hours ago',
      type: 'hotspot'
    },
    {
      id: 4,
      username: 'C364',
      phone: '0712345678',
      package: '2HR SURF UNLIMITED',
      expiry: 'Expired',
      status: 'Active',
      lastOnline: 'Never',
      type: 'hotspot'
    },
    {
      id: 5,
      username: 'C363',
      phone: '0723456789',
      package: '2HR SURF UNLIMITED',
      expiry: 'Expired',
      status: 'Active',
      lastOnline: '1 day ago',
      type: 'hotspot'
    },
    {
      id: 6,
      username: 'C362',
      phone: '0734567890',
      package: '2HR SURF UNLIMITED',
      expiry: 'Expired',
      status: 'Active',
      lastOnline: '1 day ago',
      type: 'hotspot'
    }
  ];

  const filteredUsers = allUsers.filter(user => {
    if (activeTab !== 'all' && user.type !== activeTab) return false;
    if (searchQuery && !user.username.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.phone.includes(searchQuery)) {
      return false;
    }
    return true;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case 'Paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExpiryBadge = (expiry: string) => {
    switch (expiry) {
      case 'Expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      default:
        return <Badge variant="outline">{expiry}</Badge>;
    }
  };

  const getPackageBadge = (packageName: string) => {
    return (
      <Badge className="bg-green-100 text-green-800">
        {packageName}
      </Badge>
    );
  };

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">All users including hotspot and PPPoE users.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Users
          </Button>
          <Button 
            className="bg-pink-600 hover:bg-pink-700"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All
          <Badge variant="outline" className="ml-1 text-xs">
            {allUsers.length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab('hotspot')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'hotspot'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Hotspot
          <Badge variant="outline" className="ml-1 text-xs">
            {allUsers.filter(u => u.type === 'hotspot').length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab('pppoe')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'pppoe'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          PPPoE
          <Badge variant="outline" className="ml-1 text-xs">
            {allUsers.filter(u => u.type === 'pppoe').length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab('paused')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'paused'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Paused
          <Badge variant="outline" className="ml-1 text-xs">
            {allUsers.filter(u => u.status === 'Paused').length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab('offline')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'offline'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Offline
          <Badge variant="outline" className="ml-1 text-xs">
            {allUsers.filter(u => u.lastOnline === 'Never' || u.lastOnline.includes('day')).length}
          </Badge>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <Badge variant="outline" className="ml-2 text-xs">
              0
            </Badge>
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Username
                <span className="ml-1 text-gray-400">↓</span>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Phone
                <span className="ml-1 text-gray-400">↓</span>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Package
                <span className="ml-1 text-gray-400">↓</span>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Expiry
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Last Online
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-900">{user.username}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-red-600 font-medium">{user.phone}</span>
                </td>
                <td className="py-4 px-4">
                  {getPackageBadge(user.package)}
                </td>
                <td className="py-4 px-4">
                  {getExpiryBadge(user.expiry)}
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(user.status)}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {user.lastOnline}
                </td>
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

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No users found</p>
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search criteria
            </p>
          )}
        </div>
      )}

      {/* Create User Dialog */}
      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}

function AllUsersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="flex gap-6 border-b border-gray-200 pb-3">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
