'use client';

import { Card } from '@/components/ui/card';
import AllUsersTable from '@/components/users/AllUsersTable';

export default function AllUsersPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <Card className="p-6">
        <AllUsersTable />
      </Card>
    </div>
  );
}

