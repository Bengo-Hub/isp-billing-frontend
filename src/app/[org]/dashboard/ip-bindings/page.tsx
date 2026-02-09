'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    useCreateIPBinding,
    useDeleteIPBinding,
    useIPBindings,
    useUpdateIPBinding,
    type IPBinding,
    type IPBindingCreate,
} from '@/features/ip-bindings/api';
import { useRouters, type RouterItem } from '@/features/routers/api';
import {
    Loader2,
    Network,
    Pencil,
    Plus,
    RefreshCw,
    ShieldBan,
    ShieldCheck,
    ShieldOff,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const BINDING_TYPES = [
  { value: 'regular', label: 'Regular', icon: ShieldCheck, color: 'text-green-600 bg-green-50' },
  { value: 'bypassed', label: 'Bypassed', icon: ShieldOff, color: 'text-blue-600 bg-blue-50' },
  { value: 'blocked', label: 'Blocked', icon: ShieldBan, color: 'text-red-600 bg-red-50' },
] as const;

const emptyForm: IPBindingCreate = {
  address: '',
  mac_address: '',
  to_address: '',
  server: '',
  type: 'regular',
  comment: '',
  disabled: false,
};

export default function IPBindingsPage() {
  const [selectedRouter, setSelectedRouter] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBinding, setEditingBinding] = useState<IPBinding | null>(null);
  const [form, setForm] = useState<IPBindingCreate>(emptyForm);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: routersData, isLoading: routersLoading } = useRouters();
  const routers: RouterItem[] = routersData?.items || [];
  const onlineRouters = useMemo(() => routers.filter((r) => r.status === 'online'), [routers]);

  const { data: bindings = [], isLoading: bindingsLoading, refetch } = useIPBindings(selectedRouter);
  const createMutation = useCreateIPBinding(selectedRouter || 0);
  const updateMutation = useUpdateIPBinding(selectedRouter || 0);
  const deleteMutation = useDeleteIPBinding(selectedRouter || 0);

  // Auto-select first online router
  if (!selectedRouter && onlineRouters.length > 0) {
    setSelectedRouter(onlineRouters[0].id);
  }

  const filtered = useMemo(() => {
    if (!search) return bindings;
    const q = search.toLowerCase();
    return bindings.filter(
      (b) =>
        b.address?.toLowerCase().includes(q) ||
        b.mac_address?.toLowerCase().includes(q) ||
        b.comment?.toLowerCase().includes(q)
    );
  }, [bindings, search]);

  const openCreate = () => {
    setEditingBinding(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (b: IPBinding) => {
    setEditingBinding(b);
    setForm({
      address: b.address || '',
      mac_address: b.mac_address || '',
      to_address: b.to_address || '',
      server: b.server || '',
      type: b.type,
      comment: b.comment || '',
      disabled: b.disabled,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingBinding) {
      updateMutation.mutate(
        { bindingId: editingBinding.id, data: form },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, { onSuccess: () => setDeleteConfirm(null) });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IP Bindings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage hotspot IP bindings (MAC ↔ IP) on your MikroTik routers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={!selectedRouter}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate} disabled={!selectedRouter}>
            <Plus className="h-4 w-4 mr-1" /> Add Binding
          </Button>
        </div>
      </div>

      {/* Router Selector */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Router</Label>
          {routersLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : onlineRouters.length === 0 ? (
            <p className="text-sm text-gray-500">No online routers available</p>
          ) : (
            <select
              value={selectedRouter || ''}
              onChange={(e) => setSelectedRouter(Number(e.target.value))}
              className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {onlineRouters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.ip_address})
                </option>
              ))}
            </select>
          )}
          <Input
            placeholder="Search by IP, MAC, or comment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:ml-auto sm:w-64"
          />
        </div>
      </Card>

      {/* Bindings Table */}
      <Card className="overflow-hidden">
        {bindingsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : !selectedRouter ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Network className="h-10 w-10 mb-3 text-gray-300" />
            <p className="text-sm">Select a router to view IP bindings</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Network className="h-10 w-10 mb-3 text-gray-300" />
            <p className="text-sm">{search ? 'No bindings match your search' : 'No IP bindings on this router'}</p>
            {!search && (
              <Button size="sm" className="mt-3" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" /> Create First Binding
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">IP Address</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">MAC Address</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Server</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Comment</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((b) => {
                  const bt = BINDING_TYPES.find((t) => t.value === b.type) || BINDING_TYPES[0];
                  const Icon = bt.icon;
                  return (
                    <tr key={b.id} className={`hover:bg-gray-50 ${b.disabled ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 font-mono">{b.address || '—'}</td>
                      <td className="px-4 py-3 font-mono">{b.mac_address || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${bt.color}`}>
                          <Icon className="h-3 w-3" /> {bt.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{b.server || 'all'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-50 truncate">{b.comment || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {deleteConfirm === b.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(b.id)}
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm'}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(b.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBinding ? 'Edit IP Binding' : 'New IP Binding'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">IP Address</Label>
                <Input
                  value={form.address || ''}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="192.168.88.100"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">MAC Address</Label>
                <Input
                  value={form.mac_address || ''}
                  onChange={(e) => setForm({ ...form, mac_address: e.target.value })}
                  placeholder="AA:BB:CC:DD:EE:FF"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Translate-to Address</Label>
                <Input
                  value={form.to_address || ''}
                  onChange={(e) => setForm({ ...form, to_address: e.target.value })}
                  placeholder="Optional"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Server</Label>
                <Input
                  value={form.server || ''}
                  onChange={(e) => setForm({ ...form, server: e.target.value })}
                  placeholder="all (default)"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Binding Type</Label>
              <div className="flex gap-2">
                {BINDING_TYPES.map((bt) => {
                  const Icon = bt.icon;
                  return (
                    <button
                      key={bt.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: bt.value })}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                        form.type === bt.value
                          ? `${bt.color} border-current`
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {bt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Comment</Label>
              <Input
                value={form.comment || ''}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Optional description"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving || (!form.address && !form.mac_address)}
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingBinding ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
