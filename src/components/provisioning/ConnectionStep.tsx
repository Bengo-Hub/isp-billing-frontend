'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';

interface ConnectionStepProps {
  identity: string;
  onIdentityChange: (identity: string) => void;
  onNext: () => void;
  isGeneratingCommand?: boolean;
  isReprovisioning?: boolean;
}

export function ConnectionStep({ 
  identity, 
  onIdentityChange, 
  onNext, 
  isGeneratingCommand,
  isReprovisioning = false 
}: ConnectionStepProps) {
  return (
    <div className="space-y-6">
      {isReprovisioning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900">Reprovisioning Mode</h3>
              <p className="text-sm text-blue-700 mt-1">
                You're reconfiguring an existing router. The system will attempt to reconnect using saved credentials in Step 2.
              </p>
            </div>
          </div>
        </div>
      )}
      
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
            <span className="text-sm font-medium">
              {isReprovisioning ? 'Preparing device detection...' : 'Generating provisioning command...'}
            </span>
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
