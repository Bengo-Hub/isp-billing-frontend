"use client";
import { useSmsBalance } from '@/features/sms/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SMSBalanceCard({ accountId }: { accountId: number }) {
  const { data, isLoading, error } = useSmsBalance(accountId);

  if (isLoading) return <Skeleton className="h-28" />;
  if (error) return <div className="text-red-600">{String(error)}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">
          {data?.current_balance} {data?.currency}
        </div>
        <div className="text-sm text-gray-500 mt-1">Account: {data?.account_name}</div>
      </CardContent>
    </Card>
  );
}
