'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useUpdateSubscriptionTier, type SubscriptionTier, type SubscriptionTierUpdate } from '@/features/platform/api';

interface TierEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: SubscriptionTier | null;
}

export function TierEditDialog({ open, onOpenChange, tier }: TierEditDialogProps) {
  const updateTier = useUpdateSubscriptionTier();

  const [formData, setFormData] = useState<SubscriptionTierUpdate>({});

  useEffect(() => {
    if (tier) {
      setFormData({
        name: tier.name,
        description: tier.description,
        base_monthly_fee: tier.base_monthly_fee,
        trial_days: tier.trial_days,
        max_routers: tier.max_routers,
        max_staff_users: tier.max_staff_users,
        max_customers: tier.max_customers ?? undefined,
        max_sms_per_month: tier.max_sms_per_month ?? undefined,
        earnings_threshold: tier.earnings_threshold ?? undefined,
        earnings_percentage: tier.earnings_percentage ?? undefined,
      });
    }
  }, [tier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tier) return;

    updateTier.mutate(
      { tierId: tier.id, data: formData },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const setField = (field: keyof SubscriptionTierUpdate, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!tier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Tier: {tier.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name ?? ''}
                onChange={(e) => setField('name', e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description ?? ''}
                onChange={(e) => setField('description', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="base_monthly_fee">Monthly Fee (KES)</Label>
              <Input
                id="base_monthly_fee"
                type="number"
                min={0}
                value={formData.base_monthly_fee ?? ''}
                onChange={(e) => setField('base_monthly_fee', Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="trial_days">Trial Days</Label>
              <Input
                id="trial_days"
                type="number"
                min={0}
                max={365}
                value={formData.trial_days ?? ''}
                onChange={(e) => setField('trial_days', Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="max_routers">Max Routers</Label>
              <Input
                id="max_routers"
                type="number"
                min={-1}
                value={formData.max_routers ?? ''}
                onChange={(e) => setField('max_routers', Number(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">-1 for unlimited</p>
            </div>

            <div>
              <Label htmlFor="max_staff_users">Max Staff Users</Label>
              <Input
                id="max_staff_users"
                type="number"
                min={-1}
                value={formData.max_staff_users ?? ''}
                onChange={(e) => setField('max_staff_users', Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="max_customers">Max Customers</Label>
              <Input
                id="max_customers"
                type="number"
                min={-1}
                value={formData.max_customers ?? ''}
                onChange={(e) => setField('max_customers', Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="max_sms_per_month">Max SMS/month</Label>
              <Input
                id="max_sms_per_month"
                type="number"
                min={-1}
                value={formData.max_sms_per_month ?? ''}
                onChange={(e) => setField('max_sms_per_month', Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="earnings_threshold">Earnings Threshold (KES)</Label>
              <Input
                id="earnings_threshold"
                type="number"
                min={0}
                value={formData.earnings_threshold ?? ''}
                onChange={(e) => setField('earnings_threshold', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            <div>
              <Label htmlFor="earnings_percentage">Earnings %</Label>
              <Input
                id="earnings_percentage"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={formData.earnings_percentage ?? ''}
                onChange={(e) => setField('earnings_percentage', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={updateTier.isPending}>
              {updateTier.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
