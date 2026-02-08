'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Message, useMessages, useTenantSmsTopUp, useSendSMS } from '@/features/sms/api';
import { useUsers } from '@/features/users/api';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type RecipientType = 'all_users' | 'groups' | 'mikrotiks' | 'specific_users';

export default function MessagesPage() {
  const [activeChannel, setActiveChannel] = useState<'all' | 'sms'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpEmail, setTopUpEmail] = useState('');
  const [viewMessage, setViewMessage] = useState<Message | null>(null);

  // Create Message dialog state
  const [createMessageOpen, setCreateMessageOpen] = useState(false);
  const [messageChannel, setMessageChannel] = useState<'sms'>('sms');
  const [recipientType, setRecipientType] = useState<RecipientType>('specific_users');
  const [selectedUsers, setSelectedUsers] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');

  // Fetch messages from API
  const { data, isLoading, refetch } = useMessages({
    page,
    page_size: 20,
    search: searchQuery || undefined,
    channel: activeChannel === 'sms' ? 'sms' : undefined,
  });

  // Fetch users for the dropdown
  const { data: usersData } = useUsers({ page: 1, size: 100 });
  const usersWithPhone = (usersData?.users || []).filter(u => u.phone);

  const messages = data?.messages || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  // Top-up mutation (Paystack) - tenant-aware
  const topUpMutation = useTenantSmsTopUp();
  const sendSmsMutation = useSendSMS();

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await topUpMutation.mutateAsync({
        amount: parseFloat(topUpAmount),
        email: 'codevertexitsolutions@gmail.com',
      });
      // Note: On success, the hook redirects to Paystack checkout
      setTopUpOpen(false);
      setTopUpAmount('');
    } catch (error: any) {
      toast.error(error?.message || 'Top-up failed');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (recipientType === 'specific_users' && !selectedUsers) {
      toast.error('Please select a user');
      return;
    }

    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await sendSmsMutation.mutateAsync({
        to_phone: selectedUsers,
        message: messageContent,
      });
      setCreateMessageOpen(false);
      setMessageContent('');
      setSelectedUsers('');
      refetch();
    } catch (error: any) {
      // Error is already handled by the mutation hook
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">View and filter messages by channel (SMS or WhatsApp), or send new messages.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setTopUpOpen(true)}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M12 12v5M9 15h6" />
            </svg>
            Top Up SMS
          </Button>
          <Button className="bg-brand-600 hover:bg-brand-700 gap-2" onClick={() => setCreateMessageOpen(true)}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Send message
          </Button>
        </div>

        {/* Create Message Dialog */}
        <Dialog open={createMessageOpen} onOpenChange={setCreateMessageOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader className="flex flex-row items-start justify-between">
              <div>
                <DialogTitle>Create Message</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">Compose and send messages via SMS or WhatsApp to selected recipients.</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setCreateMessageOpen(false)}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Go to sms
              </Button>
            </DialogHeader>
            <form onSubmit={handleSendMessage} className="space-y-6 mt-4">
              {/* Channel */}
              <div>
                <label className="text-sm font-medium text-gray-900">Channel</label>
                <div className="mt-2">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="channel"
                      value="sms"
                      checked={messageChannel === 'sms'}
                      onChange={() => setMessageChannel('sms')}
                      className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">SMS</span>
                  </label>
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="text-sm font-medium text-gray-900">Recipients</label>
                <div className="mt-2 flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="recipient"
                      value="all_users"
                      checked={recipientType === 'all_users'}
                      onChange={() => setRecipientType('all_users')}
                      className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">All users</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="recipient"
                      value="groups"
                      checked={recipientType === 'groups'}
                      onChange={() => setRecipientType('groups')}
                      className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">Groups / Segments</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="recipient"
                      value="mikrotiks"
                      checked={recipientType === 'mikrotiks'}
                      onChange={() => setRecipientType('mikrotiks')}
                      className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">Mikrotiks</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="recipient"
                      value="specific_users"
                      checked={recipientType === 'specific_users'}
                      onChange={() => setRecipientType('specific_users')}
                      className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">Specific users</span>
                  </label>
                </div>
              </div>

              {/* Users dropdown - shown when specific_users is selected */}
              {recipientType === 'specific_users' && (
                <div>
                  <label className="text-sm font-medium text-gray-900">Users</label>
                  <select
                    value={selectedUsers}
                    onChange={(e) => setSelectedUsers(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select a user</option>
                    {usersWithPhone.map((user) => (
                      <option key={user.id} value={user.phone}>
                        {user.first_name} {user.last_name} ({user.phone})
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Only users with valid phone numbers are shown</p>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  required
                  rows={4}
                  className="mt-1 flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Type your message here..."
                />
                <p className="text-sm text-brand-600 mt-2">
                  Use the following variables to personalize your message:
                </p>
                <p className="text-sm text-gray-500">
                  @first_name, @last_name, @email, @phone, @package_name, @expiry_at, @account_number, @paybill, @till_number, @password, @username
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-brand-600 hover:bg-brand-700">
                  Send message
                </Button>
                <Button type="button" variant="outline" onClick={() => setCreateMessageOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Top Up SMS Dialog */}
        <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Top Up SMS</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  required
                  min="1"
                  className="mt-1"
                />
              </div>
              {/* Email handled automatically */}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setTopUpOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700"
                  disabled={topUpMutation.isPending}
                >
                  {topUpMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Top Up
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Message Dialog */}
        <Dialog open={!!viewMessage} onOpenChange={(open) => !open && setViewMessage(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>View Message</DialogTitle>
            </DialogHeader>
            {viewMessage && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Channel</label>
                  <p className="text-sm font-medium text-gray-900">{viewMessage.channel}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">User</label>
                  <p className="text-sm font-medium text-gray-900">{viewMessage.user || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="text-sm font-medium text-gray-900">{viewMessage.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Message</label>
                  <p className="text-sm font-medium text-gray-900">{viewMessage.message}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Cost</label>
                  <p className="text-sm font-medium text-gray-900">{viewMessage.cost}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Sent At</label>
                  <p className="text-sm font-medium text-gray-900">{viewMessage.sent}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewMessage(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Channel Tabs */}
      <div className="flex items-center gap-4 border-b mb-6">
        <button
          onClick={() => { setActiveChannel('all'); setPage(1); }}
          className={`flex items-center gap-2 py-3 px-1 -mb-px border-b-2 text-sm font-medium transition-colors ${
            activeChannel === 'all'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          All
        </button>
        <button
          onClick={() => { setActiveChannel('sms'); setPage(1); }}
          className={`flex items-center gap-2 py-3 px-1 -mb-px border-b-2 text-sm font-medium transition-colors ${
            activeChannel === 'sms'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M12 18h.01" />
          </svg>
          SMS
        </button>
      </div>

      {/* Messages Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b flex justify-end">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-9 w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {messages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{msg.user || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{msg.phone}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800">
                          {msg.channel}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-md">
                        <p className="line-clamp-3">{msg.message}</p>
                      </td>
                      <td className="px-4 py-4">
                        {msg.delivered ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">KSH {msg.cost.toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{msg.sent}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setViewMessage(msg)}
                          className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {messages.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>No messages found</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} messages
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
