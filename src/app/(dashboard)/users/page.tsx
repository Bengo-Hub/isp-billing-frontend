'use client';

import { Card } from '@/components/ui/card';
import ActiveUsersTable from '@/components/users/ActiveUsersTable';

export default function ActiveUsersPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <ActiveUsersTable />
      </Card>
    </div>
  );
}

