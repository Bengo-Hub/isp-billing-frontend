'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  MessageSquare,
  User,
  Edit,
  X,
  Check,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import {
  useTickets,
  useTicket,
  useCreateTicket,
  useUpdateTicket,
  useAddTicketMessage,
  useAssignTicket,
  useResolveTicket,
  useCloseTicket,
  useTicketStats,
  SupportTicket,
  TicketStatus,
  TicketPriority,
} from '@/features/tickets/api';

export default function TicketsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Form state for create
  const [formData, setFormData] = useState({
    user_id: '',
    subject: '',
    description: '',
    priority: 'MEDIUM' as TicketPriority,
    category: '',
  });

  // Message form state
  const [messageData, setMessageData] = useState({
    message: '',
    is_internal: false,
  });

  // Fetch tickets with filters
  const { data: ticketsData, isLoading: ticketsLoading, refetch } = useTickets({
    page,
    size: pageSize,
    status: filterStatus !== 'all' ? (filterStatus as TicketStatus) : undefined,
    priority: filterPriority !== 'all' ? (filterPriority as TicketPriority) : undefined,
    search: searchTerm || undefined,
  });

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useTicketStats();

  // Fetch selected ticket details
  const { data: selectedTicket } = useTicket(selectedTicketId || 0);

  // Mutations
  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();
  const addMessage = useAddTicketMessage();
  const resolveTicket = useResolveTicket();
  const closeTicket = useCloseTicket();

  const tickets = ticketsData?.tickets || [];
  const totalTickets = ticketsData?.total || 0;

  const resetForm = () => {
    setFormData({
      user_id: '',
      subject: '',
      description: '',
      priority: 'MEDIUM',
      category: '',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_id || !formData.subject || !formData.description) {
      return;
    }

    await createTicket.mutateAsync({
      user_id: Number(formData.user_id),
      subject: formData.subject,
      description: formData.description,
      priority: formData.priority,
      category: formData.category || undefined,
    });

    resetForm();
    setShowCreateModal(false);
    refetch();
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !messageData.message) {
      return;
    }

    await addMessage.mutateAsync({
      ticketId: selectedTicketId,
      message: messageData.message,
      is_internal: messageData.is_internal,
    });

    setMessageData({ message: '', is_internal: false });
    refetch();
  };

  const handleResolve = async (ticketId: number) => {
    const resolution = prompt('Enter resolution details:');
    if (resolution) {
      await resolveTicket.mutateAsync({ ticketId, resolution });
      refetch();
      setShowDetailModal(false);
    }
  };

  const handleClose = async (ticketId: number) => {
    if (confirm('Close this ticket?')) {
      await closeTicket.mutateAsync(ticketId);
      refetch();
      setShowDetailModal(false);
    }
  };

  const viewTicketDetail = (ticket: SupportTicket) => {
    setSelectedTicketId(ticket.id);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: TicketStatus) => {
    const config = {
      OPEN: { color: 'bg-blue-100 text-blue-700', icon: AlertCircle, label: 'Open' },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'In Progress' },
      RESOLVED: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Resolved' },
      CLOSED: { color: 'bg-gray-100 text-gray-700', icon: CheckCircle2, label: 'Closed' },
    };

    const { color, icon: Icon, label } = config[status] || config.OPEN;
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const config = {
      LOW: 'bg-gray-100 text-gray-700',
      MEDIUM: 'bg-blue-100 text-blue-700',
      HIGH: 'bg-orange-100 text-orange-700',
      URGENT: 'bg-red-100 text-red-700',
    };

    return (
      <Badge className={config[priority] || config.MEDIUM}>
        {priority.charAt(0) + priority.slice(1).toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-600 mt-1">Manage customer support requests</p>
        </div>
        <Button
          className="bg-brand-600 hover:bg-brand-700"
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
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
              <p className="text-2xl font-bold text-blue-600">
                {statsLoading ? '...' : stats?.open_tickets || 0}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {statsLoading ? '...' : stats?.in_progress_tickets || 0}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {statsLoading ? '...' : stats?.resolved_tickets || 0}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Urgent</p>
              <p className="text-2xl font-bold text-red-600">
                {statsLoading ? '...' : stats?.urgent_tickets || 0}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets by subject or ticket number..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">Ticket #</th>
                <th className="pb-3 font-medium">Subject</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Created</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ticketsLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    Loading tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="py-12 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-900 mb-1">No tickets found</p>
                      <p className="text-xs text-gray-500 mb-4">
                        {searchTerm || filterStatus !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Create your first support ticket'}
                      </p>
                      {!searchTerm && filterStatus === 'all' && (
                        <Button
                          variant="outline"
                          className="text-brand-600 border-brand-600"
                          onClick={() => {
                            resetForm();
                            setShowCreateModal(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Ticket
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-mono text-sm text-gray-600">{ticket.ticket_number}</td>
                    <td className="py-3">
                      <div className="font-medium text-gray-900">{ticket.subject}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {ticket.description}
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600">User {ticket.user_id}</td>
                    <td className="py-3">{getPriorityBadge(ticket.priority)}</td>
                    <td className="py-3">{getStatusBadge(ticket.status)}</td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-brand-600 hover:text-brand-700"
                        onClick={() => viewTicketDetail(ticket)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!ticketsLoading && tickets.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {tickets.length} of {totalTickets} tickets
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Create New Ticket</h2>

            <form className="space-y-6" onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID<span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter user ID"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Input
                  placeholder="e.g., Technical, Billing, General"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject<span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Brief description of the issue"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description<span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full min-h-[120px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Detailed description of the issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={createTicket.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700"
                  disabled={createTicket.isPending}
                >
                  {createTicket.isPending ? 'Creating...' : 'Create Ticket'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Ticket {selectedTicket.ticket_number} • User {selectedTicket.user_id}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="flex flex-wrap gap-4">
                {getStatusBadge(selectedTicket.status)}
                {getPriorityBadge(selectedTicket.priority)}
                {selectedTicket.category && (
                  <Badge variant="outline">{selectedTicket.category}</Badge>
                )}
              </div>

              {/* Description */}
              <Card className="p-4 bg-gray-50">
                <p className="text-sm text-gray-700">{selectedTicket.description}</p>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(selectedTicket.id)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                )}
                {selectedTicket.status !== 'CLOSED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClose(selectedTicket.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close Ticket
                  </Button>
                )}
              </div>

              {/* Messages section would go here - requires backend support for fetching messages */}
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Messages</h3>
                <p className="text-sm text-gray-500 mb-4">Ticket messaging coming soon...</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
