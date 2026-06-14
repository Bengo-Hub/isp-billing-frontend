'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useStaffUsers,
  useCreateUser,
  useUpdateUser,
  useAdminSetPassword,
  useGenerateApiToken,
  type UserItem,
  type UserCreateData,
} from '@/features/users/api';
import {
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Eye,
  HeadphonesIcon,
  Key,
  Pencil,
  Plus,
  Search,
  Shield,
  SmilePlus,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOrg } from '@/components/org/OrgProvider';
import { useState } from 'react';

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------
type SortKey = 'name' | 'phone' | 'email' | 'role' | 'last_login';
type SortDir = 'asc' | 'desc';

function compareFn(a: UserItem, b: UserItem, key: SortKey): number {
  const valA = sortVal(a, key);
  const valB = sortVal(b, key);
  if (valA < valB) return -1;
  if (valA > valB) return 1;
  return 0;
}

function sortVal(u: UserItem, key: SortKey): string {
  switch (key) {
    case 'name':
      return (u.full_name || u.username || '').toLowerCase();
    case 'phone':
      return (u.phone || '').toLowerCase();
    case 'email':
      return (u.email || '').toLowerCase();
    case 'role':
      return (u.role || '').toLowerCase();
    case 'last_login':
      return u.last_login || '';
  }
}

// ---------------------------------------------------------------------------
// Create User Dialog (staff-specific)
// ---------------------------------------------------------------------------
function CreateStaffUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createUser = useCreateUser();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'admin' as 'admin' | 'technician',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UserCreateData = {
      first_name: form.first_name,
      last_name: form.last_name,
      username: form.username,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password,
      role: form.role,
    };
    await createUser.mutateAsync(payload);
    onOpenChange(false);
    setForm({ first_name: '', last_name: '', username: '', email: '', phone: '', password: '', role: 'admin' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-600" />
            Create User
          </DialogTitle>
          <DialogDescription>Add a new system user (admin or technician).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input required value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} placeholder="First name" />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input required value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} placeholder="Last name" />
            </div>
          </div>
          <div>
            <Label>Username</Label>
            <Input required value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} placeholder="Username" />
          </div>
          <div>
            <Label>Email</Label>
            <Input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="user@example.com" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+254..." />
          </div>
          <div>
            <Label>Password</Label>
            <Input required type="password" minLength={8} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters" />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v as 'admin' | 'technician' }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="technician">Technical Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Edit User Dialog
