'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TermsConditionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  primaryColor?: string;
}

// Hook to fetch organization terms & conditions
function useTermsConditions(orgSlug: string) {
  return useQuery({
    queryKey: ['terms-conditions', orgSlug],
    queryFn: async (): Promise<{ terms: string; organization_name: string }> => {
      const { data } = await api.get(`/portal/${orgSlug}/terms`);
      return data;
    },
    enabled: !!orgSlug,
  });
}

export function TermsConditionsModal({
  open,
  onOpenChange,
  orgSlug,
  primaryColor = '#ec4899',
}: TermsConditionsModalProps) {
  const { data, isLoading, error } = useTermsConditions(orgSlug);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: primaryColor }} />
            Terms & Conditions
          </DialogTitle>
          <DialogDescription>
            {data?.organization_name ? `${data.organization_name} - Service Terms` : 'Service Terms & Conditions'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Terms & Conditions are not available at this time.
              </p>
            </div>
          ) : data?.terms ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: data.terms }}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No terms & conditions have been configured yet.
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 text-center">
            By using this service, you agree to these terms and conditions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TermsConditionsModal;
