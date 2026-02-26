import { databases, ID, Query, DB_ID, COLLECTIONS } from '@/lib/appwrite';
import { Project, ProjectStatus } from '@/types';

export const projectService = {
  async getAll(userId: string): Promise<Project[]> {
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.PROJECTS, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
    ]);
    return res.documents as unknown as Project[];
  },

  async create(data: {
    userId: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    progress: number;
  }): Promise<Project> {
    const doc = await databases.createDocument(DB_ID, COLLECTIONS.PROJECTS, ID.unique(), data);
    return doc as unknown as Project;
  },

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const doc = await databases.updateDocument(DB_ID, COLLECTIONS.PROJECTS, id, data);
    return doc as unknown as Project;
  },

  async delete(id: string): Promise<void> {
    await databases.deleteDocument(DB_ID, COLLECTIONS.PROJECTS, id);
  },
};
