'use client';
import { useState, useEffect, useCallback } from 'react';
import { habitService } from '@/services/habitService';
import { Habit } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try { setHabits(await habitService.getAll(userId)); }
    catch { toast.error('Failed to load habits'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createHabit = async (data: { name: string; description?: string }) => {
    if (!userId) return;
    try {
      const h = await habitService.create({ ...data, userId });
      setHabits((prev) => [h, ...prev]);
      toast.success('Habit created');
    } catch { toast.error('Failed to create habit'); }
  };

  const toggleToday = async (habit: Habit) => {
    try {
      const updated = await habitService.toggleToday(habit);
      setHabits((prev) => prev.map((h) => h.$id === habit.$id ? updated : h));
      const today = format(new Date(), 'yyyy-MM-dd');
      const done = updated.completedDates.includes(today);
      toast.success(done ? '🔥 Habit completed!' : 'Habit unchecked');
    } catch { toast.error('Failed to update habit'); }
  };

  const deleteHabit = async (id: string) => {
    try {
      await habitService.delete(id);
      setHabits((prev) => prev.filter((h) => h.$id !== id));
      toast.success('Habit deleted');
    } catch { toast.error('Failed to delete habit'); }
  };

  return { habits, loading, createHabit, toggleToday, deleteHabit, refetch: fetch };
}
