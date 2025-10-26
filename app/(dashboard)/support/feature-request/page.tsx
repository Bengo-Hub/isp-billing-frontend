'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Editor } from '@/components/ui/editor';
import { Input } from '@/components/ui/input';
import { Bug, CheckCircle, Clock, FileText, Lightbulb, Send } from 'lucide-react';
import { useState } from 'react';

export default function FeatureRequestPage() {
  const [activeTab, setActiveTab] = useState<'feature' | 'bug'>('feature');
  const [requests] = useState([
    {
      id: 1,
      type: 'feature',
      title: 'Add dark mode support',
      description: 'Please add dark mode toggle for better user experience during night hours.',
      priority: 'medium',
      status: 'pending',
      submittedAt: '2025-10-20T15:30:00Z',
      submittedBy: 'admin@example.com'
    },
    {
      id: 2,
      type: 'bug',
      title: 'Dashboard charts not loading',
      description: 'Charts on the dashboard page are not displaying data correctly.',
      priority: 'high',
      status: 'in-review',
      submittedAt: '2025-10-19T10:15:00Z',
      submittedBy: 'admin@example.com'
    },
    {
      id: 3,
      type: 'feature',
      title: 'Export reports to PDF',
      description: 'Add ability to export analytics reports to PDF format.',
      priority: 'low',
      status: 'completed',
      submittedAt: '2025-10-18T14:20:00Z',
      submittedBy: 'admin@example.com'
    }
  ]);

  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'in-review':
        return <Badge className="bg-blue-100 text-blue-800"><FileText className="h-3 w-3 mr-1" />In Review</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, submit to backend
    console.log('Submitting request:', newRequest);
    setNewRequest({ title: '', description: '', priority: 'medium' });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        {activeTab === 'feature' ? (
          <Lightbulb className="h-8 w-8 text-pink-600" />
        ) : (
          <Bug className="h-8 w-8 text-pink-600" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'feature' ? 'Feature Requests' : 'Bug Reports'}
          </h1>
          <p className="text-gray-600">
            {activeTab === 'feature' 
              ? 'Suggest new features or improvements' 
              : 'Report bugs and technical issues'
            }
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('feature')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'feature'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          Feature Requests
        </button>
        <button
          onClick={() => setActiveTab('bug')}
          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'bug'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bug className="h-4 w-4" />
          Bug Reports
        </button>
      </div>

      {/* New Request Form */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Submit New {activeTab === 'feature' ? 'Feature Request' : 'Bug Report'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <Input
              value={newRequest.title}
              onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
              placeholder={`Brief description of ${activeTab === 'feature' ? 'the feature' : 'the bug'}`}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={newRequest.priority}
              onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Editor
              label="Description"
              value={newRequest.description}
              onChange={(value) => setNewRequest({ ...newRequest, description: value })}
              placeholder={`Provide detailed information about ${activeTab === 'feature' ? 'the feature request' : 'the bug report'}...`}
            />
          </div>
          
          <div className="flex gap-3">
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
              <Send className="h-4 w-4 mr-2" />
              Submit {activeTab === 'feature' ? 'Feature Request' : 'Bug Report'}
            </Button>
            <Button type="button" variant="outline">
              Save Draft
            </Button>
          </div>
        </form>
      </Card>

      {/* Existing Requests */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Previous {activeTab === 'feature' ? 'Feature Requests' : 'Bug Reports'}
        </h2>
        
        <div className="space-y-4">
          {requests
            .filter(req => req.type === activeTab)
            .map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">{request.title}</h3>
                    {getPriorityBadge(request.priority)}
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{request.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Submitted by {request.submittedBy}</span>
                    <span>•</span>
                    <span>{formatDate(request.submittedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {requests.filter(req => req.type === activeTab).length === 0 && (
          <div className="text-center py-12">
            {activeTab === 'feature' ? (
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            ) : (
              <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            )}
            <p className="text-gray-500">
              No {activeTab === 'feature' ? 'feature requests' : 'bug reports'} yet
            </p>
          </div>
        )}
      </Card>

      {/* Guidelines */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Submission Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-pink-600" />
              Feature Requests
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Describe the feature clearly and concisely</li>
              <li>• Explain the business value or user benefit</li>
              <li>• Provide examples or use cases if possible</li>
              <li>• Consider the impact on existing functionality</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Bug className="h-4 w-4 text-pink-600" />
              Bug Reports
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Describe the expected vs actual behavior</li>
              <li>• Include steps to reproduce the issue</li>
              <li>• Specify browser, device, and system information</li>
              <li>• Attach screenshots or error messages if available</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
