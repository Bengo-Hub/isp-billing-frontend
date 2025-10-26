"use client";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { useMpesaTopUpFlow, useTopUpSms } from '@/features/sms/api';
import { useState } from 'react';

export default function TopUpDialog({ accountId }: { accountId: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const { toast } = useToast();
  // manual fallback
  const { mutate: manualTopUp, isPending: manualPending } = useTopUpSms(accountId);
  // mpesa flow
  const { mutate: stkTopUp, isPending } = useMpesaTopUpFlow(accountId);

  const submit = (mode: 'mpesa' | 'manual') => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    if (mode === 'mpesa') {
      stkTopUp(
        { amount: value, phoneNumber: phone },
        {
          onSuccess: () => {
            toast({ title: 'STK push sent. Complete on your phone.' });
            setOpen(false);
            setAmount('');
            setPhone('');
          },
          onError: (e) => toast({ title: 'MPESA top-up failed', variant: 'destructive' }),
        }
      );
    } else {
      manualTopUp(
        { amount: value, payment_method: 'manual' },
        {
          onSuccess: () => {
            toast({ title: 'Manual top-up recorded' });
            setOpen(false);
            setAmount('');
          },
          onError: () => toast({ title: 'Top up failed', variant: 'destructive' }),
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Top Up SMS</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Top Up SMS Credits</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Amount</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100" />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Phone Number</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="2547xxxxxxxx" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button onClick={() => submit('mpesa')} disabled={isPending} className="bg-pink-600 hover:bg-pink-700">
            {isPending ? <Spinner /> : 'Pay with MPESA'}
          </Button>
          <Button onClick={() => submit('manual')} variant="outline" disabled={manualPending}>
            {manualPending ? <Spinner /> : 'Record Manual'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
