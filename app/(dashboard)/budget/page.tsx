'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBudget } from '@/hooks/useBudget';
import { BudgetType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const budgetSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be > 0'),
  category: z.string().min(1, 'Category required'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Date required'),
  description: z.string().optional(),
});
type BudgetForm = z.infer<typeof budgetSchema>;

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Salary', 'Freelance', 'Investment', 'Other'];
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];

export default function BudgetPage() {
  const { user } = useAuth();
  const { entries, loading, addEntry, deleteEntry, summary, categoryBreakdown } = useBudget(user?.$id);
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { type: 'expense', date: format(new Date(), 'yyyy-MM-dd') },
  });

  const onSubmit = async (data: BudgetForm) => {
    await addEntry(data);
    reset({ type: 'expense', date: format(new Date(), 'yyyy-MM-dd') });
    setOpen(false);
  };

  const thisMonth = entries.filter(e => e.date?.startsWith(format(new Date(), 'yyyy-MM')));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Budget Tracker</h1>
          <p className="text-slate-400 mt-1">{format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Add Entry</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader><DialogTitle className="text-white">Add Budget Entry</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-slate-300">Amount (£)</Label>
                  <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="0.00" />
                  {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
                </div>
                <div><Label className="text-slate-300">Type</Label>
                  <Select onValueChange={(v) => setValue('type', v as BudgetType)} defaultValue="expense">
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="income">💰 Income</SelectItem>
                      <SelectItem value="expense">💸 Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-slate-300">Category</Label>
                  <Select onValueChange={(v) => setValue('category', v)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div><Label className="text-slate-300">Date</Label>
                  <Input type="date" {...register('date')} className="bg-slate-800 border-slate-700 text-white mt-1" />
                </div>
              </div>
              <div><Label className="text-slate-300">Description</Label>
                <Input {...register('description')} className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="Optional note" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Add Entry</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 text-sm">Income</span></div>
            <p className="text-2xl font-bold text-emerald-400">£{summary.income.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1"><TrendingDown className="w-4 h-4 text-red-400" /><span className="text-red-400 text-sm">Expenses</span></div>
            <p className="text-2xl font-bold text-red-400">£{summary.expenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className={`${summary.balance >= 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1"><Wallet className={`w-4 h-4 ${summary.balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`} /><span className={`text-sm ${summary.balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>Balance</span></div>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>£{summary.balance.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        {categoryBreakdown.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white">By Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name as string}>
                    {categoryBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `£${Number(v).toFixed(2)}`} contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Transactions */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Recent Transactions</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />)
            ) : entries.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No transactions yet</p>
            ) : entries.slice(0, 20).map((entry) => (
              <div key={entry.$id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 group">
                <span className="text-lg">{entry.type === 'income' ? '💰' : '💸'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{entry.category}</p>
                  <p className="text-xs text-slate-400">{entry.description || format(new Date(entry.date), 'MMM d, yyyy')}</p>
                </div>
                <span className={`font-semibold ${entry.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {entry.type === 'income' ? '+' : '-'}£{entry.amount.toFixed(2)}
                </span>
                <button onClick={() => deleteEntry(entry.$id)} className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
