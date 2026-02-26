import { databases, ID, Query, DB_ID, COLLECTIONS } from '@/lib/appwrite';
import { BudgetEntry, BudgetType } from '@/types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const budgetService = {
  async getAll(userId: string): Promise<BudgetEntry[]> {
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.BUDGET, [
      Query.equal('userId', userId),
      Query.orderDesc('date'),
    ]);
    return res.documents as unknown as BudgetEntry[];
  },

  async getThisMonth(userId: string): Promise<BudgetEntry[]> {
    const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.BUDGET, [
      Query.equal('userId', userId),
      Query.greaterThanEqual('date', start),
      Query.lessThanEqual('date', end),
      Query.orderDesc('date'),
    ]);
    return res.documents as unknown as BudgetEntry[];
  },

  async create(data: {
    userId: string;
    amount: number;
    category: string;
    type: BudgetType;
    date: string;
    description?: string;
  }): Promise<BudgetEntry> {
    const doc = await databases.createDocument(DB_ID, COLLECTIONS.BUDGET, ID.unique(), data);
    return doc as unknown as BudgetEntry;
  },

  async delete(id: string): Promise<void> {
    await databases.deleteDocument(DB_ID, COLLECTIONS.BUDGET, id);
  },

  calculateSummary(entries: BudgetEntry[]) {
    const income = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const expenses = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    return { income, expenses, balance: income - expenses };
  },

  getCategoryBreakdown(entries: BudgetEntry[]) {
    const map: Record<string, number> = {};
    entries.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  },
};
