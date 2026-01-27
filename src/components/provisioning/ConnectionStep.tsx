'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';

interface ConnectionStepProps {
  identity: string;
  onIdentityChange: (identity: string) => void;
  onNext: () => void;
  isGeneratingCommand?: boolean;
}

export function ConnectionStep({ identity, onIdentityChange, onNext, isGeneratingCommand }: ConnectionStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mikrotik Identity *
          </label>
          <Input 
            value={identity} 
            onChange={(e) => onIdentityChange(e.target.value)}
            placeholder="Enter device identity"
          />
          <p className="text-xs text-gray-500 mt-1">
            The identity name of your Mikrotik device (System → Identity).
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        {isGeneratingCommand ? (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">Generating Provisioning command...</span>
          </div>
        ) : (
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={onNext}
          >
            Next Step <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
