"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCreateRouter, useStartProvisioning } from '@/features/routers/api';
import { useState } from 'react';

export default function AddRouterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    ip_address: '',
    api_port: '8728',
    username: '',
    password: '',
    router_type: 'mikrotik',
  });

  const { toast } = useToast();
  const { mutateAsync: startProvisioning, isPending } = useStartProvisioning();
  const { mutateAsync: createRouter } = useCreateRouter();

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    try {
      // 1) Create router
      const created = await createRouter({
        name: form.name || 'Codevertex Router',
        ip_address: form.ip_address || '192.168.1.1',
        api_port: Number(form.api_port) || 8728,
        username: form.username || 'admin',
        password: form.password || 'admin',
        router_type: 'mikrotik' as const,
      });
      const routerId = (created as any).id;

      // 2) Start provisioning with returned router_id
      await startProvisioning({
        router_id: routerId,
        service_type: 'both',
        configuration: {
          identity: form.name || 'Codevertex-Router',
          interface: 'ether2',
          ip_pool_start: '172.31.1.1',
          ip_pool_end: '172.31.1.254',
          enable_anti_sharing: true,
        },
        auto_start: true,
      });
      toast({ title: 'Provisioning started' });
      onOpenChange(false);
      setStep(1);
    } catch (e) {
      toast({ title: 'Failed to start provisioning', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add MikroTik Router</DialogTitle>
        </DialogHeader>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Router Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="HQ Router" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Router Type</label>
              <Input value={form.router_type} onChange={(e) => setForm({ ...form, router_type: e.target.value })} />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">IP Address</label>
              <Input value={form.ip_address} onChange={(e) => setForm({ ...form, ip_address: e.target.value })} placeholder="192.168.1.1" />
            </div>
            <div>
              <label className="text-sm text-gray-600">API Port</label>
              <Input value={form.api_port} onChange={(e) => setForm({ ...form, api_port: e.target.value })} placeholder="8728" />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Username</label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="admin" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Password</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={back} disabled={step === 1}>Back</Button>
          {step < 3 ? (
            <Button className="bg-pink-600 hover:bg-pink-700" onClick={next}>Next</Button>
          ) : (
            <Button className="bg-pink-600 hover:bg-pink-700" onClick={submit} disabled={isPending}>Save & Provision</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
