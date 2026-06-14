"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAllActiveConnections,
  useDisconnectUser,
  type ActiveConnection,
} from '@/features/routers/api';
import { Cable, Filter, Search, Unlink, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type ConnectionType = 'all' | 'hotspot' | 'pppoe';

interface ActiveUsersTableProps {
  routerId?: number | null;
}

export default function ActiveUsersTable({ routerId }: ActiveUsersTableProps = {}) {
  const [activeTab, setActiveTab] = useState<ConnectionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch all active connections from all routers (or specific router if filtered)
  const { data: connections, isLoading, error, refetch } = useAllActiveConnections(routerId);
  const disconnectMutation = useDisconnectUser();

  const activeUsers = connections || [];

  const filteredUsers = useMemo(() => {
    return activeUsers.filter(user => {
      // Filter by type
      if (activeTab !== 'all' && user.type !== activeTab) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const username = (user.user || user.name || '').toLowerCase();
        const ip = (user.address || '').toLowerCase();
        const mac = (user['mac-address'] || '').toLowerCase();
        const router = (user.router_name || '').toLowerCase();

        if (!username.includes(query) && !ip.includes(query) && !mac.includes(query) && !router.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [activeUsers, activeTab, searchQuery]);

  const tabCounts = useMemo(() => ({
    all: activeUsers.length,
    hotspot: activeUsers.filter(u => u.type === 'hotspot').length,
    pppoe: activeUsers.filter(u => u.type === 'pppoe').length,
  }), [activeUsers]);

  const handleDisconnect = async (connection: ActiveConnection) => {
    const username = connection.user || connection.name;
    if (!username) {
      toast.error('Cannot disconnect: username not found');
      return;
    }

    try {
      await disconnectMutation.mutateAsync({
        routerId: connection.router_id,
        username,
        userType: connection.type,
      });
      toast.success(`Disconnected ${username}`);
      // Refetch connections after disconnect
      queryClient.invalidateQueries({ queryKey: ['all-active-connections'] });
    } catch (err) {
      toast.error('Failed to disconnect user');
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.info('Refreshing active connections...');
  };

  const getRouterBadge = (routerName: string) => {
    return (
      <Badge className="bg-brand-100 text-brand-800">
        {routerName}
      </Badge>
    );
  };

  const getTypeBadge = (type: 'hotspot' | 'pppoe') => {
    if (type === 'hotspot') {
      return (
        <Badge className="bg-orange-100 text-orange-800">
          <Wifi className="h-3 w-3 mr-1" />
          Hotspot
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800">
        <Cable className="h-3 w-3 mr-1" />
        PPPoE
      </Badge>
    );
  };

  const formatUptime = (uptime?: string) => {
    if (!uptime) return 'Unknown';
    return uptime;
  };

  const formatSessionTimeLeft = (timeLeft?: string) => {
    if (!timeLeft) return 'Unlimited';
    return timeLeft;
  };

  if (isLoading) {
    return <ActiveUsersSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-500">Failed to load active connections</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Users</h1>
          <p className="text-gray-600 mt-1">Currently connected hotspot and PPPoE users.</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All
          <Badge variant="outline" className="ml-1 text-xs">
            {tabCounts.all}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab('hotspot')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'hotspot'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Wifi className="h-4 w-4" />
          Hotspot
          <Badge variant="outline" className="ml-1 text-xs">
            {tabCounts.hotspot}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab('pppoe')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'pppoe'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Cable className="h-4 w-4" />
          PPPoE
          <Badge variant="outline" className="ml-1 text-xs">
            {tabCounts.pppoe}
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
              placeholder="Search by username, IP, MAC, or router..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Username
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Type
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                IP/MAC
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Router
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Uptime
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Time Left
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={`${user.router_id}-${user.user || user.name}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-900">{user.user || user.name || 'Unknown'}</span>
                </td>
                <td className="py-4 px-4">
                  {getTypeBadge(user.type)}
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <div className="text-gray-900">IP: {user.address || 'N/A'}</div>
                    {user['mac-address'] && (
                      <div className="text-gray-600">MAC: {user['mac-address']}</div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {getRouterBadge(user.router_name)}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {formatUptime(user.uptime)}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {formatSessionTimeLeft(user['session-time-left'])}
                </td>
                <td className="py-4 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(user)}
                    disabled={disconnectMutation.isPending}
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
          {searchQuery ? (
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search criteria
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">
              No users are currently connected to your routers
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
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
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
