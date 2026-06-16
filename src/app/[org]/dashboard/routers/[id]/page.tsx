'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useRouter as useRouterDetail,
  useRouterSystemResources,
  useActiveConnections,
  useDisconnectUser,
  useRebootRouter,
  useEnrollRouterVpn,
  useCreateRouterBackup,
  useDownloadRouterBackup,
  useListRouterBackups,
  useTestRouterConnection,
  useRouterAgentStatus,
  useRouterEvents,
  useRouterPayments,
} from '@/features/routers/api';
import { DeviceEventsTab } from '@/features/routers/components/DeviceEventsTab';
import { Copy, Eye, EyeOff, RefreshCw, Settings, AlertCircle, Wifi, Download, Power, CheckCircle, CreditCard, HardDrive, Lock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useOrg } from '@/components/org/OrgProvider';

export default function RouterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { orgSlug } = useOrg();
  const routerId = parseInt(params.id as string, 10);

  const [showPassword, setShowPassword] = useState(false);

  // Fetch router data
  const { data: routerData, isLoading, error, refetch } = useRouterDetail(routerId);
  const { data: resources, refetch: refetchResources } = useRouterSystemResources(routerId);
  const { data: activeConnections, refetch: refetchConnections } = useActiveConnections(routerId);
  const { data: agentStatus } = useRouterAgentStatus(routerId, !!routerData?.agent_installed);
  const { data: events } = useRouterEvents(routerId);
  const { data: payments } = useRouterPayments(routerId);
  const { data: backups } = useListRouterBackups(routerId);

  // Mutations
  const rebootMutation = useRebootRouter();
  const enrollVpnMutation = useEnrollRouterVpn();
  const backupMutation = useCreateRouterBackup();
  const downloadBackupMutation = useDownloadRouterBackup();
  const testConnectionMutation = useTestRouterConnection();
  const disconnectMutation = useDisconnectUser();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleReboot = async () => {
    if (confirm('Are you sure you want to reboot this router?')) {
      await rebootMutation.mutateAsync(routerId);
    }
  };

  const handleEnrollVpn = async () => {
    if (confirm('Enroll this router into the WireGuard VPN? It joins the tunnel on its next agent poll (~30s) and enables remote winbox.')) {
      await enrollVpnMutation.mutateAsync(routerId);
    }
  };

  const handleBackup = async () => {
    await backupMutation.mutateAsync(routerId);
  };

  const handleTestConnection = async () => {
    await testConnectionMutation.mutateAsync(routerId);
  };

  // Format uptime from seconds
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  // Calculate memory/disk percentages. Guard against a zero/absent total
  // (NAT'd routers may not report storage) so we never render "NaN%".
  const pctUsed = (total?: number, free?: number): number => {
    if (!total || total <= 0) return 0;
    const used = total - (free ?? 0);
    const pct = (used / total) * 100;
    if (!Number.isFinite(pct)) return 0;
    return Math.min(100, Math.max(0, pct));
  };
  const hasMemory = !!(resources && resources.total_memory > 0);
  const hasDisk = !!(resources && resources.total_hdd_space > 0);
  const memoryUsage = pctUsed(resources?.total_memory, resources?.free_memory);
  const diskUsage = pctUsed(resources?.total_hdd_space, resources?.free_hdd_space);

  // Refresh re-fetches the NAT-safe endpoints (agent-sourced), never a direct sync.
  const handleRefresh = () => {
    refetch();
    refetchResources();
    refetchConnections();
  };

  if (isLoading) {
    return <RouterDetailSkeleton />;
  }

  if (error || !routerData) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Router Not Found</h2>
          <p className="text-gray-600 mb-4">The router you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => router.push(`/${orgSlug}/dashboard/routers`)}>
            Back to Routers
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{routerData.name}</h1>
            <Badge className={routerData.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {routerData.status === 'online' ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <p className="text-gray-600">{routerData.description || routerData.ip_address}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="destructive">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleTestConnection}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Test Connection
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBackup}>
                <Download className="h-4 w-4 mr-2" />
                Create Backup
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEnrollVpn}>
                <Lock className="h-4 w-4 mr-2" />
                Enroll VPN (remote winbox)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReboot} className="text-red-600">
                <Power className="h-4 w-4 mr-2" />
                Reboot Router
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="system">System Information</TabsTrigger>
          <TabsTrigger value="events">Device Events</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="users">Active Users</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          {/* General Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MANAGEMENT IP</label>
                  <div className="flex items-center gap-2">
                    <Input value={routerData.ip_address} readOnly className="bg-gray-50" />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(routerData.ip_address)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">USERNAME</label>
                  <Input value={routerData.username} readOnly className="bg-gray-50" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PASSWORD</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={routerData.password}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(routerData.password || '')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API PORT</label>
                  <div className="flex items-center gap-2">
                    <Input value={routerData.port.toString()} readOnly className="bg-gray-50" />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(routerData.port.toString())}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Usage Metrics */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">CPU USAGE</h3>
                    <p className="text-sm text-gray-600">Current load average</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{resources?.cpu_load || 0}%</div>
              </div>
              <Progress value={resources?.cpu_load || 0} className="h-2" />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">MEMORY USAGE</h3>
                    <p className="text-sm text-gray-600">
                      {hasMemory ? `${Math.round((resources!.total_memory - resources!.free_memory) / 1024 / 1024)}MB / ${Math.round(resources!.total_memory / 1024 / 1024)}MB` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{hasMemory ? `${memoryUsage.toFixed(1)}%` : 'N/A'}</div>
              </div>
              <Progress value={hasMemory ? memoryUsage : 0} className="h-2" />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">DISK USAGE</h3>
                    <p className="text-sm text-gray-600">
                      {hasDisk ? `${Math.round((resources!.total_hdd_space - resources!.free_hdd_space) / 1024 / 1024)}MB / ${Math.round(resources!.total_hdd_space / 1024 / 1024)}MB` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{hasDisk ? `${diskUsage.toFixed(1)}%` : 'N/A'}</div>
              </div>
              <Progress value={hasDisk ? diskUsage : 0} className="h-2" />
            </Card>
          </div>

          {/* Availability */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Router Availability</h2>
            <div className={`${routerData.status === 'online' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mb-6`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 ${routerData.status === 'online' ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                <h3 className={`font-semibold ${routerData.status === 'online' ? 'text-green-800' : 'text-red-800'}`}>
                  {routerData.status === 'online' ? 'All Systems Operational' : 'Router Offline'}
                </h3>
              </div>
              <p className={`text-sm ${routerData.status === 'online' ? 'text-green-700' : 'text-red-700'}`}>
                {routerData.last_seen ? `Last seen: ${new Date(routerData.last_seen).toLocaleString()}` : 'No data available'}
              </p>
            </div>

            {/* Agent Status */}
            {routerData.agent_installed && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${agentStatus?.is_online ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                    <div>
                      <h3 className="font-semibold text-blue-800">Polling Agent</h3>
                      <p className="text-sm text-blue-600">
                        {agentStatus?.last_poll_at
                          ? `Last poll: ${new Date(agentStatus.last_poll_at).toLocaleString()}`
                          : 'Waiting for first poll...'}
                        {agentStatus?.seconds_since_last_poll != null && (
                          <span className="ml-2">({agentStatus.seconds_since_last_poll}s ago)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-blue-700">
                    {routerData.agent_version && <span>v{routerData.agent_version}</span>}
                    {agentStatus?.pending_commands != null && agentStatus.pending_commands > 0 && (
                      <Badge className="bg-amber-100 text-amber-800">
                        {agentStatus.pending_commands} pending cmd{agentStatus.pending_commands !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    <span>Poll interval: {routerData.agent_poll_interval || 30}s</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">CURRENT UPTIME</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {resources?.uptime || formatUptime(routerData.uptime)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">ROUTEROS VERSION</h4>
                <p className="text-lg font-semibold text-gray-900">{resources?.version || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">HARDWARE MODEL</h4>
                <p className="text-lg font-semibold text-gray-900">{resources?.board_name || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Device Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DEVICE NAME</label>
                  <Input value={routerData.name} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ROUTER TYPE</label>
                  <Input value={routerData.router_type.toUpperCase()} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PLATFORM</label>
                  <Input value={resources?.platform || 'N/A'} readOnly className="bg-gray-50" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ARCHITECTURE</label>
                  <Input value={resources?.architecture_name || 'N/A'} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LOCATION</label>
                  <Input value={routerData.location || 'Not specified'} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CREATED</label>
                  <Input value={new Date(routerData.created_at).toLocaleDateString()} readOnly className="bg-gray-50" />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <DeviceEventsTab routerId={routerId} />
        </TabsContent>

        <TabsContent value="reports">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reports</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Active Users Now</p>
                <p className="text-2xl font-bold text-gray-900">{activeConnections?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{payments?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Revenue (collected)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(payments || [])
                    .filter((p) => (p.status || '').toLowerCase() === 'completed' || (p.status || '').toLowerCase() === 'checked')
                    .reduce((sum, p) => sum + (p.amount || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Recent Events</p>
                <p className="text-2xl font-bold text-gray-900">{events?.length || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-lg font-semibold text-gray-900">{resources?.uptime || formatUptime(routerData.uptime)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">CPU Load</p>
                <p className="text-lg font-semibold text-gray-900">{resources?.cpu_load ?? 0}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Memory Used</p>
                <p className="text-lg font-semibold text-gray-900">{hasMemory ? `${memoryUsage.toFixed(0)}%` : 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Agent Status</p>
                <p className="text-lg font-semibold text-gray-900">{agentStatus?.is_online ? 'Online' : routerData.agent_installed ? 'Offline' : 'No agent'}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Metrics reflect current state reported by the polling agent and stored billing data.</p>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Users ({activeConnections?.length || 0})</h2>
            {activeConnections && activeConnections.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Username</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">IP Address</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">MAC Address</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Uptime</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeConnections.map((conn: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{conn.user || conn.name || 'Unknown'}</td>
                        <td className="py-4 px-4">
                          <Badge className={conn.type === 'hotspot' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}>
                            {conn.type?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">{conn.address || 'N/A'}</td>
                        <td className="py-4 px-4">{conn['mac-address'] || 'N/A'}</td>
                        <td className="py-4 px-4">{conn.uptime || 'N/A'}</td>
                        <td className="py-4 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => disconnectMutation.mutate({
                              routerId,
                              username: conn.user || conn.name,
                              userType: conn.type,
                            })}
                          >
                            Disconnect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wifi className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No active users connected</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments ({payments?.length || 0})</h2>
            {payments && payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Payment #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Method</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{p.payment_number}</td>
                        <td className="py-4 px-4">{p.customer || p.subscription_username || 'N/A'}</td>
                        <td className="py-4 px-4">{p.invoice_number}</td>
                        <td className="py-4 px-4">{p.currency} {p.amount.toLocaleString()}</td>
                        <td className="py-4 px-4 capitalize">{(p.payment_method || '').replace('_', ' ') || 'N/A'}</td>
                        <td className="py-4 px-4">
                          <Badge className={['completed', 'checked'].includes((p.status || '').toLowerCase()) ? 'bg-green-100 text-green-800' : (p.status || '').toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}>
                            {(p.status || 'unknown').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">{(p.payment_date || p.created_at) ? new Date(p.payment_date || p.created_at!).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No payments recorded for subscriptions on this router</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="backups">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Backups ({backups?.length || 0})</h2>
              <Button onClick={handleBackup} disabled={backupMutation.isPending}>
                <Download className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Backups run on the router via the polling agent (<code>/system/backup/save</code>), then the <code>.backup</code> file is uploaded to the platform for download. Backups are automatically deleted after 2 days.
            </p>
            {backups && backups.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Requested</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Completed</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((b) => (
                      <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{b.name}</td>
                        <td className="py-4 px-4 capitalize">{b.backup_type}</td>
                        <td className="py-4 px-4">
                          <Badge className={b.status === 'completed' ? 'bg-green-100 text-green-800' : b.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}>
                            {b.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">{b.created_at ? new Date(b.created_at).toLocaleString() : 'N/A'}</td>
                        <td className="py-4 px-4">{b.completed_at ? new Date(b.completed_at).toLocaleString() : '-'}</td>
                        <td className="py-4 px-4 text-right">
                          {b.downloadable ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadBackupMutation.mutate({ routerId, backupId: b.id })}
                              disabled={downloadBackupMutation.isPending}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {b.status === 'pending' ? 'Awaiting upload…' : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <HardDrive className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No backups yet. Click "Create Backup" to queue one.</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RouterDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
