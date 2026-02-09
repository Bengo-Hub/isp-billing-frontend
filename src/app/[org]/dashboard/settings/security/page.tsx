'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChangePassword, useRevokeAllSessions, useUserSessions } from '@/features/auth/api';
import { Key, Laptop, Monitor, Shield, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useOrg } from '@/components/org/OrgProvider';
import Link from 'next/link';

export default function SecuritySettingsPage() {
  const { orgSlug } = useOrg();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { data: sessions } = useUserSessions();
  const { mutate: revokeAllSessions, isPending: isRevokingAll } = useRevokeAllSessions();

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    changePassword(
      {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      },
      {
        onSuccess: () => {
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setErrors({});
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-600">Manage your account security and authentication</p>
      </div>

      <Tabs defaultValue="password" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                <Key className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className={errors.currentPassword ? 'border-red-500' : ''}
                  disabled={isChangingPassword}
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={errors.newPassword ? 'border-red-500' : ''}
                  disabled={isChangingPassword}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  disabled={isChangingPassword}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* 2FA Tab */}
        <TabsContent value="2fa">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">How It Works</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>Click the button below to set up or manage 2FA</li>
                  <li>Scan the QR code with your authenticator app</li>
                  <li>Enter the 6-digit code to verify setup</li>
                  <li>Save your backup codes in a safe place</li>
                </ol>

                <Link href={`/${orgSlug}/dashboard/settings/security/2fa`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Manage Two-Factor Authentication
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Monitor className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
                  <p className="text-sm text-gray-600">Manage devices where you're currently signed in</p>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={() => revokeAllSessions()}
                disabled={isRevokingAll}
              >
                {isRevokingAll ? 'Revoking...' : 'Revoke All Sessions'}
              </Button>
            </div>

            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions?.sessions?.map((session: any) => (
                    <TableRow key={session.session_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {session.user_agent?.includes('Mobile') ? (
                            <Smartphone className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Laptop className="h-4 w-4 text-gray-500" />
                          )}
                          <div>
                            <div className="font-medium">{session.user_agent || 'Unknown Device'}</div>
                            <div className="text-xs text-gray-500">{session.ip_address}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {session.ip_address || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {session.last_activity ? new Date(session.last_activity).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {session.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No active sessions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Security Tip:</strong> If you see any unfamiliar sessions, revoke them immediately and change your password.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

