'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Edit,
  Trash2,
  UserCheck,
  Filter,
  MoreHorizontal,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useConvertLead,
  useAssignLead,
  Lead,
  LeadStatus,
  LeadSource,
} from '@/features/leads/api';

export default function LeadsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    source: '' as LeadSource,
    notes: '',
    estimated_value: '',
  });

  // Fetch leads with filters
  const { data: leadsData, isLoading: leadsLoading, refetch } = useLeads({
    page,
    size: pageSize,
    status: statusFilter !== 'all' ? (statusFilter as LeadStatus) : undefined,
    source: sourceFilter !== 'all' ? (sourceFilter as LeadSource) : undefined,
    search: searchTerm || undefined,
  });

  // Mutations
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLead();

  const leads = leadsData?.leads || [];
  const totalLeads = leadsData?.total || 0;

  // Calculate stats from leads
  const stats = {
    total: totalLeads,
    new: leads.filter(l => l.status === 'NEW').length,
    contacted: leads.filter(l => l.status === 'CONTACTED' || l.status === 'QUALIFIED').length,
    converted: leads.filter(l => l.status === 'CONVERTED').length,
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      source: '' as LeadSource,
      notes: '',
      estimated_value: '',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.source) {
      return;
    }

    await createLead.mutateAsync({
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      source: formData.source,
      notes: formData.notes || undefined,
      estimated_value: formData.estimated_value ? Number(formData.estimated_value) : undefined,
    });

    resetForm();
    setShowCreateModal(false);
    refetch();
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      address: lead.address || '',
      city: lead.city || '',
      source: lead.source,
      notes: lead.notes || '',
      estimated_value: lead.estimated_value?.toString() || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !formData.name) {
      return;
    }

    await updateLead.mutateAsync({
      id: selectedLead.id,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      notes: formData.notes || undefined,
      estimated_value: formData.estimated_value ? Number(formData.estimated_value) : undefined,
    });

    resetForm();
    setShowEditModal(false);
    setSelectedLead(null);
    refetch();
  };

  const handleDelete = async (leadId: number) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      await deleteLead.mutateAsync(leadId);
      refetch();
    }
  };

  const handleConvert = async (leadId: number) => {
    if (confirm('Convert this lead to a customer?')) {
      await convertLead.mutateAsync(leadId);
      refetch();
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    const statusConfig = {
      NEW: { color: 'bg-blue-100 text-blue-700', label: 'New' },
      CONTACTED: { color: 'bg-purple-100 text-purple-700', label: 'Contacted' },
      QUALIFIED: { color: 'bg-yellow-100 text-yellow-700', label: 'Qualified' },
      PROPOSAL: { color: 'bg-orange-100 text-orange-700', label: 'Proposal' },
      NEGOTIATION: { color: 'bg-brand-100 text-brand-700', label: 'Negotiation' },
      CONVERTED: { color: 'bg-green-100 text-green-700', label: 'Converted' },
      LOST: { color: 'bg-gray-100 text-gray-700', label: 'Lost' },
    };

    const config = statusConfig[status] || statusConfig.NEW;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getSourceBadge = (source: LeadSource) => {
    return <Badge variant="outline" className="capitalize">{source.toLowerCase().replace('_', ' ')}</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-600 mt-1">Manage potential customers and prospects</p>
        </div>
        <Button
          className="bg-brand-600 hover:bg-brand-700"
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">Total Leads</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">New</div>
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">In Progress</div>
          <div className="text-2xl font-bold text-purple-600">{stats.contacted}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">Converted</div>
          <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads by name, phone, or email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>
          <select
            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
            <option value="SOCIAL_MEDIA">Social Media</option>
            <option value="ADVERTISEMENT">Advertisement</option>
            <option value="WALK_IN">Walk-in</option>
            <option value="PHONE_CALL">Phone Call</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Contact</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Value</th>
                <th className="pb-3 font-medium">Created</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {leadsLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="py-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">No leads yet</p>
                      <p className="text-xs text-gray-500 mb-4">Start capturing potential customers</p>
                      <Button
                        variant="outline"
                        className="text-brand-600 border-brand-600"
                        onClick={() => {
                          resetForm();
                          setShowCreateModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add your first lead
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-brand-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{lead.name}</div>
                          {lead.city && <div className="text-xs text-gray-500">{lead.city}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-sm space-y-1">
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{lead.company || '-'}</td>
                    <td className="py-3">{getSourceBadge(lead.source)}</td>
                    <td className="py-3">{getStatusBadge(lead.status)}</td>
                    <td className="py-3 text-sm font-medium">
                      {lead.estimated_value ? `KES ${lead.estimated_value.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {lead.status !== 'CONVERTED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConvert(lead.id)}
                            title="Convert to customer"
                          >
                            <UserCheck className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(lead)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!leadsLoading && leads.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {leads.length} of {totalLeads} leads
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

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Add New Lead</h2>

            <form className="space-y-6" onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    placeholder="0712345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                    required
                  >
                    <option value="">Select source</option>
                    <option value="WEBSITE">Website</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="ADVERTISEMENT">Advertisement</option>
                    <option value="WALK_IN">Walk-in</option>
                    <option value="PHONE_CALL">Phone Call</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <Input
                    placeholder="Company name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Value (KES)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Additional notes about this lead..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  disabled={createLead.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700"
                  disabled={createLead.isPending}
                >
                  {createLead.isPending ? 'Adding...' : 'Add Lead'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Edit Lead</h2>

            <form className="space-y-6" onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    placeholder="0712345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <Input
                    placeholder="Company name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Value (KES)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Additional notes about this lead..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLead(null);
                    resetForm();
                  }}
                  disabled={updateLead.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700"
                  disabled={updateLead.isPending}
                >
                  {updateLead.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
