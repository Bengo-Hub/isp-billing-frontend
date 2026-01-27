'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpiringSubscriptions, useRenewSubscription, type SubscriptionItem } from '@/features/subscriptions/api';
import { AlertTriangle, Calendar, RefreshCw, Bell, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow, parseISO, differenceInDays, differenceInHours } from 'date-fns';

export default function ExpiryDatesPage() {
  const [expiryDays, setExpiryDays] = useState(7);

  // Fetch expiring subscriptions from API
  const { data: expiringSubscriptions, isLoading, error, refetch } = useExpiringSubscriptions(expiryDays);
  const renewMutation = useRenewSubscription();

  const getStatusBadge = (subscription: SubscriptionItem) => {
    const endDate = parseISO(subscription.end_date);
    const now = new Date();
    const hoursLeft = differenceInHours(endDate, now);
    const daysLeft = differenceInDays(endDate, now);

    if (hoursLeft <= 0) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    } else if (hoursLeft <= 24) {
      return <Badge className="bg-red-100 text-red-800">Expires Today</Badge>;
    } else if (daysLeft <= 1) {
      return <Badge className="bg-orange-100 text-orange-800">Expires Tomorrow</Badge>;
    } else if (daysLeft <= 3) {
      return <Badge className="bg-yellow-100 text-yellow-800">Expires in {daysLeft} days</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Expires in {daysLeft} days</Badge>;
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = parseISO(dateString);
    return {
      formatted: date.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      relative: formatDistanceToNow(date, { addSuffix: true }),
    };
  };

  const handleExtend = async (subscription: SubscriptionItem) => {
    // Calculate new end date (extend by the same validity period)
    const currentEnd = parseISO(subscription.end_date);
    const newEndDate = new Date(currentEnd);
    newEndDate.setMonth(newEndDate.getMonth() + 1); // Extend by 1 month

    try {
      await renewMutation.mutateAsync({
        subscriptionId: subscription.id,
        newEndDate: newEndDate.toISOString(),
      });
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const handleNotify = async (subscription: SubscriptionItem) => {
    toast.info(`Sending expiry notification to user ${subscription.username}...`);
    // This would call the SMS/notification API in production
  };

  const handleBulkNotify = async () => {
    if (expiringSubscriptions && expiringSubscriptions.length > 0) {
      toast.info(`Sending notifications to ${expiringSubscriptions.length} users...`);
      // This would call a bulk notification API in production
    }
  };

  if (isLoading) {
    return <ExpiryPageSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">Could not fetch expiring subscriptions.</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expiry Dates</h1>
          <p className="text-gray-600 mt-1">Users whose packages are expiring soon</p>
        </div>
        <div className="flex gap-3">
          <Select value={expiryDays.toString()} onValueChange={(v) => setExpiryDays(parseInt(v, 10))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Next 24 hours</SelectItem>
              <SelectItem value="3">Next 3 days</SelectItem>
              <SelectItem value="7">Next 7 days</SelectItem>
              <SelectItem value="14">Next 14 days</SelectItem>
              <SelectItem value="30">Next 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700" onClick={handleBulkNotify}>
            <Bell className="h-4 w-4 mr-2" />
            Notify All ({expiringSubscriptions?.length || 0})
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expiring Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {expiringSubscriptions?.filter(s => differenceInHours(parseISO(s.end_date), new Date()) <= 24).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {expiringSubscriptions?.filter(s => differenceInDays(parseISO(s.end_date), new Date()) <= 7).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expiring</p>
              <p className="text-2xl font-bold text-gray-900">
                {expiringSubscriptions?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <RefreshCw className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Auto-Renewal</p>
              <p className="text-2xl font-bold text-gray-900">
                {expiringSubscriptions?.filter(s => s.is_auto_renewal).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        {expiringSubscriptions && expiringSubscriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Username</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Package</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Expiry Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Auto-Renew</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expiringSubscriptions.map((subscription) => {
                  const expiry = formatExpiryDate(subscription.end_date);
                  return (
                    <tr key={subscription.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{subscription.username}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={subscription.subscription_type === 'hotspot' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}>
                          {subscription.subscription_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-green-100 text-green-800">
                          {subscription.plan_name || `Plan #${subscription.plan_id}`}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">{expiry.formatted}</p>
                          <p className="text-sm text-gray-500">{expiry.relative}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(subscription)}
                      </td>
                      <td className="py-4 px-4">
                        {subscription.is_auto_renewal ? (
                          <Badge className="bg-green-100 text-green-800">Yes</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">No</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExtend(subscription)}
                            disabled={renewMutation.isPending}
                          >
                            Extend
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNotify(subscription)}
                          >
                            Notify
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Expiring Subscriptions</h3>
            <p className="text-gray-600">
              No subscriptions are expiring within the next {expiryDays} days.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function ExpiryPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    </div>
  );
}
