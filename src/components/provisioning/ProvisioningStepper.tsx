'use client';

import { CheckCircle } from 'lucide-react';

interface ProvisioningStepperProps {
  currentStep: number;
  isFirstTimeProvisioning: boolean;
  onStepClick?: (step: number) => void;
}

const getSteps = (isFirstTimeProvisioning: boolean) => {
  // Always show 3 steps for both first-time and reprovisioning modes
  return [
    {
      number: 1,
      title: 'Connection',
      description: 'Basic device information',
      completed: false
    },
    {
      number: 2,
      title: 'Device Details',
      description: 'Provisioning command',
      completed: false
    },
    {
      number: 3,
      title: 'Service Setup',
      description: 'Configure PPPoE and Hotspot',
      completed: false
    }
  ];
};

export function ProvisioningStepper({ currentStep, isFirstTimeProvisioning, onStepClick }: ProvisioningStepperProps) {
  const steps = getSteps(isFirstTimeProvisioning);
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex items-center">
            <div 
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer transition-colors ${
                currentStep > step.number 
                  ? 'bg-green-600 text-white' 
                  : currentStep === step.number 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => onStepClick?.(step.number)}
            >
              {currentStep > step.number ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                step.number
              )}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">{step.title}</div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
          )}
        </div>
      ))}
    </div>
  );
}
