import { Habit } from '@/types';
import { format } from 'date-fns';

const api = (path: string) => `/api/db${path}`;

export const habitService = {
  async getAll(userId: string): Promise<Habit[]> {
    const res = await fetch(`${api('/habits')}?userId=${userId}`);
    const data = await res.json();
    return data.documents || [];
  },

  async create(data: { userId: string; name: string; description?: string }): Promise<Habit> {
    const res = await fetch(api('/habits'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, completedDates: [], streak: 0 }),
    });
    return res.json();
  },

  async toggleToday(habit: Habit): Promise<Habit> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const dates = habit.completedDates || [];
    const isCompleted = dates.includes(today);
    const updatedDates = isCompleted ? dates.filter((d) => d !== today) : [...dates, today];
    const streak = calculateStreak(updatedDates);
    return habitService.update(habit.$id, { completedDates: updatedDates, streak });
  },

  async update(id: string, data: Partial<Habit>): Promise<Habit> {
    const res = await fetch(api(`/habits/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(id: string): Promise<void> {
    await fetch(api(`/habits/${id}`), { method: 'DELETE' });
  },
};

function calculateStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates].sort().reverse();
  let streak = 0;
  let check = format(new Date(), 'yyyy-MM-dd');
  for (const date of sorted) {
    if (date === check) {
      streak++;
      const d = new Date(check);
      d.setDate(d.getDate() - 1);
      check = format(d, 'yyyy-MM-dd');
    } else break;
  }
  return streak;
}
