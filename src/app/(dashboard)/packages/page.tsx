'use client';

import CreatePackageDialog from '@/components/packages/CreatePackageDialog';
import EditPackageDialog from '@/components/packages/EditPackageDialog';
import PackageDetailDialog from '@/components/packages/PackageDetailDialog';
import PackageTable from '@/components/packages/PackageTable';
import QuickTemplatesDialog, { type PackageTemplateData } from '@/components/packages/QuickTemplatesDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePlans, type PlanItem } from '@/features/packages/api';
import { Filter, HelpCircle, Package, Plus, Search, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function PackagesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'hotspot' | 'pppoe' | 'data' | 'trial'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PlanItem | null>(null);
  const [templateData, setTemplateData] = useState<PackageTemplateData | undefined>(undefined);

  const handleTemplateSelect = (data: PackageTemplateData) => {
    setTemplateData(data);
    setIsCreateDialogOpen(true);
  };

  // Fetch all plans to compute counts
  const { data: plansData } = usePlans({ page: 1, size: 200 });
  const plans = plansData?.items ?? [];

  const packageCounts = useMemo(() => ({
    all: plans.length,
    hotspot: plans.filter((p) => p.plan_type === 'hotspot').length,
    pppoe: plans.filter((p) => p.plan_type === 'pppoe').length,
    data: plans.filter((p) => p.plan_type === 'data').length,
    trial: plans.filter((p) => p.plan_type === 'trial').length,
  }), [plans]);

  const tabs = [
    { id: 'all', label: 'All', count: packageCounts.all },
    { id: 'hotspot', label: 'Hotspot', count: packageCounts.hotspot },
    { id: 'pppoe', label: 'PPPOE', count: packageCounts.pppoe },
    { id: 'data', label: 'Data Plans', count: packageCounts.data },
    { id: 'trial', label: 'Free Trial', count: packageCounts.trial }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <p className="text-gray-600 mt-1">
            Manage internet packages for your clients - create pricing plans, set speeds, configure schedules and assign to MikroTik devices
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsTemplatesDialogOpen(true)}>
            <Star className="h-4 w-4 mr-2" />
            Quick Templates
          </Button>
          <Button variant="outline">
            <HelpCircle className="h-4 w-4 mr-2" />
            Package Guide
          </Button>
          <Button 
            className="bg-brand-600 hover:bg-brand-700"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Package
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="h-4 w-4" />
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="outline" className="ml-1 text-xs">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Packages Table */}
      <Card className="p-6">
        <PackageTable
          activeTab={activeTab}
          searchQuery={searchQuery}
          onEditPackage={(pkg) => {
            setSelectedPackage(pkg);
            setIsEditDialogOpen(true);
          }}
          onViewPackage={(pkg) => {
            setSelectedPackage(pkg);
            setIsDetailDialogOpen(true);
          }}
        />
      </Card>

      {/* Create Package Dialog */}
      <CreatePackageDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setTemplateData(undefined);
        }}
        initialData={templateData}
      />

      {/* Edit Package Dialog */}
      {selectedPackage && (
        <EditPackageDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedPackage(null);
          }}
          packageData={selectedPackage}
        />
      )}

      {/* Package Detail Dialog */}
      {selectedPackage && (
        <PackageDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={(open) => {
            setIsDetailDialogOpen(open);
            if (!open) setSelectedPackage(null);
          }}
          packageData={selectedPackage}
        />
      )}

      {/* Quick Templates Dialog */}
      <QuickTemplatesDialog
        open={isTemplatesDialogOpen}
        onOpenChange={setIsTemplatesDialogOpen}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
}

