'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Eye, EyeOff, RefreshCw, Settings } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RouterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const routerId = params.id as string;
  
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Mock data - in production, this would come from API
  const routerData = {
    id: routerId,
    name: 'MikroTik2',
    status: 'online',
    management_ip: '10.9.226.66',
    username: 'admin',
    password: 'admin123',
    api_port: '8728',
    radius_address: '10.9.0.1',
    radius_secret: 'secret123',
    accounting_port: '1813',
    auth_port: '1812',
    cpu_usage: 0,
    memory_usage: 36.1,
    memory_total: 512,
    memory_used: 184.59,
    disk_usage: 26.6,
    disk_total: 128,
    disk_used: 34,
    uptime_percentage: 100.00,
    total_downtime: '0m',
    current_uptime: '4d 5h 40m 0s',
    routeros_version: '7.19.1',
    hardware_model: 'RouterOS L009UIGS-2HaxD',
    icmp_loss: 0.0,
    icmp_response_time: 0.00,
    snmp_available: true
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{routerData.name}</h1>
            <Badge className="bg-green-100 text-green-800">Online</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tabs defaultValue="system" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="system">System Information</TabsTrigger>
              <TabsTrigger value="events">Device Events</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="users">Internet Users</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="backups">Backups</TabsTrigger>
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="destructive">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Change identity</DropdownMenuItem>
              <DropdownMenuItem>Redownload hotspot files</DropdownMenuItem>
              <DropdownMenuItem>Change captive portal</DropdownMenuItem>
              <DropdownMenuItem>Change support number</DropdownMenuItem>
              <DropdownMenuItem>Check Status</DropdownMenuItem>
              <DropdownMenuItem>Reboot mikrotik</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsContent value="system" className="space-y-6">
          {/* General Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MANAGEMENT IP</label>
                  <div className="flex items-center gap-2">
                    <Input value={routerData.management_ip} readOnly className="bg-gray-50" />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(routerData.management_ip)}>
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
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(routerData.password)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API PORT</label>
                  <div className="flex items-center gap-2">
                    <Input value={routerData.api_port} readOnly className="bg-gray-50" />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(routerData.api_port)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* RADIUS Configuration */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">RADIUS Configuration</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RADIUS ADDRESS</label>
                  <div className="flex items-center gap-2">
                    <Input value={routerData.radius_address} readOnly className="bg-gray-50" />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(routerData.radius_address)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SECRET</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type={showSecret ? "text" : "password"} 
                      value={routerData.radius_secret} 
                      readOnly 
                      className="bg-gray-50" 
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(routerData.radius_secret)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ACCOUNTING PORT</label>
                  <div className="flex items-center gap-2">
                    <Input value={routerData.accounting_port} readOnly className="bg-gray-50" />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(routerData.accounting_port)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AUTH PORT</label>
                  <div className="flex items-center gap-2">
                    <Input value={routerData.auth_port} readOnly className="bg-gray-50" />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(routerData.auth_port)}>
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
                <div className="text-2xl font-bold text-gray-900">{routerData.cpu_usage}%</div>
              </div>
              <Progress value={routerData.cpu_usage} className="h-2" />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">MEMORY USAGE</h3>
                    <p className="text-sm text-gray-600">{routerData.memory_used}MB / {routerData.memory_total}MB</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{routerData.memory_usage}%</div>
              </div>
              <Progress value={routerData.memory_usage} className="h-2" />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">DISK USAGE</h3>
                    <p className="text-sm text-gray-600">{routerData.disk_used}MB / {routerData.disk_total}MB</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{routerData.disk_usage}%</div>
              </div>
              <Progress value={routerData.disk_usage} className="h-2" />
            </Card>
          </div>

          {/* MikroTik Availability */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mikrotik Availability</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="font-semibold text-green-800">All Systems Operational</h3>
              </div>
              <p className="text-sm text-green-700">{routerData.uptime_percentage} % uptime over the last 30 days</p>
            </div>
            
            {/* Mock availability chart */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Last 30 days</h3>
              <div className="flex items-end gap-2 h-20">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex-1 bg-green-500 rounded-t" style={{ height: `${80 + Math.random() * 20}%` }}></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Sep 22</span>
                <span>Sep 29</span>
                <span>Oct 6</span>
                <span>Oct 13</span>
                <span>Oct 20</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Operational</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Downtime</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span>Not Added</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">30-DAY UPTIME</h4>
                <p className="text-lg font-semibold text-gray-900">{routerData.uptime_percentage}%</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">TOTAL DOWNTIME</h4>
                <p className="text-lg font-semibold text-gray-900">{routerData.total_downtime}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">CURRENT UPTIME</h4>
                <p className="text-lg font-semibold text-gray-900">{routerData.current_uptime}</p>
              </div>
            </div>
          </Card>

          {/* Performance Overview */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Performance charts and metrics will be displayed here</p>
            </div>
          </Card>

          {/* Device Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ROUTEROS VERSION</label>
                  <Input value={routerData.routeros_version} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DEVICE NAME</label>
                  <div className="flex items-center gap-2">
                    <Input value={routerData.name} readOnly className="bg-gray-50" />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(routerData.name)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HARDWARE MODEL</label>
                  <Input value={routerData.hardware_model} readOnly className="bg-gray-50" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ICMP LOSS</label>
                  <Input value={`${routerData.icmp_loss}%`} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ICMP RESPONSE TIME</label>
                  <Input value={`${routerData.icmp_response_time}ms`} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SNMP AVAILABILITY</label>
                  <div className="flex items-center gap-2">
                    <Input value={routerData.snmp_available ? "AVAILABLE" : "NOT AVAILABLE"} readOnly className="bg-gray-50" />
                    {routerData.snmp_available && (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Events</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Device events will be displayed here</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reports</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Reports will be displayed here</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Internet Users</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Internet users will be displayed here</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Payments will be displayed here</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="backups">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Backups</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Backups will be displayed here</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
