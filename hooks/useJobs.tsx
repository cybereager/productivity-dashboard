'use client';
import { useState, useEffect, useCallback } from 'react';
import { jobService } from '@/services/jobService';
import { Job, JobStatus } from '@/types';
import { toast } from 'sonner';

export function useJobs(userId: string | undefined) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try { setJobs(await jobService.getAll(userId)); }
    catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createJob = async (data: { company: string; role: string; status: JobStatus; notes?: string; dateApplied: string }) => {
    if (!userId) return;
    try {
      const job = await jobService.create({ ...data, userId });
      setJobs((prev) => [job, ...prev]);
      toast.success('Job added');
    } catch { toast.error('Failed to add job'); }
  };

  const updateJob = async (id: string, data: Partial<Job>) => {
    try {
      const updated = await jobService.update(id, data);
      setJobs((prev) => prev.map((j) => j.$id === id ? updated : j));
    } catch { toast.error('Failed to update job'); }
  };

  const deleteJob = async (id: string) => {
    try {
      await jobService.delete(id);
      setJobs((prev) => prev.filter((j) => j.$id !== id));
      toast.success('Job removed');
    } catch { toast.error('Failed to delete job'); }
  };

  const moveJob = async (id: string, status: JobStatus) => {
    await updateJob(id, { status });
  };

  return { jobs, loading, createJob, updateJob, deleteJob, moveJob, refetch: fetch };
}
