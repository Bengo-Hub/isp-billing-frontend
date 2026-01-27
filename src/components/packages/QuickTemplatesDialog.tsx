'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCreatePlan } from '@/features/packages/api';
import { Clock, Loader2, Star, Wifi, Zap } from 'lucide-react';
import { useState } from 'react';

interface QuickTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const templates = [
  {
    id: 1,
    name: 'Basic Hourly',
    description: 'Perfect for short-term internet access',
    type: 'hotspot',
    price: 10,
    duration: '1 Hour',
    speed: '3M/3M',
    features: ['Quick Access', 'Basic Speed'],
    icon: Clock,
    color: 'blue'
  },
  {
    id: 2,
    name: 'Daily Unlimited',
    description: 'Full day internet access with unlimited data',
    type: 'hotspot',
    price: 50,
    duration: '24 Hours',
    speed: '5M/5M',
    features: ['Unlimited Data', '24/7 Access'],
    icon: Wifi,
    color: 'green'
  },
  {
    id: 3,
    name: 'Monthly Premium',
    description: 'High-speed internet for home users',
    type: 'pppoe',
    price: 2500,
    duration: '1 Month',
    speed: '15M/15M',
    features: ['High Speed', 'Stable Connection'],
    icon: Zap,
    color: 'purple'
  },
  {
    id: 4,
    name: 'Business Plan',
    description: 'Professional-grade internet for businesses',
    type: 'pppoe',
    price: 5000,
    duration: '1 Month',
    speed: '25M/25M',
    features: ['Business Grade', 'Priority Support'],
    icon: Star,
    color: 'orange'
  }
];

export default function QuickTemplatesDialog({ open, onOpenChange }: QuickTemplatesDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const createPlan = useCreatePlan();

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'orange':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) return;

      // Parse duration to hours
      const durationMap: Record<string, number> = {
        '1 Hour': 1,
        '24 Hours': 24,
        '1 Month': 720,
      };

      const billingCycleMap: Record<string, 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'> = {
        '1 Hour': 'hourly',
        '24 Hours': 'daily',
        '1 Month': 'monthly',
      };

      const planData = {
        name: template.name,
        plan_type: template.type as 'hotspot' | 'pppoe',
        price: template.price,
        billing_cycle: billingCycleMap[template.duration] || 'monthly',
        duration_hours: durationMap[template.duration] || 24,
        speed_limit: parseInt(template.speed.split('/')[0]),
        is_active: true,
      };

      createPlan.mutate(planData, {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedTemplate(null);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-pink-600" />
            Quick Templates
          </DialogTitle>
          <DialogDescription>
            Choose from pre-configured package templates to quickly create new packages
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <Card 
                key={template.id} 
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate === template.id 
                    ? 'ring-2 ring-pink-500 bg-pink-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getColorClasses(template.color)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {template.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium ml-1">Ksh {template.price}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium ml-1">{template.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Speed:</span>
                      <span className="font-medium ml-1">{template.speed}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createPlan.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleUseTemplate}
            disabled={!selectedTemplate || createPlan.isPending}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {createPlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
