'use client';

import { StatsCard } from '@/components/dashboard/StatsCard';
import PaymentTable from '@/components/payments/PaymentTable';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">Track and manage all payment transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Revenue"
          value="$24,500"
          icon={DollarSign}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          trend={{ value: '12% from last month', isPositive: true }}
        />
        <StatsCard
          title="Completed"
          value="1,234"
          icon={CheckCircle}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Pending"
          value="45"
          icon={Clock}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="This Month"
          value="$8,450"
          icon={TrendingUp}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      <Card className="p-6">
        <PaymentTable />
      </Card>
    </div>
  );
}

