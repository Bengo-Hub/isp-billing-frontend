import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ExpenseCategory =
  | 'INFRASTRUCTURE'
  | 'EQUIPMENT'
  | 'MAINTENANCE'
  | 'UTILITIES'
  | 'LICENSES'
  | 'MARKETING'
  | 'SALARIES'
  | 'OFFICE'
  | 'TRAVEL'
  | 'OTHER';

export interface Expense {
  id: number;
  organization_id: number;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  receipt_url?: string;
  added_by_user_id: number;
  status: ExpenseStatus;
  notes?: string;
  approved_by_user_id?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseStats {
  total_expenses: number;
  approved_expenses: number;
  pending_expenses: number;
  rejected_expenses: number;
  total_amount: number;
  daily_expenses: number;
  monthly_expenses: number;
  by_category: Record<string, number>;
}

// Get all expenses
export function useExpenses(params?: {
  page?: number;
  size?: number;
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  search?: string;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: async (): Promise<{ expenses: Expense[]; total: number }> => {
      const { data } = await api.get('/expenses', { params });
      return data;
    },
  });
}

// Get single expense
export function useExpense(expenseId: number) {
  return useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async (): Promise<Expense> => {
      const { data } = await api.get(`/expenses/${expenseId}`);
      return data;
    },
    enabled: !!expenseId,
  });
}

// Create expense
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData: {
      date: string;
      category: ExpenseCategory;
      description: string;
      amount: number;
      currency?: string;
      receipt_url?: string;
      notes?: string;
    }) => {
      const response = await api.post('/expenses', expenseData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create expense');
    },
  });
}

// Update expense
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: number; [key: string]: any }) => {
      const response = await api.patch(`/expenses/${id}`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update expense');
    },
  });
}

// Delete expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: number) => {
      await api.delete(`/expenses/${expenseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete expense');
    },
  });
}

// Approve expense
export function useApproveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: number) => {
      const response = await api.patch(`/expenses/${expenseId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense approved');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to approve expense');
    },
  });
}

// Reject expense
export function useRejectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ expenseId, rejection_reason }: { expenseId: number; rejection_reason: string }) => {
      const response = await api.patch(`/expenses/${expenseId}/reject`, { rejection_reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reject expense');
    },
  });
}

// Get expense statistics
export function useExpenseStats() {
  return useQuery({
    queryKey: ['expense-stats'],
    queryFn: async (): Promise<ExpenseStats> => {
      const { data } = await api.get('/expenses/stats/');
      return data;
    },
  });
}
