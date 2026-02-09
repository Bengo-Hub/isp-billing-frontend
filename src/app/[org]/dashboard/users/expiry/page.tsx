'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Search, Download, Mail, MessageSquare, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useExpiringSubscriptions, useExpiredSubscriptions, useRenewSubscription, type SubscriptionItem } from '@/features/subscriptions/api';

export default function ExpiryDatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'expiring' | 'expired'>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: expiringData, isLoading: loadingExpiring } = useExpiringSubscriptions(7);
  const { data: expiredData, isLoading: loadingExpired } = useExpiredSubscriptions();
  const renewSubscription = useRenewSubscription();

  const isLoading = loadingExpiring || loadingExpired;
  const expiring = expiringData ?? [];
  const expired = expiredData ?? [];

  // Combine and tag subscriptions
  const allSubscriptions = useMemo(() => {
    const tagged: (SubscriptionItem & { _tag: 'expiring' | 'expired' })[] = [
      ...expiring.map((s) => ({ ...s, _tag: 'expiring' as const })),
      ...expired.map((s) => ({ ...s, _tag: 'expired' as const })),
    ];
    // Deduplicate by id (in case both lists overlap)
    const seen = new Set<number>();
    return tagged.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [expiring, expired]);

  // Stats computed from real data
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const expiringToday = expiring.filter((s) => {
      const end = new Date(s.end_date);
      return end.toDateString() === today.toDateString();
    }).length;
    return {
      expiring_today: expiringToday,
      expiring_this_week: expiring.length,
      expired: expired.length,
    };
  }, [expiring, expired]);

  // Filter and search
  const filtered = useMemo(() => {
    return allSubscriptions.filter((s) => {
      const matchesSearch =
        !searchTerm ||
        s.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.plan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.user_phone?.includes(searchTerm);

      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'expiring' && s._tag === 'expiring') ||
        (filterStatus === 'expired' && s._tag === 'expired');

      return matchesSearch && matchesFilter;
    });
  }, [allSubscriptions, searchTerm, filterStatus]);

  const daysRemaining = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((s) => s.id));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Expiry Dates</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Expiry Dates</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send SMS ({selectedIds.length})
          </Button>
          <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email ({selectedIds.length})
          </Button>
          <Button size="sm" className="bg-brand-600 hover:bg-brand-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-linear-to-br from-yellow-400 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-2">Expiring Today</div>
              <div className="text-3xl font-bold">{stats.expiring_today}</div>
              <div className="text-xs opacity-75 mt-2">Subscriptions ending today</div>
            </div>
            <Clock className="h-12 w-12 opacity-20" />
          </div>
        </Card>
        <Card className="p-6 bg-linear-to-br from-blue-400 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-2">Expiring This Week</div>
              <div className="text-3xl font-bold">{stats.expiring_this_week}</div>
              <div className="text-xs opacity-75 mt-2">Next 7 days</div>
            </div>
            <Calendar className="h-12 w-12 opacity-20" />
          </div>
        </Card>
        <Card className="p-6 bg-linear-to-br from-red-400 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-2">Expired</div>
              <div className="text-3xl font-bold">{stats.expired}</div>
              <div className="text-xs opacity-75 mt-2">Needs renewal</div>
            </div>
            <AlertCircle className="h-12 w-12 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by username, plan, or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant={filterStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('all')}>All ({allSubscriptions.length})</Button>
          <Button variant={filterStatus === 'expiring' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('expiring')}>Expiring ({expiring.length})</Button>
          <Button variant={filterStatus === 'expired' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('expired')}>Expired ({expired.length})</Button>
        </div>
      </div>

      {/* Table */}
      <Card className="p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">
                  <input type="checkbox" className="rounded border-gray-300" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="pb-3 font-medium">Username</th>
                <th className="pb-3 font-medium hidden md:table-cell">Plan</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Type</th>
                <th className="pb-3 font-medium">Expiry Date</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Days Left</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    No subscriptions match your criteria
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => {
                  const days = daysRemaining(sub.end_date);
                  return (
                    <tr key={sub.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <input type="checkbox" className="rounded border-gray-300" checked={selectedIds.includes(sub.id)} onChange={() => toggleSelect(sub.id)} />
                      </td>
                      <td className="py-3 font-medium text-brand-600">{sub.username}</td>
                      <td className="py-3 text-sm hidden md:table-cell">{sub.plan_name ?? `Plan #${sub.plan_id}`}</td>
                      <td className="py-3 hidden sm:table-cell">
                        <Badge variant="outline" className="capitalize">{sub.subscription_type}</Badge>
                      </td>
                      <td className="py-3 text-sm">{new Date(sub.end_date).toLocaleDateString()}</td>
                      <td className="py-3 hidden sm:table-cell">
                        <span className={`text-sm font-medium ${days <= 0 ? 'text-red-600' : days <= 3 ? 'text-orange-600' : 'text-blue-600'}`}>
                          {days <= 0 ? 'Expired' : `${days} day(s)`}
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge className={sub._tag === 'expired' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                          {sub._tag === 'expired' ? 'Expired' : 'Expiring'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const start = new Date(sub.start_date);
                            const end = new Date(sub.end_date);
                            const durationMs = end.getTime() - start.getTime();
                            const now = new Date();
                            const renewFrom = end > now ? end : now;
                            const newEnd = new Date(renewFrom.getTime() + durationMs);
                            renewSubscription.mutate({
                              subscriptionId: sub.id,
                              newEndDate: newEnd.toISOString().split('T')[0],
                            });
                          }}
                          disabled={renewSubscription.isPending}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Renew
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Showing {filtered.length} of {allSubscriptions.length} subscriptions
          </p>
        </div>
      </Card>
    </div>
  );
}
