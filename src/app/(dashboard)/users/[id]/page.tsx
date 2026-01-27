'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Calendar,
    CheckCircle2,
    Copy,
    Edit,
    Eye,
    EyeOff,
    Mail,
    MoreVertical,
    Send,
    Trash2,
    Wifi
} from 'lucide-react';
import { use, useState } from 'react';
import { toast } from 'sonner';

const tabs = [
  { id: 'general', label: 'General Information' },
  { id: 'reports', label: 'Reports' },
  { id: 'payments', label: 'Payments' },
  { id: 'sms', label: 'Sms' },
  { id: 'sessions', label: 'Sessions' },
];

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Mock user data - replace with actual API call
  const user = {
    username: userId,
    account_number: 'C115081',
    full_name: '',
    email: '',
    phone: '0705651499',
    password: '********',
    package: '2HR SURF UNLIMITED',
    status: 'Active',
    connection_status: 'Offline',
    user_type: 'Hotspot',
    expiry: 'January 27, 2026 01:56 PM',
    expired: true,
    time_remaining: 'Expired',
    data_used: '122.16 MB',
    lifetime_value: 'Ksh 20.00',
    payment_reliability: '100.0%',
    value_rank: '#119 (Top 95.2%)',
    churn_risk: 'Very Low',
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            user.connection_status === 'Offline' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            <Wifi className="h-3 w-3" />
            Currently {user.connection_status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-pink-600 border-pink-600 hover:bg-pink-50">
            <Calendar className="h-4 w-4 mr-2" />
            Change Expiry
          </Button>
          <Button variant="outline" className="text-pink-600 border-pink-600 hover:bg-pink-50">
            <Send className="h-4 w-4 mr-2" />
            Send voucher
          </Button>
          <div className="relative">
            <Button 
              className="bg-pink-600 hover:bg-pink-700"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical className="h-4 w-4 mr-2" />
              Actions
            </Button>
            {showActions && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm">
                  <Edit className="h-4 w-4 text-pink-600" />
                  Edit
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-pink-600" />
                  Send credentials
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600">
                  <Trash2 className="h-4 w-4" />
                  Delete user
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Package info */}
      <div className="text-sm text-gray-600">
        Package: <span className="font-medium">{user.package}</span> | Expired: <span className="font-medium">{user.expiry}</span>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 border-b-2 text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-pink-600 text-pink-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">Account Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Number */}
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">Account Number</label>
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.account_number}</span>
                <button onClick={() => copyToClipboard(user.account_number)} className="text-gray-400 hover:text-gray-600">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">Full Name</label>
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.full_name || '-'}</span>
                {user.full_name && (
                  <button onClick={() => copyToClipboard(user.full_name)} className="text-gray-400 hover:text-gray-600">
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">Username</label>
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.username}</span>
                <button onClick={() => copyToClipboard(user.username)} className="text-gray-400 hover:text-gray-600">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">Password</label>
              <div className="flex items-center gap-2">
                <span className="font-medium">{showPassword ? 'password123' : user.password}</span>
                <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => copyToClipboard('password123')} className="text-gray-400 hover:text-gray-600">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Package */}
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">Package</label>
              <span className="font-medium">{user.package}</span>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">Status</label>
              <span className={`inline-flex items-center gap-1 font-medium ${
                user.status === 'Active' ? 'text-green-600' : 'text-red-600'
              }`}>
                {user.status} • {user.connection_status}
              </span>
            </div>

            {/* User Type */}
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">User Type</label>
              <span className="font-medium">{user.user_type}</span>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">Phone Number</label>
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.phone}</span>
                <button onClick={() => copyToClipboard(user.phone)} className="text-gray-400 hover:text-gray-600">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Time Remaining */}
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">Time Remaining</label>
              <span className={`font-medium ${user.expired ? 'text-red-600' : 'text-green-600'}`}>
                {user.time_remaining}
              </span>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
              <div className="text-sm opacity-90 mb-2">Data used</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {user.data_used}
                <button className="opacity-70 hover:opacity-100">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs opacity-75 mt-1">Since 01.01.2026 to 27.01.2026</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
              <div className="text-sm opacity-90 mb-2">Expiry</div>
              <div className="text-2xl font-bold">{user.expired ? 'Expired' : 'Active'}</div>
              <div className="text-xs opacity-75 mt-1">{user.expiry}</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
              <div className="text-sm opacity-90 mb-2">Lifetime Value</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {user.lifetime_value}
                <button className="opacity-70 hover:opacity-100">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs opacity-75 mt-1">Since 27.01.2026</div>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
              <div className="text-sm opacity-90 mb-2">Payment Reliability</div>
              <div className="text-2xl font-bold">{user.payment_reliability}</div>
              <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                On-time payment percentage
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
              <div className="text-sm opacity-90 mb-2">Value Rank</div>
              <div className="text-2xl font-bold">{user.value_rank}</div>
              <div className="text-xs opacity-75 mt-1">Customer value ranking 📊</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
              <div className="text-sm opacity-90 mb-2">Churn Risk</div>
              <div className="text-2xl font-bold">{user.churn_risk}</div>
              <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
                Based on usage and payment patterns 🔺
              </div>
            </Card>
          </div>

          {/* Charts Placeholder */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4">Data Usage (This Month)</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-sm text-gray-500">Charts will be implemented with Chart.js or Recharts</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4">Peak Usage Hours</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-sm text-gray-500">Peak usage hours visualization</p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'payments' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Payment History</h3>
            <p className="text-xs text-gray-500">This year's total: Ksh 20.00</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-xs text-gray-500">
                  <th className="pb-3">Receipt No.</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                    No payment records found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'sms' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold">SMS History</h3>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Send className="h-4 w-4 mr-2" />
              Send SMS
            </Button>
          </div>
          
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No sms</p>
            <p className="text-xs text-gray-500">Create a sms to get started.</p>
          </div>
        </Card>
      )}

      {activeTab === 'sessions' && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Active Sessions</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-xs text-gray-500">
                  <th className="pb-3">Session ID</th>
                  <th className="pb-3">IP Address</th>
                  <th className="pb-3">Started</th>
                  <th className="pb-3">Upload</th>
                  <th className="pb-3">Download</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                    No active sessions
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
