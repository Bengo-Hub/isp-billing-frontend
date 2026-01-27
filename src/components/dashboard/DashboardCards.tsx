"use client";
import { useDashboardAnalytics } from '@/features/dashboard/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardCards() {
  const { data, isLoading, error } = useDashboardAnalytics();

  if (isLoading) return <SkeletonGrid />;
  if (error) return <div className="mt-6 text-red-600">{String(error)}</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard title="Total Routers" value={data?.routers?.total_routers ?? 0} />
      <StatCard title="Online Routers" value={data?.routers?.online_routers ?? 0} />
      <StatCard title="Total Invoices" value={data?.billing?.total_invoices ?? 0} />
      <StatCard title="Total Subscriptions" value={data?.subscriptions?.total_subscriptions ?? 0} />
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
}
