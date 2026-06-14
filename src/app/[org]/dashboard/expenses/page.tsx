'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Receipt, Search, Download, Plus, MoreHorizontal, Eye, Filter } from 'lucide-react';
import { useState } from 'react';
import { useExpenses, useExpenseStats, useCreateExpense, ExpenseCategory, ExpenseStatus } from '@/features/expenses/api';

export default function ExpensesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Form state for create modal
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '' as ExpenseCategory,
    description: '',
    amount: '',
    currency: 'KES',
    notes: '',
  });

  // Fetch expenses with filters
  const { data: expensesData, isLoading: expensesLoading, refetch } = useExpenses({
    page,
    size: pageSize,
    category: selectedCategory !== 'all' ? (selectedCategory as ExpenseCategory) : undefined,
    search: searchTerm || undefined,
  });

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useExpenseStats();

  // Create expense mutation
  const createExpense = useCreateExpense();

  const expenses = expensesData?.expenses || [];
  const totalExpenses = expensesData?.total || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.description || !formData.amount) {
      return;
    }

    await createExpense.mutateAsync({
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: Number(formData.amount),
      currency: formData.currency,
      notes: formData.notes || undefined,
    });

    // Reset form and close modal
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '' as ExpenseCategory,
      description: '',
      amount: '',
      currency: 'KES',
      notes: '',
    });
    setShowCreateModal(false);
    refetch();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-brand-600 hover:bg-brand-700"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-brand-400 to-brand-500 text-white">
          <div className="text-sm opacity-90 mb-2">Today's Expenses</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">
              Ksh {statsLoading ? '...' : (stats?.daily_expenses || 0).toLocaleString()}
            </div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Total expenses today</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-brand-400 to-brand-500 text-white">
          <div className="text-sm opacity-90 mb-2">This Month</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">
              Ksh {statsLoading ? '...' : (stats?.monthly_expenses || 0).toLocaleString()}
            </div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Total expenses this month</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-brand-400 to-brand-500 text-white">
          <div className="text-sm opacity-90 mb-2">Total Expenses</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">
              Ksh {statsLoading ? '...' : (stats?.total_amount || 0).toLocaleString()}
            </div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">All-time total expenses</div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search expenses..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="UTILITIES">Utilities</option>
            <option value="LICENSES">Licenses</option>
            <option value="MARKETING">Marketing</option>
            <option value="SALARIES">Salaries</option>
            <option value="OFFICE">Office</option>
            <option value="TRAVEL">Travel</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Receipt</th>
                <th className="pb-3 font-medium">Added By</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {expensesLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="py-3 text-sm">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className="capitalize">
                        {expense.category.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm">{expense.description}</td>
                    <td className="py-3 text-sm font-medium">
                      {expense.currency} {expense.amount.toLocaleString()}
                    </td>
                    <td className="py-3">
                      {expense.receipt_url ? (
                        <Badge className="bg-green-100 text-green-700">
                          <Receipt className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">No</Badge>
                      )}
                    </td>
                    <td className="py-3 text-sm">
                      {expense.added_by_user_id ? `User ${expense.added_by_user_id}` : 'N/A'}
                    </td>
                    <td className="py-3">
                      <Badge className={
                        expense.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        expense.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {expense.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Expense Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Add Expense</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date<span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="UTILITIES">Utilities</option>
                    <option value="LICENSES">Licenses</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="SALARIES">Salaries</option>
                    <option value="OFFICE">Office</option>
                    <option value="TRAVEL">Travel</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description<span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter expense description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (KES)<span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Receipt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt
                  </label>
                  <Input type="file" accept="image/*,application/pdf" />
                  <p className="text-xs text-gray-500 mt-1">Upload receipt (optional)</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  className="w-full h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Enter any additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createExpense.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700"
                  disabled={createExpense.isPending}
                >
                  {createExpense.isPending ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
