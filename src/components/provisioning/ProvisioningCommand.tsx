'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Copy } from 'lucide-react';
import { useState } from 'react';

interface ProvisioningCommandProps {
  command: string;
  token: string;
  expiresIn: number;
  notes?: string[];
  onCommandGenerated?: (command: string, token: string) => void;
}

export function ProvisioningCommand({ 
  command, 
  token, 
  expiresIn, 
  notes = [],
  onCommandGenerated 
}: ProvisioningCommandProps) {
  const [copied, setCopied] = useState(false);

  const [copyError, setCopyError] = useState(false);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  const formatExpiryTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Provisioning Command</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Expires in: {formatExpiryTime(expiresIn)}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={copyCommand}
            className={copied ? 'bg-green-100 text-green-800' : copyError ? 'bg-red-100 text-red-800' : ''}
          >
            {copied ? 'Copied!' : copyError ? 'Failed' : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded-md text-xs font-mono relative">
        <pre className="whitespace-pre-wrap break-all overflow-wrap-anywhere">{command}</pre>
      </div>

      {notes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-2">Important Notes:</div>
              <ul className="list-disc pl-5 space-y-1">
                {notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <div className="font-semibold mb-1">Security Notice</div>
            <p>
              This command contains a secure access token that expires in {formatExpiryTime(expiresIn)}. 
              The token provides limited permissions for router configuration and will be automatically revoked after use.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
