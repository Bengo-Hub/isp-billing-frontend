'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Download, Mail, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ExpiringUser {
  id: number;
  username: string;
  email: string;
  phone: string;
  package: string;
  expiry_date: string;
  days_remaining: number;
  status: 'expiring_soon' | 'expired' | 'active';
  auto_renew: boolean;
}

export default function ExpiryDatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'expiring_soon' | 'expired'>('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Mock data - replace with real API call
  const expiringUsers: ExpiringUser[] = [
    {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      phone: '+254712345678',
      package: 'Premium Monthly',
      expiry_date: '2026-02-05T00:00:00Z',
      days_remaining: 4,
      status: 'expiring_soon',
      auto_renew: false,
    },
  ];

  const filteredUsers = expiringUsers.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesFilter =
      filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    expiring_today: 0,
    expiring_this_week: 1,
    expired: 0,
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-pink-600" />
          <h1 className="text-2xl font-bold text-gray-900">Expiry Dates</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={selectedUsers.length === 0}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send SMS ({selectedUsers.length})
          </Button>
          <Button variant="outline" disabled={selectedUsers.length === 0}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email ({selectedUsers.length})
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-2">Expiring Today</div>
              <div className="text-3xl font-bold">{stats.expiring_today}</div>
              <div className="text-xs opacity-75 mt-2">Subscriptions ending today</div>
            </div>
            <Clock className="h-12 w-12 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-400 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-2">Expiring This Week</div>
              <div className="text-3xl font-bold">{stats.expiring_this_week}</div>
              <div className="text-xs opacity-75 mt-2">Next 7 days</div>
            </div>
            <Calendar className="h-12 w-12 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-400 to-red-600 text-white">
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
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by username, email, or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant={filterStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('all')}>All</Button>
          <Button variant={filterStatus === 'expiring_soon' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('expiring_soon')}>Expiring Soon</Button>
          <Button variant={filterStatus === 'expired' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('expired')}>Expired</Button>
        </div>
      </div>

      {/* Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="pb-3 font-medium">Username</th>
                <th className="pb-3 font-medium">Contact</th>
                <th className="pb-3 font-medium">Package</th>
                <th className="pb-3 font-medium">Expiry Date</th>
                <th className="pb-3 font-medium">Days Remaining</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="py-3 font-medium text-pink-600">{user.username}</td>
                  <td className="py-3 text-sm"><div>{user.email}</div><div className="text-gray-500">{user.phone}</div></td>
                  <td className="py-3 text-sm">{user.package}</td>
                  <td className="py-3 text-sm">{new Date(user.expiry_date).toLocaleDateString()}</td>
                  <td className="py-3"><span className="text-sm font-medium text-blue-600">{user.days_remaining} day(s)</span></td>
                  <td className="py-3"><Badge className="bg-yellow-100 text-yellow-700">{user.status.replace('_', ' ')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
