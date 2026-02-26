import { Task, TaskStatus, TaskPriority } from '@/types';

const api = (path: string) => `/api/db${path}`;

export const taskService = {
  async getAll(userId: string): Promise<Task[]> {
    const res = await fetch(`${api('/tasks')}?userId=${userId}`);
    const data = await res.json();
    return data.documents || [];
  },

  async create(data: {
    userId: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
    projectId?: string;
  }): Promise<Task> {
    const res = await fetch(api('/tasks'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const res = await fetch(api(`/tasks/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(id: string): Promise<void> {
    await fetch(api(`/tasks/${id}`), { method: 'DELETE' });
  },
};
