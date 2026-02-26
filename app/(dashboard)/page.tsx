'use client';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useJobs } from '@/hooks/useJobs';
import { useHabits } from '@/hooks/useHabits';
import { useBudget } from '@/hooks/useBudget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Briefcase, Target, Wallet, TrendingUp, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function OverviewPage() {
  const { user } = useAuth();
  const { tasks } = useTasks(user?.$id);
  const { jobs } = useJobs(user?.$id);
  const { habits } = useHabits(user?.$id);
  const { summary } = useBudget(user?.$id);

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;
  const activeJobs = jobs.filter((j) => ['applied', 'interview'].includes(j.status)).length;
  const todayHabitsCompleted = habits.filter((h) => h.completedDates?.includes(format(new Date(), 'yyyy-MM-dd'))).length;
  const longestStreak = habits.length ? Math.max(...habits.map((h) => h.streak || 0)) : 0;

  const recentTasks = tasks.slice(0, 5);

  const priorityColor = { high: 'destructive', medium: 'secondary', low: 'outline' } as const;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Good {getTimeGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 mt-1">{format(new Date(), 'EEEE, MMMM do yyyy')}</p>
        </div>
        <Link href="/tasks">
          <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />New Task</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tasks" value={pendingTasks} sub={`${completedTasks} completed`} icon={CheckSquare} color="blue" />
        <StatCard title="Job Applications" value={activeJobs} sub={`${jobs.length} total tracked`} icon={Briefcase} color="violet" />
        <StatCard title="Habits Today" value={`${todayHabitsCompleted}/${habits.length}`} sub={`🔥 ${longestStreak} day streak`} icon={Target} color="orange" />
        <StatCard title="Monthly Balance" value={`£${summary.balance.toFixed(2)}`} sub={`£${summary.income.toFixed(2)} income`} icon={Wallet} color="emerald" />
      </div>

      {/* Recent Tasks + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2"><Clock className="w-5 h-5" />Recent Tasks</CardTitle>
              <Link href="/tasks"><Button variant="ghost" size="sm" className="text-slate-400">View all</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTasks.length === 0 ? (
                <EmptyState message="No tasks yet" cta="Create your first task" href="/tasks" />
              ) : recentTasks.map((task) => (
                <div key={task.$id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>
                    {task.dueDate && <p className="text-xs text-slate-400">{format(new Date(task.dueDate), 'MMM d')}</p>}
                  </div>
                  <Badge variant={priorityColor[task.priority] || 'outline'} className="text-xs">{task.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><TrendingUp className="w-5 h-5" />Progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ProgressItem label="Tasks Done" value={completedTasks} total={tasks.length} color="bg-blue-500" />
              <ProgressItem label="Habits Today" value={todayHabitsCompleted} total={habits.length} color="bg-orange-500" />
              <ProgressItem label="Jobs → Interviews" value={jobs.filter(j => j.status === 'interview').length} total={jobs.length} color="bg-violet-500" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, color }: { title: string; value: string | number; sub: string; icon: React.ElementType; color: string }) {
  const colors: Record<string, string> = { blue: 'bg-blue-500/10 text-blue-400', violet: 'bg-violet-500/10 text-violet-400', orange: 'bg-orange-500/10 text-orange-400', emerald: 'bg-emerald-500/10 text-emerald-400' };
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
          </div>
          <div className={`p-2 rounded-lg ${colors[color]}`}><Icon className="w-5 h-5" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressItem({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">{value}/{total}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-slate-400 mb-3">{message}</p>
      <Link href={href}><Button size="sm" variant="outline">{cta}</Button></Link>
    </div>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
