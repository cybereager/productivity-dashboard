import { Job, JobStatus } from '@/types';

const api = (path: string) => `/api/db${path}`;

export const jobService = {
  async getAll(userId: string): Promise<Job[]> {
    const res = await fetch(`${api('/jobs')}?userId=${userId}`);
    const data = await res.json();
    return data.documents || [];
  },

  async create(data: { userId: string; company: string; role: string; status: JobStatus; notes?: string; dateApplied: string }): Promise<Job> {
    const res = await fetch(api('/jobs'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async update(id: string, data: Partial<Job>): Promise<Job> {
    const res = await fetch(api(`/jobs/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(id: string): Promise<void> {
    await fetch(api(`/jobs/${id}`), { method: 'DELETE' });
  },
};
