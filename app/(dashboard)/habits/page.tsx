'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/useHabits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CheckCircle2, Circle, Flame, Target } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const habitSchema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().optional(),
});
type HabitForm = z.infer<typeof habitSchema>;

export default function HabitsPage() {
  const { user } = useAuth();
  const { habits, loading, createHabit, toggleToday, deleteHabit } = useHabits(user?.$id);
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HabitForm>({ resolver: zodResolver(habitSchema) });

  const onSubmit = async (data: HabitForm) => {
    await createHabit(data);
    reset();
    setOpen(false);
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const last21 = Array.from({ length: 21 }, (_, i) => format(subDays(new Date(), 20 - i), 'yyyy-MM-dd'));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Habit Tracker</h1>
          <p className="text-slate-400 mt-1">{habits.filter(h => h.completedDates?.includes(today)).length}/{habits.length} completed today</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />New Habit</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader><DialogTitle className="text-white">Create Habit</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><Label className="text-slate-300">Habit Name</Label>
                <Input {...register('name')} className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="Read 30 minutes" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div><Label className="text-slate-300">Description (optional)</Label>
                <Input {...register('description')} className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="Why is this habit important?" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Create Habit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse" />)}</div>
      ) : habits.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-16 text-center">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No habits yet</p>
            <p className="text-slate-500 text-sm mt-1">Start building your first habit today</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const doneToday = habit.completedDates?.includes(today);
            return (
              <Card key={habit.$id} className={`bg-slate-900 border-slate-800 transition-all ${doneToday ? 'border-emerald-500/30' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <button onClick={() => toggleToday(habit)} className="mt-0.5 shrink-0">
                      {doneToday
                        ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        : <Circle className="w-6 h-6 text-slate-500 hover:text-slate-300 transition-colors" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-lg ${doneToday ? 'text-emerald-400' : 'text-white'}`}>{habit.name}</p>
                        {habit.streak > 0 && (
                          <span className="flex items-center gap-1 text-orange-400 text-sm font-medium">
                            <Flame className="w-4 h-4" />{habit.streak}
                          </span>
                        )}
                      </div>
                      {habit.description && <p className="text-slate-400 text-sm mt-0.5">{habit.description}</p>}

                      {/* 21-day streak dots */}
                      <div className="flex gap-1 mt-3">
                        {last21.map((date) => {
                          const done = habit.completedDates?.includes(date);
                          return (
                            <div
                              key={date}
                              title={date}
                              className={`w-4 h-4 rounded-sm transition-colors ${done ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Last 21 days</p>
                    </div>
                    <button onClick={() => deleteHabit(habit.$id)} className="text-red-400/50 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
