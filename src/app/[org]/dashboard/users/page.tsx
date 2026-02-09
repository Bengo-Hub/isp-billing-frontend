'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RouterFilter } from '@/components/filters/RouterFilter';
import ActiveUsersTable from '@/components/users/ActiveUsersTable';
import UserManagementTable from '@/components/users/UserManagementTable';
import UserFormDialog from '@/components/users/UserFormDialog';
import { Users, Wifi, Cable } from 'lucide-react';
import type { UserItem } from '@/features/users/api';

type TabType = 'management' | 'active-connections';

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active-connections');
  const [selectedRouterId, setSelectedRouterId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const handleCreateUser = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditUser = (user: UserItem) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleViewUser = (user: UserItem) => {
    setSelectedUser(user);
    // TODO: Open view/detail dialog if needed
  };

  const tabs = [
    {
      id: 'active-connections' as const,
      label: 'Active Connections',
      icon: Wifi,
      description: 'View currently connected users'
    },
    {
      id: 'management' as const,
      label: 'Customer Management',
      icon: Users,
      description: 'Manage customer accounts and subscriptions'
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header with Router Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Users & Connections</h1>
        <RouterFilter value={selectedRouterId} onChange={setSelectedRouterId} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-4 sm:gap-8 min-w-max sm:min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 sm:pb-4 px-2 border-b-2 transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                </div>
                <p className="text-xs mt-1 text-left hidden sm:block">
                  {tab.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <Card className="p-3 sm:p-6 w-full overflow-x-auto">
        {activeTab === 'management' && (
          <UserManagementTable
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
            onViewUser={handleViewUser}
          />
        )}

        {activeTab === 'active-connections' && (
          <ActiveUsersTable routerId={selectedRouterId} />
        )}
      </Card>

      {/* Create User Dialog */}
      <UserFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Edit User Dialog */}
      {selectedUser && (
        <UserFormDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedUser(null);
          }}
          editData={{
            type: selectedUser.role === 'customer' ? 'hotspot' : 'pppoe',
            firstName: selectedUser.first_name,
            lastName: selectedUser.last_name,
            username: selectedUser.username,
            password: '',
            package: '',
            expiryDate: '',
            expiryTime: '',
            phoneNumber: selectedUser.phone || '',
            email: selectedUser.email,
            address: '',
            comment: '',
          }}
          userId={selectedUser.id}
        />
      )}
    </div>
  );
}

