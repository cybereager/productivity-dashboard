'use client';
import { useState, useEffect, useCallback } from 'react';
import { budgetService } from '@/services/budgetService';
import { BudgetEntry, BudgetType } from '@/types';
import { toast } from 'sonner';

export function useBudget(userId: string | undefined) {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try { setEntries(await budgetService.getAll(userId)); }
    catch { toast.error('Failed to load budget'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addEntry = async (data: { amount: number; category: string; type: BudgetType; date: string; description?: string }) => {
    if (!userId) return;
    try {
      const entry = await budgetService.create({ ...data, userId });
      setEntries((prev) => [entry, ...prev]);
      toast.success(`${data.type === 'income' ? 'Income' : 'Expense'} added`);
    } catch { toast.error('Failed to add entry'); }
  };

  const deleteEntry = async (id: string) => {
    try {
      await budgetService.delete(id);
      setEntries((prev) => prev.filter((e) => e.$id !== id));
      toast.success('Entry deleted');
    } catch { toast.error('Failed to delete entry'); }
  };

  const summary = budgetService.calculateSummary(entries);
  const categoryBreakdown = budgetService.getCategoryBreakdown(entries);

  return { entries, loading, addEntry, deleteEntry, summary, categoryBreakdown, refetch: fetch };
}
