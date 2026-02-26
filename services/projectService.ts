import { Project, ProjectStatus } from '@/types';

const api = (path: string) => `/api/db${path}`;

export const projectService = {
  async getAll(userId: string): Promise<Project[]> {
    const res = await fetch(`${api('/projects')}?userId=${userId}`);
    const data = await res.json();
    return data.documents || [];
  },

  async create(data: { userId: string; name: string; description?: string; status: ProjectStatus; progress: number }): Promise<Project> {
    const res = await fetch(api('/projects'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const res = await fetch(api(`/projects/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(id: string): Promise<void> {
    await fetch(api(`/projects/${id}`), { method: 'DELETE' });
  },
};
