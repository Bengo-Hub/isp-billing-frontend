'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Filter, MoreHorizontal, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';

export default function SystemUsersPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'admins' | 'support'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [users] = useState([
    {
      id: 1,
      name: 'codevertexitsolutions',
      email: 'titusowuor30@gmail.com',
      phone: '+254743793901',
      role: 'ADMIN',
      internetProfile: '',
      lastLogin: '2025-10-20T18:44:00Z',
      status: 'active'
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-pink-100 text-pink-800">ADMIN</Badge>;
      case 'SUPPORT':
        return <Badge className="bg-blue-100 text-blue-800">SUPPORT</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case 'admins':
        return matchesSearch && user.role === 'ADMIN';
      case 'support':
        return matchesSearch && user.role === 'SUPPORT';
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-pink-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
            <p className="text-gray-600">Manage system administrators and support staff</p>
          </div>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4" />
          All Users
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'admins'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4" />
          Administrators
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'support'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4" />
          Technical Support
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Users Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Name
                  <span className="ml-1 text-gray-400">↓</span>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Phone
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Internet Profile
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Last Login
                  <span className="ml-1 text-gray-400">↓</span>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-pink-600">
                    {user.phone}
                  </td>
                  <td className="py-4 px-4 text-pink-600">
                    {user.email}
                  </td>
                  <td className="py-4 px-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="py-4 px-4 text-gray-500">
                    {user.internetProfile || '-'}
                  </td>
                  <td className="py-4 px-4 text-pink-600">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="py-4 px-4">
                    <Button variant="outline" size="sm" className="text-pink-600 border-pink-300 hover:bg-pink-50">
                      <MoreHorizontal className="h-4 w-4" />
                      Actions
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
            {searchQuery && (
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Per page</span>
            <select className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}
