import { databases, ID, Query, DB_ID, COLLECTIONS } from '@/lib/appwrite';
import { Habit } from '@/types';
import { format } from 'date-fns';

export const habitService = {
  async getAll(userId: string): Promise<Habit[]> {
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.HABITS, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
    ]);
    return res.documents as unknown as Habit[];
  },

  async create(data: { userId: string; name: string; description?: string }): Promise<Habit> {
    const doc = await databases.createDocument(DB_ID, COLLECTIONS.HABITS, ID.unique(), {
      ...data,
      completedDates: [],
      streak: 0,
    });
    return doc as unknown as Habit;
  },

  async toggleToday(habit: Habit): Promise<Habit> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const dates = habit.completedDates || [];
    const isCompleted = dates.includes(today);

    let updatedDates: string[];
    if (isCompleted) {
      updatedDates = dates.filter((d) => d !== today);
    } else {
      updatedDates = [...dates, today];
    }

    const streak = calculateStreak(updatedDates);
    return habitService.update(habit.$id, { completedDates: updatedDates, streak });
  },

  async update(id: string, data: Partial<Habit>): Promise<Habit> {
    const doc = await databases.updateDocument(DB_ID, COLLECTIONS.HABITS, id, data);
    return doc as unknown as Habit;
  },

  async delete(id: string): Promise<void> {
    await databases.deleteDocument(DB_ID, COLLECTIONS.HABITS, id);
  },
};

function calculateStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates].sort().reverse();
  let streak = 0;
  const today = format(new Date(), 'yyyy-MM-dd');
  let check = today;

  for (const date of sorted) {
    if (date === check) {
      streak++;
      const d = new Date(check);
      d.setDate(d.getDate() - 1);
      check = format(d, 'yyyy-MM-dd');
    } else {
      break;
    }
  }
  return streak;
}
