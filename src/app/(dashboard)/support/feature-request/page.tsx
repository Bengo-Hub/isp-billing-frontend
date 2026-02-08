'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Bug, CheckCircle, Clock, FileText, Lightbulb, Send } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTickets, useCreateTicket, type TicketPriority, type SupportTicket } from '@/features/tickets/api';

export default function FeatureRequestPage() {
  const [activeTab, setActiveTab] = useState<'feature' | 'bug'>('feature');
  const [newRequest, setNewRequest] = useState({ title: '', description: '', priority: 'MEDIUM' as TicketPriority });

  // Fetch tickets filtered by category
  const category = activeTab === 'feature' ? 'feature' : 'bug';
  const { data: ticketsData, isLoading } = useTickets({ category, size: 50 });
  const createTicket = useCreateTicket();

  const requests: SupportTicket[] = useMemo(() => {
    if (!ticketsData?.tickets) return [];
    return ticketsData.tickets;
  }, [ticketsData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH': case 'URGENT':
        return <Badge className="bg-red-100 text-red-800">{priority}</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800"><FileText className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case 'CLOSED':
        return <Badge className="bg-gray-200 text-gray-600">Closed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.title.trim()) return;
    createTicket.mutate(
      {
        user_id: 0,
        subject: newRequest.title,
        description: newRequest.description,
        priority: newRequest.priority,
        category,
      },
      {
        onSuccess: () => {
          setNewRequest({ title: '', description: '', priority: 'MEDIUM' });
        },
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        {activeTab === 'feature' ? (
          <Lightbulb className="h-8 w-8 text-brand-600" />
        ) : (
          <Bug className="h-8 w-8 text-brand-600" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'feature' ? 'Feature Requests' : 'Bug Reports'}
          </h1>
          <p className="text-gray-600">
            {activeTab === 'feature' ? 'Suggest new features or improvements' : 'Report bugs and technical issues'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('feature')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'feature' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          Feature Requests
        </button>
        <button
          onClick={() => setActiveTab('bug')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'bug' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bug className="h-4 w-4" />
          Bug Reports
        </button>
      </div>

      {/* New Request Form */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {activeTab === 'feature' ? 'Submit Feature Request' : 'Submit Bug Report'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title<span className="text-red-500">*</span>
              </label>
              <Input
                value={newRequest.title}
                onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                placeholder={activeTab === 'feature' ? 'Feature title...' : 'Bug summary...'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value as TicketPriority }))}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newRequest.description}
              onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
              placeholder={activeTab === 'feature' ? 'Describe the feature you would like...' : 'Steps to reproduce the bug...'}
              className="w-full h-28 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm resize-none"
            />
          </div>
          <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={createTicket.isPending}>
            <Send className="h-4 w-4 mr-2" />
            {createTicket.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </Card>

      {/* Previous Requests */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Previous {activeTab === 'feature' ? 'Requests' : 'Reports'}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            No {activeTab === 'feature' ? 'feature requests' : 'bug reports'} yet
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">{req.subject}</h3>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(req.priority)}
                    {getStatusBadge(req.status)}
                  </div>
                </div>
                {req.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{req.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>#{req.ticket_number}</span>
                  <span>{formatDate(req.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Guidelines */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Feature Requests
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li> Describe the problem the feature would solve</li>
              <li> Explain how you envision it working</li>
              <li> Include any relevant examples or mockups</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Bug className="h-4 w-4 text-red-500" />
              Bug Reports
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li> Provide clear steps to reproduce the issue</li>
              <li> Include expected vs actual behavior</li>
              <li> Mention browser, device, and any error messages</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
