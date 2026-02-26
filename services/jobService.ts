import { databases, ID, Query, DB_ID, COLLECTIONS } from '@/lib/appwrite';
import { Job, JobStatus } from '@/types';

export const jobService = {
  async getAll(userId: string): Promise<Job[]> {
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.JOBS, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
    ]);
    return res.documents as unknown as Job[];
  },

  async create(data: {
    userId: string;
    company: string;
    role: string;
    status: JobStatus;
    notes?: string;
    dateApplied: string;
  }): Promise<Job> {
    const doc = await databases.createDocument(DB_ID, COLLECTIONS.JOBS, ID.unique(), data);
    return doc as unknown as Job;
  },

  async update(id: string, data: Partial<Job>): Promise<Job> {
    const doc = await databases.updateDocument(DB_ID, COLLECTIONS.JOBS, id, data);
    return doc as unknown as Job;
  },

  async delete(id: string): Promise<void> {
    await databases.deleteDocument(DB_ID, COLLECTIONS.JOBS, id);
  },

  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    return jobService.update(id, { status });
  },
};
