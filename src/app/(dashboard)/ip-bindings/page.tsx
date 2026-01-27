'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function IPBindingsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  const bindings = [
    {
      id: 1,
      name: 'Office WiFi User',
      package: '20MB UNLIMITED',
      address: '192.168.1.100',
      mac_address: '00:11:22:33:44:55',
      mikrotik: 'Main Router',
      expires_at: '2026-12-31',
    },
    // Add more mock data as needed
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IP Bindings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage hotspot IP bindings for users</p>
        </div>
        <Button 
          className="bg-pink-600 hover:bg-pink-700"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Bind an IP
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, IP, or MAC address..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Bindings Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                <th className="pb-3">Name</th>
                <th className="pb-3">Package</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">MAC Address</th>
                <th className="pb-3">MikroTik</th>
                <th className="pb-3">Expires</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-gray-400 mb-2">No IP bindings found</div>
                    <Button 
                      variant="outline" 
                      className="text-pink-600 border-pink-600"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first binding
                    </Button>
                  </td>
                </tr>
              ) : (
                bindings.map((binding) => (
                  <tr key={binding.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{binding.name}</td>
                    <td className="py-3 text-sm text-gray-600">{binding.package}</td>
                    <td className="py-3 text-sm font-mono">{binding.address}</td>
                    <td className="py-3 text-sm font-mono">{binding.mac_address}</td>
                    <td className="py-3 text-sm">{binding.mikrotik}</td>
                    <td className="py-3 text-sm">{binding.expires_at || 'Never'}</td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Binding Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Bind an IP</h2>

            <form className="space-y-6">
              {/* MikroTik */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MikroTik<span className="text-red-500">*</span>
                </label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Select an option</option>
                  <option value="main">Main Router</option>
                  <option value="backup">Backup Router</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Target router where the hotspot IP binding will be created.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name<span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="Enter name" />
                  <p className="text-xs text-gray-500 mt-1">Name to identify this user</p>
                </div>

                {/* Package */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Package</label>
                  <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="">Select a package</option>
                    <option value="1">20MB UNLIMITED</option>
                    <option value="2">50MB UNLIMITED</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Package determines speed limits via Simple Queue</p>
                </div>
              </div>

              {/* DHCP Lease */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DHCP Lease</label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Select a host</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Select a DHCP lease to auto-fill IP and MAC</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address<span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="192.168.1.100" />
                  <p className="text-xs text-gray-500 mt-1">Select a host above to auto-fill address</p>
                </div>

                {/* MAC Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MAC Address<span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="00:11:22:33:44:55" />
                  <p className="text-xs text-gray-500 mt-1">Select host above to auto-fill MAC address</p>
                </div>
              </div>

              {/* Expires At */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expires At (Optional)</label>
                <Input type="datetime-local" />
                <p className="text-xs text-gray-500 mt-1">Auto-remove binding at this time.</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Create
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
