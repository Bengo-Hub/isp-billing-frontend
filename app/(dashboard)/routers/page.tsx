'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useActiveConnections, useDisconnectUser, useRouters } from '@/features/routers/api';
import { Clock, Download, Eye, Monitor, MoreVertical, RefreshCw, Search, Wifi } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RoutersPage() {
  const { data, isLoading, error } = useRouters();
  const [selected, setSelected] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('online');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

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
              <TableHead>Board Name</TableHead>
              <TableHead>Provisioning</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remote Winbox</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRouters.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name || 'MikroTik2'}</TableCell>
                <TableCell>
                  <Badge className="bg-pink-100 text-pink-800">Completed</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">0%</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-pink-100 text-pink-800">184.82 MB</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${r.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {r.status === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">vpn.codevertex.com:51255</span>
                  </div>
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
                      <DropdownMenuItem>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate winbox
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/routers/provision?reprovision=${r.id}`)}>
                        <Download className="h-4 w-4 mr-2" />
                        Reprovision
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Download className="h-4 w-4 mr-2" />
                        Sync hotspot files
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Clock className="h-4 w-4 mr-2" />
                        Sync Router Time
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