// ---------------------------------------------------------------------------
function EditUserDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserItem | null;
}) {
  const updateUser = useUpdateUser();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    username: '',
  });

  // Sync form when user changes
  const prevUserId = useState<number | null>(null);
  if (user && prevUserId[0] !== user.id) {
    prevUserId[1](user.id);
    setForm({
      full_name: user.full_name || `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone_number: user.phone || '',
      username: user.username,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateUser.mutateAsync({
      userId: user.id,
      data: {
        full_name: form.full_name || undefined,
        email: form.email || undefined,
        phone_number: form.phone_number || undefined,
        username: form.username || undefined,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-brand-600" />
            Edit User
          </DialogTitle>
          <DialogDescription>Update user details for {user?.full_name || user?.username}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Full name" />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} placeholder="Username" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone_number} onChange={(e) => setForm((p) => ({ ...p, phone_number: e.target.value }))} placeholder="+254..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Change Password Dialog
// ---------------------------------------------------------------------------
function ChangePasswordDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserItem | null;
}) {
  const setPassword = useAdminSetPassword();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newPassword !== confirmPassword) return;
    await setPassword.mutateAsync({ userId: user.id, newPassword });
    onOpenChange(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-brand-600" />
            Change Password
          </DialogTitle>
          <DialogDescription>Set a new password for {user?.full_name || user?.username}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>New Password</Label>
            <Input required type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input required type="password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-sm text-red-600">Passwords do not match</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={setPassword.isPending || newPassword !== confirmPassword}>
              {setPassword.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Generate API Token Dialog
// ---------------------------------------------------------------------------
function ApiTokenDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserItem | null;
}) {
  const generateToken = useGenerateApiToken();
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    const result = await generateToken.mutateAsync(user.id);
    setToken(result.token);
  };

  const handleCopy = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setToken(null);
      setCopied(false);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-brand-600" />
            Generate API Token
          </DialogTitle>
          <DialogDescription>
            Generate a long-lived API token for {user?.full_name || user?.username}. This token expires in 365 days.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {token ? (
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-900 border rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">API Token (copy now — it won&apos;t be shown again)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs break-all font-mono text-gray-800 dark:text-gray-200">{token}</code>
                  <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-amber-600">Store this token securely. It provides full access as this user.</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Click the button below to generate a new API token. Any previously generated tokens will remain valid until they expire.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            {token ? 'Done' : 'Cancel'}
          </Button>
          {!token && (
            <Button type="button" className="bg-brand-600 hover:bg-brand-700" onClick={handleGenerate} disabled={generateToken.isPending}>
              {generateToken.isPending ? 'Generating...' : 'Generate Token'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sortable Column Header
// ---------------------------------------------------------------------------
function SortHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey | null;
  currentDir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = currentKey === sortKey;
  return (
    <th
      className={`text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${className || ''}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          currentDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 opacity-30" />
        )}
      </span>
    </th>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function SystemUsersPage() {
  const router = useRouter();
  const { orgSlug } = useOrg();
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'technician'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [tokenOpen, setTokenOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Fetch staff users from dedicated endpoint
  const roleMap = { admin: 'isp_admin', technician: 'isp_technician' } as const;
  const { data, isLoading, error } = useStaffUsers({
    page,
    size: perPage,
    role: activeTab === 'all' ? undefined : roleMap[activeTab],
    search: searchQuery || undefined,
  });

  const users = data?.users ?? [];

  // Client-side sorting
  const sortedUsers = sortKey
    ? [...users].sort((a, b) => {
        const result = compareFn(a, b, sortKey);
        return sortDir === 'asc' ? result : -result;
      })
    : users;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
      case 'isp_admin':
        return <Badge className="bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">ADMIN</Badge>;
      case 'technician':
      case 'isp_technician':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">TECHNICIAN</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">{role?.toUpperCase()}</Badge>;
    }
  };

  const openAction = (user: UserItem, action: 'view' | 'edit' | 'password' | 'token') => {
    setSelectedUser(user);
    switch (action) {
      case 'view':
        router.push(`/${orgSlug}/dashboard/users/${user.id}`);
        break;
      case 'edit':
        setEditOpen(true);
        break;
      case 'password':
        setPasswordOpen(true);
        break;
      case 'token':
        setTokenOpen(true);
        break;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Users</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Users</h1>
        <Card className="p-6"><p className="text-red-600">Failed to load users: {String(error)}</p></Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Users</h1>
        <Button className="bg-brand-600 hover:bg-brand-700 text-white" onClick={() => setCreateOpen(true)}>
          <Users className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {([
          { key: 'all' as const, label: 'All Users', icon: Users },
          { key: 'admin' as const, label: 'Administrators', icon: Shield },
          { key: 'technician' as const, label: 'Technical Support', icon: HeadphonesIcon },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <Card className="p-0 overflow-hidden">
        {/* Search inside card */}
        <div className="flex items-center justify-end p-4 pb-0">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <SortHeader label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Phone" sortKey="phone" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                <SortHeader label="Email" sortKey="email" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                <SortHeader label="Role" sortKey="role" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 hidden lg:table-cell">Internet Profile</th>
                <SortHeader label="Last Login" sortKey="last_login" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300" />
              </tr>
            </thead>
            <tbody>
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p>No system users found</p>
                    {searchQuery && <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search criteria</p>}
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {/* Name */}
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {user.full_name || user.username}
                      </span>
                      <span className="block text-xs text-gray-500 md:hidden">{user.email}</span>
                    </td>
                    {/* Phone */}
                    <td className="py-4 px-4 text-brand-600 dark:text-brand-400 hidden sm:table-cell">{user.phone || '-'}</td>
                    {/* Email */}
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 hidden md:table-cell">{user.email}</td>
                    {/* Role */}
                    <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                    {/* Internet Profile */}
                    <td className="py-4 px-4 text-gray-500 dark:text-gray-400 hidden lg:table-cell">-</td>
                    {/* Last Login */}
                    <td className="py-4 px-4 text-sm text-brand-600 dark:text-brand-400 hidden lg:table-cell">{formatDate(user.last_login)}</td>
                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-brand-600 border-brand-300 hover:bg-brand-50 dark:text-brand-400 dark:border-brand-700 dark:hover:bg-brand-950/30">
                            <SmilePlus className="h-4 w-4 mr-1.5" />
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openAction(user, 'view')}>
                            <Eye className="h-4 w-4 mr-2" />
                            View user
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction(user, 'edit')} className="text-brand-600 dark:text-brand-400">
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit user
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openAction(user, 'password')}>
                            <Key className="h-4 w-4 mr-2" />
                            Change Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAction(user, 'token')} className="text-brand-600 dark:text-brand-400">
                            <Code2 className="h-4 w-4 mr-2" />
                            Generate API Token
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {sortedUsers.length} result{sortedUsers.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Per page</span>
              <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(data?.pages ?? 0) > 1 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.pages ?? 1)}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Dialogs */}
      <CreateStaffUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditUserDialog open={editOpen} onOpenChange={setEditOpen} user={selectedUser} />
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} user={selectedUser} />
      <ApiTokenDialog open={tokenOpen} onOpenChange={setTokenOpen} user={selectedUser} />
    </div>
  );
}
