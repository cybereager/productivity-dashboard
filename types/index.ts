export type UserRole = 'user' | 'admin';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type JobStatus = 'applied' | 'interview' | 'rejected' | 'offer';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed';
export type BudgetType = 'income' | 'expense';

export interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  labels: string[];
  $createdAt: string;
}

export interface Task {
  $id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  projectId?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Job {
  $id: string;
  userId: string;
  company: string;
  role: string;
  status: JobStatus;
  notes?: string;
  dateApplied: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Project {
  $id: string;
  userId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface Habit {
  $id: string;
  userId: string;
  name: string;
  description?: string;
  completedDates: string[];
  streak: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface BudgetEntry {
  $id: string;
  userId: string;
  amount: number;
  category: string;
  type: BudgetType;
  date: string;
  description?: string;
  $createdAt: string;
}

export interface ChatMessage {
  $id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  $createdAt: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  activeJobs: number;
  activeProjects: number;
  longestStreak: number;
  monthlyBalance: number;
}
