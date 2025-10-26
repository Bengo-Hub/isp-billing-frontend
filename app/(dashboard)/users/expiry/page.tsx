'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Calendar } from 'lucide-react';

export default function ExpiryDatesPage() {
  // Mock data for expiring users
  const expiringUsers = [
    {
      id: 1,
      username: 'C367',
      phone: '0728053026',
      package: '2HR SURF UNLIMITED',
      expiryDate: '2024-01-15',
      status: 'expires_today'
    },
    {
      id: 2,
      username: 'C366',
      phone: '0745301052',
      package: '7HRS UNLIMITED',
      expiryDate: '2024-01-16',
      status: 'expires_tomorrow'
    },
    {
      id: 3,
      username: 'C365',
      phone: '0792345678',
      package: 'Wiki Smart (5 DAYS)',
      expiryDate: '2024-01-17',
      status: 'expires_soon'
    },
    {
      id: 4,
      username: 'C364',
      phone: '0712345678',
      package: '1 Month LITE Home',
      expiryDate: '2024-01-18',
      status: 'expires_soon'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expires_today':
        return <Badge className="bg-red-100 text-red-800">Expires Today</Badge>;
      case 'expires_tomorrow':
        return <Badge className="bg-orange-100 text-orange-800">Expires Tomorrow</Badge>;
      case 'expires_soon':
        return <Badge className="bg-yellow-100 text-yellow-800">Expires Soon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expiry Dates</h1>
          <p className="text-gray-600 mt-1">Users whose packages are expiring soon</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Send Notifications
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Username
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Phone
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Package
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Expiry Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {expiringUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">{user.username}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-red-600 font-medium">{user.phone}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className="bg-green-100 text-green-800">
                      {user.package}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {formatDate(user.expiryDate)}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Extend
                      </Button>
                      <Button variant="outline" size="sm">
                        Notify
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
