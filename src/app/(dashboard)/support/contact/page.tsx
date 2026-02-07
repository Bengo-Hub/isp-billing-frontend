'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import RichEditor from '@/components/ui/rich-editor';
import { useCreateTicket, type TicketPriority } from '@/features/tickets/api';
import { Clock, Headphones, Mail, MapPin, MessageSquare, Phone, Send, Users } from 'lucide-react';
import { useState } from 'react';

export default function ContactSupportPage() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const createTicket = useCreateTicket();

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone Support',
      details: '+254 743 793 901',
      description: 'Available 24/7 for urgent issues',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Mail,
      title: 'Email Support',
      details: 'support@codevertex.co.ke',
      description: 'Response within 24 hours',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      details: 'Available now',
      description: 'Chat with our support team',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: MapPin,
      title: 'Office Location',
      details: 'Nairobi, Kenya',
      description: 'Visit us during business hours',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'partnership', label: 'Partnership' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate(
      {
        user_id: 0, // Backend resolves from auth token
        subject: contactForm.subject || `${contactForm.category} inquiry`,
        description: `Name: ${contactForm.name}\nEmail: ${contactForm.email}\nPhone: ${contactForm.phone}\n\n${contactForm.message}`,
        priority: contactForm.priority.toUpperCase() as TicketPriority,
        category: contactForm.category,
      },
      { onSuccess: () => setIsSubmitted(true) }
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Send className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. We've received your message and will get back to you within 24 hours.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Send Another Message
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Headphones className="h-8 w-8 text-pink-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Support</h1>
          <p className="text-gray-600">Get help from our support team</p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contactInfo.map((info, index) => (
          <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className={`mx-auto w-12 h-12 ${info.bgColor} rounded-lg flex items-center justify-center mb-4`}>
              <info.icon className={`h-6 w-6 ${info.color}`} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
            <p className="text-sm font-medium text-gray-700 mb-1">{info.details}</p>
            <p className="text-xs text-gray-500">{info.description}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  value={contactForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  value={contactForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+254 700 000 000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={contactForm.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={contactForm.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <Input
                  value={contactForm.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief description of your inquiry"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <RichEditor
                value={contactForm.message}
                onChange={(value) => setContactForm(prev => ({ ...prev, message: value }))}
                placeholder="Please provide detailed information about your inquiry..."
              />
            </div>

            <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </form>
        </Card>

        {/* Support Information */}
        <div className="space-y-6">
          {/* Business Hours */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-pink-600" />
              <h3 className="font-semibold text-gray-900">Business Hours</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span>8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span>9:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Support</span>
                <span>24/7</span>
              </div>
            </div>
          </Card>

          {/* Support Team */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5 text-pink-600" />
              <h3 className="font-semibold text-gray-900">Support Team</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-pink-600">JD</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-600">Technical Support Lead</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">SM</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sarah Miller</p>
                  <p className="text-sm text-gray-600">Customer Success Manager</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">MK</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mike Kimani</p>
                  <p className="text-sm text-gray-600">Senior Support Engineer</p>
                </div>
              </div>
            </div>
          </Card>

          {/* FAQ */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900 text-sm">How quickly do you respond?</p>
                <p className="text-sm text-gray-600">We typically respond within 24 hours for non-urgent issues.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Do you provide remote support?</p>
                <p className="text-sm text-gray-600">Yes, we offer remote assistance for technical issues.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">What information should I include?</p>
                <p className="text-sm text-gray-600">Please include system details, error messages, and steps to reproduce the issue.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
