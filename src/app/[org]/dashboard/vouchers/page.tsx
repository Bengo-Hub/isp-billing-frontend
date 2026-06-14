'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket, Search, Download, Plus, Copy, Trash2, Pencil } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useVouchers, useVoucherStats, useGenerateVouchers, useDeleteVoucher, useUpdateVoucher, type VoucherStatus, type VoucherItem } from '@/features/vouchers/api';
import { usePlans } from '@/features/packages/api';
import { toast } from 'sonner';

export default function VouchersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | ''>('');
  const [page, setPage] = useState(1);

  // Generate form state
  const [formPlanId, setFormPlanId] = useState<number>(0);
  const [formCount, setFormCount] = useState(10);
  const [formCodeFormat, setFormCodeFormat] = useState('XXXX-XXXX-XXXX');
  const [formExpiresInDays, setFormExpiresInDays] = useState<string>('');

  // Edit modal state
  const [editVoucher, setEditVoucher] = useState<VoucherItem | null>(null);
  const [editStatus, setEditStatus] = useState<VoucherStatus>('active');
  const [editExpiresAt, setEditExpiresAt] = useState('');

  const { data: voucherData, isLoading } = useVouchers({
    page,
    size: 20,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  });
  const { data: stats } = useVoucherStats();
  const { data: plansData } = usePlans({ page: 1, size: 100 });
  const generateVouchers = useGenerateVouchers();
  const deleteVoucher = useDeleteVoucher();
  const updateVoucher = useUpdateVoucher();

  const vouchers = voucherData?.vouchers ?? [];
  const totalPages = voucherData?.pages ?? 0;

  const copyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlanId) {
      toast.error('Please select a plan');
      return;
    }
    generateVouchers.mutate(
      {
        plan_id: formPlanId,
        count: formCount,
        code_format: formCodeFormat || undefined,
        expires_in_days: formExpiresInDays ? Number(formExpiresInDays) : undefined,
      },
      { onSuccess: () => setShowCreateModal(false) }
    );
  };

  const openEdit = (v: VoucherItem) => {
    setEditVoucher(v);
    setEditStatus((v.status as VoucherStatus) || 'active');
    setEditExpiresAt(v.expires_at ? v.expires_at.slice(0, 10) : '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVoucher) return;
    updateVoucher.mutate(
      {
        voucherId: editVoucher.id,
        data: {
          status: editStatus,
          // inclusive end-of-day; omit when cleared
          expires_at: editExpiresAt ? new Date(editExpiresAt + 'T23:59:59').toISOString() : undefined,
        },
      },
      { onSuccess: () => setEditVoucher(null) }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'used': return 'bg-blue-100 text-blue-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Vouchers</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Ticket className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Vouchers</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-brand-600 hover:bg-brand-700" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Vouchers
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-linear-to-br from-brand-400 to-brand-500 text-white">
          <div className="text-sm opacity-90 mb-1">Total</div>
          <div className="text-2xl font-bold">{stats?.total_vouchers ?? 0}</div>
        </Card>
        <Card className="p-5 bg-linear-to-br from-green-400 to-green-600 text-white">
          <div className="text-sm opacity-90 mb-1">Active</div>
          <div className="text-2xl font-bold">{stats?.active_vouchers ?? 0}</div>
        </Card>
        <Card className="p-5 bg-linear-to-br from-blue-400 to-blue-600 text-white">
          <div className="text-sm opacity-90 mb-1">Used</div>
          <div className="text-2xl font-bold">{stats?.used_vouchers ?? 0}</div>
        </Card>
        <Card className="p-5 bg-linear-to-br from-red-400 to-red-600 text-white">
          <div className="text-sm opacity-90 mb-1">Expired</div>
          <div className="text-2xl font-bold">{stats?.expired_vouchers ?? 0}</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by code or username..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as VoucherStatus | ''); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="used">Used</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Vouchers Table */}
      <Card className="p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">Code</th>
                <th className="pb-3 font-medium hidden md:table-cell">Plan</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Username</th>
                <th className="pb-3 font-medium hidden lg:table-cell">Bandwidth</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Created</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Ticket className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    No vouchers found
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-brand-600">{v.code}</span>
                        <button onClick={() => copyCode(v.code)} className="text-gray-400 hover:text-brand-600">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-sm hidden md:table-cell">{v.plan_name ?? '-'}</td>
                    <td className="py-3 text-sm hidden sm:table-cell">{v.hotspot_username ?? '-'}</td>
                    <td className="py-3 text-sm hidden lg:table-cell">{v.bandwidth_limit ?? '-'}</td>
                    <td className="py-3">
                      <Badge className={getStatusColor(v.status)}>{v.status}</Badge>
                    </td>
                    <td className="py-3 text-sm hidden sm:table-cell">
                      {v.created_at ? new Date(v.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(v)} title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Delete voucher ${v.code}?`)) deleteVoucher.mutate(v.id); }} title="Delete">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} ({voucherData?.total ?? 0} total)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Generate Vouchers Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-6">Generate Vouchers</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan<span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                  value={formPlanId}
                  onChange={(e) => setFormPlanId(Number(e.target.value))}
                  required
                >
                  <option value={0}>Select a plan...</option>
                  {(plansData?.items ?? []).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} - Ksh {p.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Vouchers
                </label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={formCount}
                  onChange={(e) => setFormCount(Number(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">Generate 1-500 voucher codes at once</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code Format</label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                  value={formCodeFormat}
                  onChange={(e) => setFormCodeFormat(e.target.value)}
                >
                  <option value="XXXX-XXXX-XXXX">XXXX-XXXX-XXXX (12 chars)</option>
                  <option value="XXXX-XXXX">XXXX-XXXX (8 chars)</option>
                  <option value="XXXXXX">XXXXXX (6 chars)</option>
                  <option value="NNNN-NNNN">NNNN-NNNN (digits only)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">X = letters &amp; digits, N = digits only</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Redeem Within (days)</label>
                <Input
                  type="number"
                  min={1}
                  max={3650}
                  placeholder="No expiry"
                  value={formExpiresInDays}
                  onChange={(e) => setFormExpiresInDays(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Optional shelf-life before redemption. The plan still sets the access duration once redeemed.</p>
              </div>
              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={generateVouchers.isPending}>
                  {generateVouchers.isPending ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Voucher Modal */}
      {editVoucher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-1">Edit Voucher</h2>
            <p className="text-sm text-gray-500 mb-6 font-mono">{editVoucher.code}{editVoucher.plan_name ? ` · ${editVoucher.plan_name}` : ''}</p>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as VoucherStatus)}
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled (disable)</option>
                  <option value="used" disabled>Used (set automatically on redemption)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Redeem-By Date</label>
                <Input type="date" value={editExpiresAt} onChange={(e) => setEditExpiresAt(e.target.value)} />
                <p className="text-xs text-gray-500 mt-1">Leave blank for no pre-use expiry.</p>
              </div>
              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setEditVoucher(null)}>Cancel</Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={updateVoucher.isPending}>
                  {updateVoucher.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
