'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useActiveConnections, useDeleteRouter, useDisconnectUser, useRouters, useSyncRouter, useSyncRouterTime, useSyncHotspotFiles, useRegenerateWinbox, useWinboxUrl } from '@/features/routers/api';
import { Clock, Copy, Download, Eye, Monitor, MoreVertical, RefreshCw, Search, Trash2, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Format uptime seconds to MikroTik-style format (e.g., "5h18m57s", "2d3h45m")
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join('');
}

export default function RoutersPage() {
  const { data, isLoading, error, refetch } = useRouters();
  const [selected, setSelected] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Router action mutations
  const syncRouterMutation = useSyncRouter();
  const syncTimeMutation = useSyncRouterTime();
  const syncHotspotFilesMutation = useSyncHotspotFiles();
  const regenerateWinboxMutation = useRegenerateWinbox();
  const deleteRouterMutation = useDeleteRouter();

  const handleSyncRouter = (routerId: number) => {
    syncRouterMutation.mutate(routerId, {
      onSuccess: () => refetch(),
    });
  };

  const handleSyncTime = (routerId: number) => {
    syncTimeMutation.mutate(routerId);
  };

  const handleSyncHotspotFiles = (routerId: number) => {
    syncHotspotFilesMutation.mutate(routerId);
  };

  const handleRegenerateWinbox = (routerId: number) => {
    regenerateWinboxMutation.mutate(routerId);
  };

  const handleDeleteRouter = (routerId: number, routerName: string) => {
    if (confirm(`Are you sure you want to delete router "${routerName}"? This action cannot be undone.`)) {
      deleteRouterMutation.mutate(routerId, {
        onSuccess: () => refetch(),
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">MikroTik Routers</h1>
          <p className="text-gray-600 mt-1">Manage your MikroTik routers on this page.</p>
        </div>
        <Card className="p-6">
          <Skeleton className="h-64" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">MikroTik Routers</h1>
        <Card className="p-6">
          <p className="text-red-600">Error loading routers: {String(error)}</p>
        </Card>
      </div>
    );
  }

  const totalRouters = data?.items?.length ?? 0;
  const onlineRouters = data?.items?.filter((r: any) => r.status === 'online').length ?? 0;
  const offlineRouters = totalRouters - onlineRouters;

  // Filter routers based on status and search term
  const filteredRouters = data?.items?.filter((r: any) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ip_address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) ?? [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MikroTik Routers</h1>
          <p className="text-gray-600 mt-1">Manage your MikroTik routers on this page.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700">
            <Monitor className="h-4 w-4 mr-2" />
            Tutorial
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => router.push('/routers/provision')}>
            <Monitor className="h-4 w-4 mr-2" />
            Link a MikroTik
          </Button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'all' 
              ? 'text-gray-700 border-b-2 border-pink-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Monitor className="h-4 w-4" />
          All {totalRouters}
        </button>
        <button
          onClick={() => setStatusFilter('online')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'online' 
              ? 'text-green-700 border-b-2 border-pink-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Wifi className="h-4 w-4" />
          Online {onlineRouters}
        </button>
        <button
          onClick={() => setStatusFilter('offline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'offline' 
              ? 'text-red-700 border-b-2 border-pink-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Wifi className="h-4 w-4" />
          Offline {offlineRouters}
        </button>
      </div>

      {/* Search and Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Board</TableHead>
              <TableHead>Provisioning</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remote Winbox</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRouters.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{r.name || 'MikroTik'}</span>
                    <span className="text-xs text-gray-500">{r.ip_address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{r.board_name || '-'}</span>
                    {r.routeros_version && (
                      <span className="text-xs text-gray-500">v{r.routeros_version}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <ProvisioningBadge status={r.provisioning_status} bootstrapCompleted={r.bootstrap_completed} />
                </TableCell>
                <TableCell>
                  <Badge className={`${
                    r.cpu_load != null && r.cpu_load > 80
                      ? 'bg-red-100 text-red-800'
                      : r.cpu_load != null && r.cpu_load > 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {r.cpu_load_formatted || (r.cpu_load != null ? `${r.cpu_load}%` : '-')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-pink-100 text-pink-800">
                    {r.free_memory_formatted || (r.free_memory != null ? `${(r.free_memory / 1024 / 1024).toFixed(1)}MiB` : '-')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {r.uptime_formatted || (r.uptime != null ? formatUptime(r.uptime) : '-')}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={`${r.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {r.status === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <WinboxUrlCell routerId={r.id} winboxPort={r.winbox_port} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/routers/${r.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSyncRouter(r.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Status
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRegenerateWinbox(r.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate Winbox
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/routers/provision?reprovision=${r.id}`)}>
                        <Download className="h-4 w-4 mr-2" />
                        Reprovision
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSyncHotspotFiles(r.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Sync Hotspot Files
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSyncTime(r.id)}>
                        <Clock className="h-4 w-4 mr-2" />
                        Sync Router Time
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteRouter(r.id, r.name)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Router
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-500">
            Showing {filteredRouters.length} result{filteredRouters.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Per page</span>
            <select className="border rounded px-2 py-1 text-sm">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </Card>

      {selected ? (
        <ActiveSessions routerId={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function ActiveSessions({ routerId, onClose }: { routerId: number; onClose: () => void }) {
  const { data, isLoading, error } = useActiveConnections(routerId);
  const { mutate, isPending } = useDisconnectUser();

  return (
    <Card className="mt-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Active Sessions (Router #{routerId})
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {isLoading && <Skeleton className="h-48" />}
      {error && <p className="text-red-600">Error: {String(error)}</p>}
      {!isLoading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>MAC/Caller</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((c: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {c.type}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{c.name || c.user || c['name']}</TableCell>
                <TableCell>{c.address || c['address']}</TableCell>
                <TableCell className="text-sm text-gray-600">{c['mac-address'] || c['caller-id']}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      mutate({
                        routerId,
                        username: c.name || c.user,
                        userType: c.type === 'pppoe' ? 'pppoe' : 'hotspot',
                      })
                    }
                    disabled={isPending}
                  >
                    {isPending ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

/**
 * ProvisioningBadge - Displays the provisioning status
 */
function ProvisioningBadge({ status, bootstrapCompleted }: { status?: string; bootstrapCompleted?: boolean }) {
  const getStatusConfig = () => {
    if (bootstrapCompleted || status === 'provisioned' || status === 'completed') {
      return { label: 'Completed', className: 'bg-green-100 text-green-800' };
    }
    if (status === 'in_progress' || status === 'running') {
      return { label: 'In Progress', className: 'bg-blue-100 text-blue-800' };
    }
    if (status === 'failed' || status === 'error') {
      return { label: 'Failed', className: 'bg-red-100 text-red-800' };
    }
    if (status === 'pending' || !status) {
      return { label: 'Command Pending', className: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const config = getStatusConfig();

  return <Badge className={config.className}>{config.label}</Badge>;
}

/**
 * WinboxUrlCell - Displays the remote Winbox URL with copy functionality
 */
function WinboxUrlCell({ routerId, winboxPort }: { routerId: number; winboxPort?: number }) {
  const { data, isLoading } = useWinboxUrl(routerId);

  const handleCopy = async () => {
    const urlToCopy = data?.winbox_url || data?.local_winbox_url;
    if (urlToCopy) {
      try {
        await navigator.clipboard.writeText(urlToCopy);
        toast.success('Winbox URL copied to clipboard');
      } catch {
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  if (isLoading) {
    return <Skeleton className="h-5 w-32" />;
  }

  const displayUrl = data?.winbox_url || data?.local_winbox_url || 'Not configured';
  const isConfigured = data?.is_configured ?? !!winboxPort;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-left hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 transition-colors group"
          >
            <Monitor className="h-3 w-3 text-gray-400" />
            <span className={`text-sm ${isConfigured ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400'}`}>
              {displayUrl}
            </span>
            <Copy className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">
            {data?.tooltip || 'Click to copy. Ensure port 8291 is open on the device. After copying, paste this to the Winbox connect field.'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}