'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ActiveUsersTable from '@/components/users/ActiveUsersTable';
import UserManagementTable from '@/components/users/UserManagementTable';
import UserFormDialog from '@/components/users/UserFormDialog';
import { Users, Wifi, Cable } from 'lucide-react';
import type { UserItem } from '@/features/users/api';

type TabType = 'management' | 'active-connections';

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active-connections');
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </div>
                <p className="text-xs mt-1 text-left">
                  {tab.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <Card className="p-6">
        {activeTab === 'management' && (
          <UserManagementTable
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
            onViewUser={handleViewUser}
          />
        )}

        {activeTab === 'active-connections' && (
          <ActiveUsersTable />
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

