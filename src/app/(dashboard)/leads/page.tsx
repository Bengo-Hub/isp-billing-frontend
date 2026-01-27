'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, User } from 'lucide-react';
import { useState } from 'react';

export default function LeadsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-600 mt-1">Potential customers and prospects</p>
        </div>
        <Button 
          className="bg-pink-600 hover:bg-pink-700"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">Total Leads</div>
          <div className="text-2xl font-bold">0</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">Contacted</div>
          <div className="text-2xl font-bold text-blue-600">0</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">Converted</div>
          <div className="text-2xl font-bold text-green-600">0</div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads by name, phone, or email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="p-6">
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No leads yet</p>
          <p className="text-xs text-gray-500 mb-4">Start capturing potential customers</p>
          <Button 
            variant="outline" 
            className="text-pink-600 border-pink-600"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first lead
          </Button>
        </div>
      </Card>

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Add New Lead</h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="Enter full name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number<span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="0712345678" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input type="email" placeholder="email@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea 
                  className="w-full min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Additional notes about this lead..."
                />
              </div>

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
                  Add Lead
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
