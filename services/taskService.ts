import { databases, ID, Query, DB_ID, COLLECTIONS } from '@/lib/appwrite';
import { Task, TaskStatus, TaskPriority } from '@/types';

export const taskService = {
  async getAll(userId: string): Promise<Task[]> {
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.TASKS, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
    ]);
    return res.documents as unknown as Task[];
  },

  async getToday(userId: string): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.TASKS, [
      Query.equal('userId', userId),
      Query.greaterThanEqual('dueDate', today),
      Query.lessThan('dueDate', today + 'T23:59:59'),
    ]);
    return res.documents as unknown as Task[];
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
    const doc = await databases.createDocument(DB_ID, COLLECTIONS.TASKS, ID.unique(), data);
    return doc as unknown as Task;
  },

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const doc = await databases.updateDocument(DB_ID, COLLECTIONS.TASKS, id, data);
    return doc as unknown as Task;
  },

  async delete(id: string): Promise<void> {
    await databases.deleteDocument(DB_ID, COLLECTIONS.TASKS, id);
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    return taskService.update(id, { status });
  },
};
