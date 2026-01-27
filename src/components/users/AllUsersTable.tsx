"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useSubscriptions,
  useActivateSubscription,
  useSuspendSubscription,
  useBulkActivateSubscriptions,
  useBulkSuspendSubscriptions,
  useBulkDeleteSubscriptions,
  type SubscriptionItem,
  type SubscriptionType,
  type SubscriptionStatus,
} from '@/features/subscriptions/api';
import { Filter, MoreHorizontal, Plus, Search, Upload, User, RefreshCw, Pause, Play, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import CreateUserDialog from './CreateUserDialog';
import { formatDistanceToNow, parseISO, isPast } from 'date-fns';

type TabType = 'all' | 'hotspot' | 'pppoe' | 'paused' | 'offline' | 'expired';

export default function AllUsersTable() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch subscriptions from API
  const { data, isLoading, error, refetch } = useSubscriptions({
    page,
    size: pageSize,
    search: searchQuery || undefined,
    subscription_type: activeTab === 'hotspot' || activeTab === 'pppoe' ? activeTab : undefined,
    status: activeTab === 'paused' ? 'suspended' : activeTab === 'expired' ? 'expired' : undefined,
  });

  // Mutations
  const activateMutation = useActivateSubscription();
  const suspendMutation = useSuspendSubscription();
  const bulkActivateMutation = useBulkActivateSubscriptions();
  const bulkSuspendMutation = useBulkSuspendSubscriptions();
  const bulkDeleteMutation = useBulkDeleteSubscriptions();

  const subscriptions = data?.subscriptions || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.pages || 1;

  // Calculate tab counts from the current page data
  const tabCounts = useMemo(() => {
    return {
      all: totalCount,
      hotspot: subscriptions.filter(s => s.subscription_type === 'hotspot').length,
      pppoe: subscriptions.filter(s => s.subscription_type === 'pppoe').length,
      paused: subscriptions.filter(s => s.status === 'suspended').length,
      offline: subscriptions.filter(s => !s.last_activity || isPast(new Date(Date.now() - 24 * 60 * 60 * 1000))).length,
      expired: subscriptions.filter(s => s.is_expired).length,
    };
  }, [subscriptions, totalCount]);

  const handleSelectAll = () => {
    if (selectedUsers.length === subscriptions.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(subscriptions.map(u => u.id));
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleActivate = async (subscriptionId: number) => {
    await activateMutation.mutateAsync(subscriptionId);
  };

  const handleSuspend = async (subscriptionId: number) => {
    await suspendMutation.mutateAsync({ subscriptionId });
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.length > 0) {
      await bulkActivateMutation.mutateAsync(selectedUsers);
      setSelectedUsers([]);
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedUsers.length > 0) {
      await bulkSuspendMutation.mutateAsync({ subscriptionIds: selectedUsers });
      setSelectedUsers([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length > 0 && confirm(`Are you sure you want to delete ${selectedUsers.length} subscriptions?`)) {
      await bulkDeleteMutation.mutateAsync(selectedUsers);
      setSelectedUsers([]);
    }
  };

  const getStatusBadge = (subscription: SubscriptionItem) => {
    if (subscription.is_expired) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }
    switch (subscription.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{subscription.status}</Badge>;
    }
  };

  const getExpiryBadge = (subscription: SubscriptionItem) => {
    if (subscription.is_expired) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }
    if (subscription.is_active) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const getPackageBadge = (planName?: string) => {
    return (
      <Badge className="bg-green-100 text-green-800">
        {planName || 'No Plan'}
      </Badge>
    );
  };

  const formatLastOnline = (lastActivity?: string) => {
    if (!lastActivity) return 'Never';
    try {
      return formatDistanceToNow(parseISO(lastActivity), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return <AllUsersSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load subscriptions</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">All users including hotspot and PPPoE users.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-pink-50 rounded-lg">
          <span className="text-sm text-pink-800 font-medium">
            {selectedUsers.length} selected
          </span>
          <Button size="sm" variant="outline" onClick={handleBulkActivate} disabled={bulkActivateMutation.isPending}>
            <Play className="h-4 w-4 mr-1" />
            Activate
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkSuspend} disabled={bulkSuspendMutation.isPending}>
            <Pause className="h-4 w-4 mr-1" />
            Suspend
          </Button>
          <Button size="sm" variant="outline" className="text-red-600" onClick={handleBulkDelete} disabled={bulkDeleteMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        {(['all', 'hotspot', 'pppoe', 'paused', 'offline', 'expired'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === tab
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <Badge variant="outline" className="ml-1 text-xs">
              {tabCounts[tab]}
            </Badge>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search by username, phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
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
                  checked={selectedUsers.length === subscriptions.length && subscriptions.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Username
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Type
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Package
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
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(subscription.id)}
                    onChange={() => handleSelectUser(subscription.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-900">{subscription.username}</span>
                </td>
                <td className="py-4 px-4">
                  <Badge variant="outline" className={subscription.subscription_type === 'hotspot' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}>
                    {subscription.subscription_type.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  {getPackageBadge(subscription.plan_name)}
                </td>
                <td className="py-4 px-4">
                  {getExpiryBadge(subscription)}
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(subscription)}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {formatLastOnline(subscription.last_activity)}
                </td>
                <td className="py-4 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleActivate(subscription.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Activate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSuspend(subscription.id)}>
                        <Pause className="h-4 w-4 mr-2" />
                        Suspend
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {subscriptions.length === 0 && (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
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
