"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  usePlans,
  useDeletePlan,
  useActivatePlan,
  useDeactivatePlan,
  formatDuration as formatDurationLabel,
  type PlanItem,
} from '@/features/packages/api';
import {
  MoreHorizontal,
  Package,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PackageTableProps {
  activeTab?: string;
  searchQuery?: string;
  onEditPackage?: (pkg: PlanItem) => void;
  onViewPackage?: (pkg: PlanItem) => void;
}

export default function PackageTable({
  activeTab = 'all',
  searchQuery = '',
  onEditPackage,
  onViewPackage,
}: PackageTableProps) {
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);

  // Fetch all plans and filter by tab CLIENT-SIDE. The backend plan_type enum is
  // uppercase (HOTSPOT/PPPOE/INTERNET/BOTH) with no "trial", so sending the
  // lowercase tab id as plan_type 422'd the request -> "Error: API unavailable"
  // on every tab except All. Client-side filtering also lets a BOTH plan appear
  // under both Hotspot and PPPoE.
  const { data, isLoading, error } = usePlans({
    page: 1,
    size: 200,
    search: searchQuery || undefined,
  });

  const deleteMutation = useDeletePlan();
  const activateMutation = useActivatePlan();
  const deactivateMutation = useDeactivatePlan();

  if (isLoading) return <PkgSkeleton />;
  if (error) return <div className="text-red-600">{String(error)}</div>;

  const handleSelectAll = () => {
    if (selectedPackages.length === data?.items?.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(data?.items?.map(p => p.id) || []);
    }
  };

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackages(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      await deleteMutation.mutateAsync(planId);
      toast.success('Package deleted successfully');
    } catch (error) {
      toast.error('Failed to delete package');
    }
  };

  const handleActivate = async (planId: number) => {
    try {
      await activateMutation.mutateAsync(planId);
    } catch (error) {
      toast.error('Failed to activate package');
    }
  };

  const handleDeactivate = async (planId: number) => {
    try {
      await deactivateMutation.mutateAsync(planId);
    } catch (error) {
      toast.error('Failed to deactivate package');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  // Real speed from the plan (Mbps); legacy `speed` string only as a fallback.
  const formatSpeed = (pkg: PlanItem) => {
    if (pkg.download_speed != null && pkg.upload_speed != null) {
      return `${pkg.download_speed}M/${pkg.upload_speed}M`;
    }
    return pkg.speed || '-';
  };

  // Effective access window. Prefer the authoritative duration_minutes (carries
  // sub-day precision); otherwise fall back to validity_days (calendar) capped by
  // time_limit (HOURS). e.g. a 90-min package reads "1 hr 30 min".
  const formatDuration = (pkg: PlanItem) => {
    if (pkg.duration_minutes != null && pkg.duration_minutes > 0) {
      return formatDurationLabel(pkg.duration_minutes);
    }
    const days = pkg.validity_days ?? 0;
    const tl = pkg.time_limit ?? -1; // hours, -1 = unlimited
    let minutes = days * 1440;
    if (tl > 0) minutes = minutes > 0 ? Math.min(minutes, tl * 60) : tl * 60;
    if (minutes <= 0) return pkg.duration || '-';
    return formatDurationLabel(minutes);
  };

  const matchesTab = (pkg: PlanItem) => {
    if (activeTab === 'all') return true;
    const t = (pkg.plan_type || '').toLowerCase();
    // A BOTH plan is usable as hotspot AND pppoe, so show it under either tab.
    if (activeTab === 'hotspot') return t === 'hotspot' || t === 'both';
    if (activeTab === 'pppoe') return t === 'pppoe' || t === 'both';
    if (activeTab === 'data') return t === 'data' || t === 'internet';
    if (activeTab === 'trial') return pkg.price === 0; // "Free Trial" = zero-price plans
    return t === activeTab;
  };

  const filteredPackages = data?.items?.filter(pkg => {
    if (!matchesTab(pkg)) return false;
    if (searchQuery && !pkg.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }) || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPackages.length === filteredPackages.length && filteredPackages.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span>Name</span>
                <span className="ml-1 text-gray-400">↓</span>
              </div>
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              Price
              <span className="ml-1 text-gray-400">↓</span>
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              Speed
              <span className="ml-1 text-gray-400">↓</span>
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              Time
              <span className="ml-1 text-gray-400">↓</span>
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              Type
              <span className="ml-1 text-gray-400">↓</span>
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              Devices
              <span className="ml-1 text-gray-400">↓</span>
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              Enabled
              <span className="ml-1 text-gray-400">↓</span>
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredPackages.map((pkg) => (
            <tr key={pkg.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPackages.includes(pkg.id)}
                    onChange={() => handleSelectPackage(pkg.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="font-medium text-gray-900">{pkg.name}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="font-medium text-gray-900">{formatPrice(pkg.price, pkg.currency)}</span>
              </td>
              <td className="py-4 px-4 text-gray-600">
                {formatSpeed(pkg)}
              </td>
              <td className="py-4 px-4 text-gray-600">
                {formatDuration(pkg)}
              </td>
              <td className="py-4 px-4">
                <Badge variant="outline" className="capitalize">
                  {pkg.plan_type}
                </Badge>
              </td>
              <td className="py-4 px-4 text-gray-600">
                {pkg.concurrent_sessions ?? pkg.device_count ?? 1}
              </td>
              <td className="py-4 px-4">
                <Badge className={pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {pkg.is_active ? 'Yes' : 'No'}
                </Badge>
              </td>
              <td className="py-4 px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {onViewPackage && (
                      <DropdownMenuItem onClick={() => onViewPackage(pkg)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    )}
                    {onEditPackage && (
                      <DropdownMenuItem onClick={() => onEditPackage(pkg)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {pkg.is_active ? (
                      <DropdownMenuItem onClick={() => handleDeactivate(pkg.id)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Deactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleActivate(pkg.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Activate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No packages found</p>
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search criteria
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {filteredPackages.length} of {data?.total || 0} packages
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Per page</span>
          <select className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PkgSkeleton() {
  return (
    <div className="space-y-2 mt-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
