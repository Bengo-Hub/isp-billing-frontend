'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Clock, Plus, Search } from 'lucide-react';
import { useState } from 'react';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  user: string;
  created_at: string;
  updated_at: string;
}

export default function TicketsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');

  // Mock data - replace with actual API call
  const tickets: Ticket[] = [
    {
      id: 1,
      title: 'Internet connection dropping frequently',
      description: 'My internet keeps disconnecting every 10 minutes',
      status: 'open',
      priority: 'high',
      user: 'C658',
      created_at: '2026-01-27 10:30',
      updated_at: '2026-01-27 10:30',
    },
    {
      id: 2,
      title: 'Slow speeds during peak hours',
      description: 'Internet is very slow between 6 PM - 10 PM',
      status: 'in_progress',
      priority: 'medium',
      user: 'C744',
      created_at: '2026-01-26 14:20',
      updated_at: '2026-01-27 09:15',
    },
  ];

  const getStatusBadge = (status: TicketStatus) => {
    const styles = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    };
    return styles[status];
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return styles[priority];
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-600 mt-1">Support tickets and customer inquiries</p>
        </div>
        <Button 
          className="bg-pink-600 hover:bg-pink-700"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Open</p>
              <p className="text-2xl font-bold text-blue-600">1</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">1</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Resolved</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Total</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets by title or user..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'all')}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                <th className="pb-3">ID</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">User</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Created</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-gray-400 mb-2">No tickets found</div>
                    <Button 
                      variant="outline" 
                      className="text-pink-600 border-pink-600"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first ticket
                    </Button>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-mono text-sm text-gray-600">#{ticket.id}</td>
                    <td className="py-3">
                      <div className="font-medium">{ticket.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{ticket.description}</div>
                    </td>
                    <td className="py-3 text-sm text-pink-600 font-medium">{ticket.user}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{ticket.created_at}</td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Create New Ticket</h2>

            <form className="space-y-6">
              {/* User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User<span className="text-red-500">*</span>
                </label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Select a user</option>
                  <option value="C658">C658</option>
                  <option value="C744">C744</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority<span className="text-red-500">*</span>
                </label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title<span className="text-red-500">*</span>
                </label>
                <Input placeholder="Brief description of the issue" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description<span className="text-red-500">*</span>
                </label>
                <textarea 
                  className="w-full min-h-[120px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Detailed description of the issue..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Create Ticket
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
