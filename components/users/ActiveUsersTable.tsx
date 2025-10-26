"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Cable, Filter, Search, Unlink, Wifi } from 'lucide-react';
import { useState } from 'react';

export default function ActiveUsersTable() {
  const [activeTab, setActiveTab] = useState<'all' | 'hotspot' | 'pppoe'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data based on the image
  const activeUsers = [
    {
      id: 1,
      username: 'C45',
      account: 'C21420',
      ip: '172.31.234.91',
      mac: '7A:CD:7D:43:81:A8',
      router: 'MikroTik2',
      sessionStart: '18 minutes ago',
      sessionEnd: '5 hours from now',
      type: 'hotspot'
    },
    {
      id: 2,
      username: 'C236',
      account: 'C36574',
      ip: '172.31.228.103',
      mac: '22:97:54:AC:48:7F',
      router: 'MikroTik2',
      sessionStart: '27 minutes ago',
      sessionEnd: '5 hours from now',
      type: 'hotspot'
    },
    {
      id: 3,
      username: 'C299',
      account: 'C45028',
      ip: '172.31.228.252',
      mac: '7E:68:FC:E4:51:3D',
      router: 'MikroTik2',
      sessionStart: '45 minutes ago',
      sessionEnd: '2 weeks from now',
      type: 'hotspot'
    },
    {
      id: 4,
      username: 'C19',
      account: 'C13561',
      ip: '172.31.228.22',
      mac: '8A:F4:69:20:2C:44',
      router: 'MikroTik2',
      sessionStart: '51 minutes ago',
      sessionEnd: '6 hours from now',
      type: 'hotspot'
    }
  ];

  const filteredUsers = activeUsers.filter(user => {
    if (activeTab !== 'all' && user.type !== activeTab) return false;
    if (searchQuery && !user.username.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.ip.includes(searchQuery) && !user.mac.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleDisconnect = (userId: number) => {
    // In real app, call API to disconnect user
    console.log('Disconnecting user:', userId);
  };

  const getRouterBadge = (router: string) => {
    return (
      <Badge className="bg-pink-100 text-pink-800">
        {router}
      </Badge>
    );
  };

  return (
    <div>
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
            {activeUsers.length}
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
          <Wifi className="h-4 w-4" />
          Hotspot
          <Badge variant="outline" className="ml-1 text-xs">
            {activeUsers.filter(u => u.type === 'hotspot').length}
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
          <Cable className="h-4 w-4" />
          PPPoE
          <Badge variant="outline" className="ml-1 text-xs">
            {activeUsers.filter(u => u.type === 'pppoe').length}
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Active Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Username
                <span className="ml-1 text-gray-400">↓</span>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                IP/MAC
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Router
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Session Start
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Session End
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
                  <div>
                    <span className="font-medium text-gray-900">{user.username}</span>
                    <div className="text-sm text-gray-500">(Acc. {user.account})</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <div className="text-gray-900">IP: {user.ip}</div>
                    <div className="text-gray-600">MAC: {user.mac}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {getRouterBadge(user.router)}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {user.sessionStart}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {user.sessionEnd}
                </td>
                <td className="py-4 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(user.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Unlink className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No active users found</p>
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search criteria
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ActiveUsersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-6 border-b border-gray-200 pb-3">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
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
