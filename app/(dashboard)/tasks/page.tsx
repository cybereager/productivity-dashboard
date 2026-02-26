'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in-progress', 'done']),
  dueDate: z.string().optional(),
});
type TaskForm = z.infer<typeof taskSchema>;

const priorityColors = { high: 'bg-red-500/10 text-red-400 border-red-500/20', medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', low: 'bg-green-500/10 text-green-400 border-green-500/20' };
const statusColors = { todo: 'bg-slate-500/10 text-slate-400', 'in-progress': 'bg-blue-500/10 text-blue-400', done: 'bg-emerald-500/10 text-emerald-400' };

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, loading, createTask, updateTask, deleteTask, toggleStatus } = useTasks(user?.$id);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [editTask, setEditTask] = useState<Task | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'medium', status: 'todo' },
  });

  const onSubmit = async (data: TaskForm) => {
    if (editTask) {
      await updateTask(editTask.$id, data);
    } else {
      await createTask(data);
    }
    reset();
    setOpen(false);
    setEditTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setValue('title', task.title);
    setValue('description', task.description || '');
    setValue('priority', task.priority);
    setValue('status', task.status);
    setValue('dueDate', task.dueDate || '');
    setOpen(true);
  };

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400 mt-1">{tasks.filter(t => t.status !== 'done').length} pending · {tasks.filter(t => t.status === 'done').length} completed</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setEditTask(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />New Task</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader><DialogTitle className="text-white">{editTask ? 'Edit Task' : 'Create Task'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><Label className="text-slate-300">Title</Label>
                <Input {...register('title')} className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="Task title" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div><Label className="text-slate-300">Description</Label>
                <Textarea {...register('description')} className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="Optional description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-slate-300">Priority</Label>
                  <Select onValueChange={(v) => setValue('priority', v as TaskPriority)} defaultValue="medium">
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-slate-300">Status</Label>
                  <Select onValueChange={(v) => setValue('status', v as TaskStatus)} defaultValue="todo">
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-slate-300">Due Date</Label>
                <Input type="date" {...register('dueDate')} className="bg-slate-800 border-slate-700 text-white mt-1" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">{editTask ? 'Update' : 'Create'} Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as TaskStatus | 'all')}>
        <TabsList className="bg-slate-800">
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
          <TabsTrigger value="todo">To Do ({tasks.filter(t => t.status === 'todo').length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({tasks.filter(t => t.status === 'in-progress').length})</TabsTrigger>
          <TabsTrigger value="done">Done ({tasks.filter(t => t.status === 'done').length})</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded-lg animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="py-16 text-center">
                <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No tasks here</p>
                <p className="text-slate-500 text-sm mt-1">Create a task to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((task) => (
                <div key={task.$id} className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors group">
                  <button onClick={() => toggleStatus(task)} className="shrink-0 text-slate-400 hover:text-emerald-400 transition-colors">
                    {task.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleEdit(task)}>
                    <p className={`font-medium ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>
                    {task.description && <p className="text-sm text-slate-400 truncate">{task.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {task.dueDate && <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(task.dueDate), 'MMM d')}</span>}
                    <Badge className={`text-xs border ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                    <Badge className={`text-xs ${statusColors[task.status]}`}>{task.status}</Badge>
                    <button onClick={() => deleteTask(task.$id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
