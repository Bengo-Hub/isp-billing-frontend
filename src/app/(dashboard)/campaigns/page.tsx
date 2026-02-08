'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Search, Download, Plus, MoreHorizontal, Eye, BarChart3, Mail, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import {
  useCampaigns,
  useCreateCampaign,
  useCampaignAnalytics,
  Campaign as APICampaign,
  CampaignType,
  CampaignStatus
} from '@/features/campaigns/api';

export default function CampaignsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Form state for create modal
  const [formData, setFormData] = useState({
    name: '',
    campaign_type: '' as CampaignType,
    message_content: '',
    email_subject: '',
    email_content: '',
    scheduled_date: '',
    send_now: true,
  });

  // Fetch campaigns with filters
  const { data: campaignsData, isLoading: campaignsLoading, refetch } = useCampaigns({
    page,
    size: pageSize,
    search: searchTerm || undefined,
  });

  // Fetch analytics for selected campaign
  const { data: analytics } = useCampaignAnalytics(selectedCampaignId || 0);

  // Create campaign mutation
  const createCampaign = useCreateCampaign();

  const campaigns = campaignsData?.campaigns || [];
  const totalCampaigns = campaignsData?.total || 0;

  // Calculate stats from campaigns
  const stats = {
    activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE' || c.status === 'SCHEDULED').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
    averageSuccessRate: campaigns.length > 0
      ? (campaigns.reduce((sum, c) => {
          const rate = c.sent_count > 0 ? (c.delivered_count / c.sent_count) * 100 : 0;
          return sum + rate;
        }, 0) / campaigns.length).toFixed(1)
      : '0'
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  const viewAnalytics = (campaign: APICampaign) => {
    setSelectedCampaignId(campaign.id);
    setShowAnalyticsModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.campaign_type) {
      return;
    }

    await createCampaign.mutateAsync({
      name: formData.name,
      campaign_type: formData.campaign_type,
      scheduled_date: formData.send_now ? undefined : formData.scheduled_date || undefined,
      message_content: formData.message_content || undefined,
      email_subject: formData.email_subject || undefined,
      email_content: formData.email_content || undefined,
    });

    // Reset form and close modal
    setFormData({
      name: '',
      campaign_type: '' as CampaignType,
      message_content: '',
      email_subject: '',
      email_content: '',
      scheduled_date: '',
      send_now: true,
    });
    setShowCreateModal(false);
    refetch();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-brand-600 hover:bg-brand-700"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-brand-400 to-brand-500 text-white">
          <div className="text-sm opacity-90 mb-2">Active Campaigns</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">{stats.activeCampaigns}</div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Currently running or scheduled</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-brand-400 to-brand-500 text-white">
          <div className="text-sm opacity-90 mb-2">Total Sent</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">{stats.totalSent.toLocaleString()}</div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Total messages sent</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-brand-400 to-brand-500 text-white">
          <div className="text-sm opacity-90 mb-2">Success Rate</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">{stats.averageSuccessRate}%</div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Average delivery success</div>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search campaigns..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="pb-3 font-medium">Campaign Name</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Recipients</th>
                <th className="pb-3 font-medium">Sent</th>
                <th className="pb-3 font-medium">Success Rate</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Created Date</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {campaignsLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    Loading campaigns...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No campaigns found
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => {
                  const successRate = campaign.sent_count > 0
                    ? ((campaign.delivered_count / campaign.sent_count) * 100)
                    : 0;

                  return (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{campaign.name}</span>
                          {campaign.scheduled_date && (
                            <span className="text-xs text-gray-500">
                              Scheduled: {new Date(campaign.scheduled_date).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="capitalize">
                          {campaign.campaign_type === 'SMS' && <MessageSquare className="h-3 w-3 mr-1" />}
                          {campaign.campaign_type === 'EMAIL' && <Mail className="h-3 w-3 mr-1" />}
                          {(campaign.campaign_type === 'BOTH' || campaign.campaign_type === 'WHATSAPP') && <Megaphone className="h-3 w-3 mr-1" />}
                          {campaign.campaign_type.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm">{campaign.recipients_count}</td>
                      <td className="py-3">
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-gray-900">{campaign.sent_count}</span>
                          <span className="text-gray-500">
                            D: {campaign.delivered_count} / F: {campaign.failed_count}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        {campaign.sent_count > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${successRate}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{successRate.toFixed(1)}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3">
                        <Badge className={
                          campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                          campaign.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-700' :
                          campaign.status === 'PAUSED' ? 'bg-gray-100 text-gray-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {campaign.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewAnalytics(campaign)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl p-6">
            <h2 className="text-xl font-bold mb-6">Create Campaign</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name<span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., March Promotion Campaign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campaign Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Type<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={formData.campaign_type}
                    onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value as CampaignType })}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="SMS">SMS Only</option>
                    <option value="EMAIL">Email Only</option>
                    <option value="BOTH">Both SMS & Email</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                </div>

                {/* Target Audience - Placeholder for now */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="all">All Customers</option>
                    <option value="active">Active Customers</option>
                    <option value="inactive">Inactive Customers</option>
                  </select>
                </div>
              </div>

              {/* Message Content */}
              {(formData.campaign_type === 'SMS' || formData.campaign_type === 'BOTH') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Message{(formData.campaign_type === 'SMS' || formData.campaign_type === 'BOTH') && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    className="w-full h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    placeholder="Enter SMS message (max 160 characters)..."
                    maxLength={160}
                    value={formData.message_content}
                    onChange={(e) => setFormData({ ...formData, message_content: e.target.value })}
                    required={formData.campaign_type === 'SMS' || formData.campaign_type === 'BOTH'}
                  />
                  <p className="text-xs text-gray-500 mt-1">{160 - formData.message_content.length} characters remaining</p>
                </div>
              )}

              {(formData.campaign_type === 'EMAIL' || formData.campaign_type === 'BOTH') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Subject{(formData.campaign_type === 'EMAIL' || formData.campaign_type === 'BOTH') && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      placeholder="Enter email subject"
                      value={formData.email_subject}
                      onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
                      required={formData.campaign_type === 'EMAIL' || formData.campaign_type === 'BOTH'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Content{(formData.campaign_type === 'EMAIL' || formData.campaign_type === 'BOTH') && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      className="w-full h-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      placeholder="Enter email content..."
                      value={formData.email_content}
                      onChange={(e) => setFormData({ ...formData, email_content: e.target.value })}
                      required={formData.campaign_type === 'EMAIL' || formData.campaign_type === 'BOTH'}
                    />
                  </div>
                </>
              )}

              {/* Schedule Options */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Scheduling
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="schedule"
                      value="now"
                      checked={formData.send_now}
                      onChange={() => setFormData({ ...formData, send_now: true })}
                      className="rounded-full border-gray-300"
                    />
                    <span className="text-sm">Send Now</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="schedule"
                      value="later"
                      checked={!formData.send_now}
                      onChange={() => setFormData({ ...formData, send_now: false })}
                      className="rounded-full border-gray-300"
                    />
                    <span className="text-sm">Schedule for Later</span>
                  </label>
                </div>
                {!formData.send_now && (
                  <Input
                    type="datetime-local"
                    className="max-w-xs"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createCampaign.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700"
                  disabled={createCampaign.isPending}
                >
                  <Megaphone className="h-4 w-4 mr-2" />
                  {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl p-6">
            <h2 className="text-xl font-bold mb-6">Campaign Analytics: {selectedCampaign.name}</h2>

            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50">
                  <div className="text-xs text-gray-600 mb-1">Total Recipients</div>
                  <div className="text-2xl font-bold text-blue-600">{selectedCampaign.recipients_count}</div>
                </Card>
                <Card className="p-4 bg-green-50">
                  <div className="text-xs text-gray-600 mb-1">Delivered</div>
                  <div className="text-2xl font-bold text-green-600">{selectedCampaign.delivered_count}</div>
                </Card>
                <Card className="p-4 bg-yellow-50">
                  <div className="text-xs text-gray-600 mb-1">Pending</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedCampaign.recipients_count - selectedCampaign.sent_count}
                  </div>
                </Card>
                <Card className="p-4 bg-red-50">
                  <div className="text-xs text-gray-600 mb-1">Failed</div>
                  <div className="text-2xl font-bold text-red-600">{selectedCampaign.failed_count}</div>
                </Card>
              </div>

              {/* Success Rate Chart */}
              <Card className="p-4">
                <h3 className="font-medium mb-4">Delivery Status</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Delivered</span>
                      <span className="font-medium">{selectedCampaign.delivered_count}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${(selectedCampaign.delivered_count / selectedCampaign.recipients_count) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Failed</span>
                      <span className="font-medium">{selectedCampaign.failed_count}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full"
                        style={{ width: `${(selectedCampaign.failed_count / selectedCampaign.recipients_count) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pending</span>
                      <span className="font-medium">{selectedCampaign.recipients_count - selectedCampaign.sent_count}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-yellow-500 h-3 rounded-full"
                        style={{ width: `${((selectedCampaign.recipients_count - selectedCampaign.sent_count) / selectedCampaign.recipients_count) * 100}%` }}
                      />
                    </div>
                  </div>
                  {selectedCampaign.opened_count > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Opened</span>
                        <span className="font-medium">{selectedCampaign.opened_count}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${(selectedCampaign.opened_count / selectedCampaign.delivered_count) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {selectedCampaign.clicked_count > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Clicked</span>
                        <span className="font-medium">{selectedCampaign.clicked_count}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-purple-500 h-3 rounded-full"
                          style={{ width: `${(selectedCampaign.clicked_count / selectedCampaign.opened_count) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Campaign Details */}
              <Card className="p-4">
                <h3 className="font-medium mb-4">Campaign Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium capitalize">{selectedCampaign.campaign_type.toLowerCase()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium capitalize">{selectedCampaign.status.toLowerCase()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedCampaign.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Delivery Rate:</span>
                    <span className="ml-2 font-medium">{analytics?.delivery_rate?.toFixed(1) || '0'}%</span>
                  </div>
                  {analytics?.open_rate !== undefined && (
                    <div>
                      <span className="text-gray-600">Open Rate:</span>
                      <span className="ml-2 font-medium">{analytics.open_rate.toFixed(1)}%</span>
                    </div>
                  )}
                  {analytics?.click_rate !== undefined && (
                    <div>
                      <span className="text-gray-600">Click Rate:</span>
                      <span className="ml-2 font-medium">{analytics.click_rate.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button variant="outline" onClick={() => setShowAnalyticsModal(false)}>
                Close
              </Button>
              <Button className="bg-brand-600 hover:bg-brand-700">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
