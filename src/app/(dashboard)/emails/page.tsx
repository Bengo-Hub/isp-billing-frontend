'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, Search, Download, Plus, MoreHorizontal, Eye, FileText, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import {
  useEmails,
  useSendEmail,
  useEmailTemplates,
  useCreateEmailTemplate,
  Email,
  EmailStatus,
} from '@/features/emails/api';

export default function EmailsPage() {
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Form state for compose email
  const [formData, setFormData] = useState({
    to_email: '',
    to_name: '',
    cc: '',
    bcc: '',
    subject: '',
    body_text: '',
    body_html: '',
  });

  // Template form state
  const [templateData, setTemplateData] = useState({
    name: '',
    subject: '',
    body_html: '',
    body_text: '',
  });

  // Fetch emails with filters
  const { data: emailsData, isLoading: emailsLoading, refetch } = useEmails({
    page,
    size: pageSize,
    status: filterStatus !== 'all' ? (filterStatus as EmailStatus) : undefined,
    search: searchTerm || undefined,
  });

  // Fetch email templates
  const { data: templates, isLoading: templatesLoading } = useEmailTemplates();

  // Mutations
  const sendEmail = useSendEmail();
  const createTemplate = useCreateEmailTemplate();

  const emails = emailsData?.emails || [];
  const totalEmails = emailsData?.total || 0;

  // Calculate stats from emails
  const stats = {
    totalSent: emails.filter(e => e.status === 'SENT' || e.status === 'DELIVERED').length,
    pending: emails.filter(e => e.status === 'PENDING').length,
    failed: emails.filter(e => e.status === 'FAILED' || e.status === 'BOUNCED').length,
    opened: emails.filter(e => e.status === 'OPENED' || e.status === 'CLICKED').length,
  };

  const resetForm = () => {
    setFormData({
      to_email: '',
      to_name: '',
      cc: '',
      bcc: '',
      subject: '',
      body_text: '',
      body_html: '',
    });
  };

  const resetTemplateForm = () => {
    setTemplateData({
      name: '',
      subject: '',
      body_html: '',
      body_text: '',
    });
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.to_email || !formData.subject) {
      return;
    }

    await sendEmail.mutateAsync({
      to_email: formData.to_email,
      to_name: formData.to_name || undefined,
      cc: formData.cc || undefined,
      bcc: formData.bcc || undefined,
      subject: formData.subject,
      body_text: formData.body_text || undefined,
      body_html: formData.body_html || undefined,
    });

    resetForm();
    setShowComposeModal(false);
    refetch();
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateData.name || !templateData.subject || !templateData.body_html) {
      return;
    }

    await createTemplate.mutateAsync(templateData);
    resetTemplateForm();
    refetch();
  };

  const getStatusBadge = (status: EmailStatus) => {
    const config = {
      PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
      SENT: { color: 'bg-blue-100 text-blue-700', icon: Send, label: 'Sent' },
      DELIVERED: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Delivered' },
      FAILED: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
      BOUNCED: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Bounced' },
      OPENED: { color: 'bg-purple-100 text-purple-700', icon: Eye, label: 'Opened' },
      CLICKED: { color: 'bg-pink-100 text-pink-700', icon: Eye, label: 'Clicked' },
    };

    const { color, icon: Icon, label } = config[status] || config.PENDING;
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Communications</h1>
          <p className="text-sm text-gray-600 mt-1">Send and manage customer emails</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplatesModal(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button
            className="bg-pink-600 hover:bg-pink-700"
            onClick={() => {
              resetForm();
              setShowComposeModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Compose Email
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Sent/Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalSent}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Opened</p>
              <p className="text-2xl font-bold text-purple-600">{stats.opened}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search emails by recipient or subject..."
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
            <option value="PENDING">Pending</option>
            <option value="SENT">Sent</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
            <option value="BOUNCED">Bounced</option>
            <option value="OPENED">Opened</option>
            <option value="CLICKED">Clicked</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Emails Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">Recipient</th>
                <th className="pb-3 font-medium">Subject</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Sent</th>
                <th className="pb-3 font-medium">Delivered</th>
                <th className="pb-3 font-medium">Opened</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {emailsLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    Loading emails...
                  </td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="py-12 text-center">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-900 mb-1">No emails yet</p>
                      <p className="text-xs text-gray-500 mb-4">
                        {searchTerm || filterStatus !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Compose your first email to get started'}
                      </p>
                      {!searchTerm && filterStatus === 'all' && (
                        <Button
                          variant="outline"
                          className="text-pink-600 border-pink-600"
                          onClick={() => {
                            resetForm();
                            setShowComposeModal(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Compose Email
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                emails.map((email) => (
                  <tr key={email.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {email.to_name || email.to_email}
                        </span>
                        {email.to_name && (
                          <span className="text-xs text-gray-500">{email.to_email}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-900">{email.subject}</td>
                    <td className="py-3">{getStatusBadge(email.status)}</td>
                    <td className="py-3 text-sm text-gray-600">
                      {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {email.delivered_at ? new Date(email.delivered_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3">
                      {email.opened_at ? (
                        <Badge className="bg-green-100 text-green-700">
                          <Eye className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!emailsLoading && emails.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {emails.length} of {totalEmails} emails
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

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Compose Email</h2>

            <form className="space-y-6" onSubmit={handleSendEmail}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email<span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="recipient@example.com"
                    value={formData.to_email}
                    onChange={(e) => setFormData({ ...formData, to_email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={formData.to_name}
                    onChange={(e) => setFormData({ ...formData, to_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CC (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="cc@example.com"
                    value={formData.cc}
                    onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BCC (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="bcc@example.com"
                    value={formData.bcc}
                    onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject<span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Plain Text)
                </label>
                <textarea
                  className="w-full h-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Enter your email message here..."
                  value={formData.body_text}
                  onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (HTML)
                </label>
                <textarea
                  className="w-full h-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono"
                  placeholder="<p>HTML content here...</p>"
                  value={formData.body_html}
                  onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">HTML version for rich formatting</p>
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowComposeModal(false);
                    resetForm();
                  }}
                  disabled={sendEmail.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700"
                  disabled={sendEmail.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendEmail.isPending ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Email Templates</h2>

            {templatesLoading ? (
              <div className="py-12 text-center text-gray-500">Loading templates...</div>
            ) : templates && templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {templates.map((template: any) => (
                  <Card key={template.id} className="p-4 hover:bg-gray-50 cursor-pointer border-2 hover:border-pink-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{template.subject}</p>
                      </div>
                      <FileText className="h-5 w-5 text-pink-600" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">No templates yet</p>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Create New Template</h3>
              <form className="space-y-4" onSubmit={handleCreateTemplate}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Welcome Email"
                    value={templateData.name}
                    onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject<span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Email subject"
                    value={templateData.subject}
                    onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Content<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono"
                    placeholder="<p>Template HTML content...</p>"
                    value={templateData.body_html}
                    onChange={(e) => setTemplateData({ ...templateData, body_html: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTemplatesModal(false)}
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    className="bg-pink-600 hover:bg-pink-700"
                    disabled={createTemplate.isPending}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {createTemplate.isPending ? 'Creating...' : 'Create Template'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
