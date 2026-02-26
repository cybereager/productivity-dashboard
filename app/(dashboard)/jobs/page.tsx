'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { Job, JobStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Briefcase, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const jobSchema = z.object({
  company: z.string().min(1, 'Company required'),
  role: z.string().min(1, 'Role required'),
  status: z.enum(['applied', 'interview', 'rejected', 'offer']),
  notes: z.string().optional(),
  dateApplied: z.string().min(1, 'Date required'),
});
type JobForm = z.infer<typeof jobSchema>;

const columns: { status: JobStatus; label: string; color: string; bg: string }[] = [
  { status: 'applied', label: 'Applied', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { status: 'interview', label: 'Interview', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  { status: 'offer', label: 'Offer 🎉', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { status: 'rejected', label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
];

export default function JobsPage() {
  const { user } = useAuth();
  const { jobs, loading, createJob, deleteJob, moveJob } = useJobs(user?.$id);
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: { status: 'applied', dateApplied: format(new Date(), 'yyyy-MM-dd') },
  });

  const onSubmit = async (data: JobForm) => {
    await createJob(data);
    reset({ status: 'applied', dateApplied: format(new Date(), 'yyyy-MM-dd') });
    setOpen(false);
  };

  const getNextStatus = (status: JobStatus): JobStatus | null => {
    const order: JobStatus[] = ['applied', 'interview', 'offer'];
    const idx = order.indexOf(status);
    return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Job Tracker</h1>
          <p className="text-slate-400 mt-1">{jobs.length} applications tracked · {jobs.filter(j => j.status === 'interview').length} interviews</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Add Application</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader><DialogTitle className="text-white">Add Job Application</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-slate-300">Company</Label>
                  <Input {...register('company')} className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="Google" />
                  {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company.message}</p>}
                </div>
                <div><Label className="text-slate-300">Role</Label>
                  <Input {...register('role')} className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="Software Engineer" />
                  {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-slate-300">Status</Label>
                  <Select onValueChange={(v) => setValue('status', v as JobStatus)} defaultValue="applied">
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {columns.map(c => <SelectItem key={c.status} value={c.status}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-slate-300">Date Applied</Label>
                  <Input type="date" {...register('dateApplied')} className="bg-slate-800 border-slate-700 text-white mt-1" />
                </div>
              </div>
              <div><Label className="text-slate-300">Notes</Label>
                <Textarea {...register('notes')} className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="Recruiter contact, salary range..." rows={3} />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Add Application</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {columns.map((c) => <div key={c.status} className="h-64 bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colJobs = jobs.filter((j) => j.status === col.status);
            return (
              <div key={col.status} className={`rounded-xl border p-4 ${col.bg}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${col.color}`}>{col.label}</h3>
                  <Badge variant="outline" className={`${col.color} border-current`}>{colJobs.length}</Badge>
                </div>
                <div className="space-y-3">
                  {colJobs.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No applications</p>
                  ) : colJobs.map((job) => (
                    <div key={job.$id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate">{job.company}</p>
                            <p className="text-slate-400 text-xs truncate">{job.role}</p>
                          </div>
                        </div>
                        <button onClick={() => deleteJob(job.$id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 ml-2 shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(job.dateApplied), 'MMM d, yyyy')}
                      </div>
                      {job.notes && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{job.notes}</p>}
                      {getNextStatus(job.status) && (
                        <button
                          onClick={() => moveJob(job.$id, getNextStatus(job.status)!)}
                          className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded p-1.5 transition-colors"
                        >
                          Move to {columns.find(c => c.status === getNextStatus(job.status))?.label}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
