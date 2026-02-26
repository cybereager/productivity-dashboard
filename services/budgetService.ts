import { BudgetEntry, BudgetType } from '@/types';

const api = (path: string) => `/api/db${path}`;

export const budgetService = {
  async getAll(userId: string): Promise<BudgetEntry[]> {
    const res = await fetch(`${api('/budget')}?userId=${userId}`);
    const data = await res.json();
    return data.documents || [];
  },

  async create(data: { userId: string; amount: number; category: string; type: BudgetType; date: string; description?: string }): Promise<BudgetEntry> {
    const res = await fetch(api('/budget'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(id: string): Promise<void> {
    await fetch(api(`/budget/${id}`), { method: 'DELETE' });
  },

  calculateSummary(entries: BudgetEntry[]) {
    const income = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const expenses = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    return { income, expenses, balance: income - expenses };
  },

  getCategoryBreakdown(entries: BudgetEntry[]) {
    const map: Record<string, number> = {};
    entries.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([category, amount]) => ({ category, amount, name: category }));
  },
};
