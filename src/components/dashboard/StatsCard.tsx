'use client';

import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconBgColor?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
}: StatsCardProps) {
  return (
    <Card className="p-3 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5 sm:mb-1 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-1 sm:mt-2 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`h-9 w-9 sm:h-12 sm:w-12 rounded-lg ${iconBgColor} flex items-center justify-center shrink-0`}>
          <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}

