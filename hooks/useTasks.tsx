'use client';
import { useState, useEffect, useCallback } from 'react';
import { taskService } from '@/services/taskService';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { toast } from 'sonner';

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await taskService.getAll(userId);
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createTask = async (data: { title: string; description?: string; priority: TaskPriority; status: TaskStatus; dueDate?: string; projectId?: string }) => {
    if (!userId) return;
    try {
      const task = await taskService.create({ ...data, userId });
      setTasks((prev) => [task, ...prev]);
      toast.success('Task created');
    } catch { toast.error('Failed to create task'); }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      const updated = await taskService.update(id, data);
      setTasks((prev) => prev.map((t) => t.$id === id ? updated : t));
      toast.success('Task updated');
    } catch { toast.error('Failed to update task'); }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.delete(id);
      setTasks((prev) => prev.filter((t) => t.$id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const toggleStatus = async (task: Task) => {
    const next: TaskStatus = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in-progress' : 'done';
    await updateTask(task.$id, { status: next });
  };

  return { tasks, loading, createTask, updateTask, deleteTask, toggleStatus, refetch: fetch };
}
