'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { projectService } from '@/services/projectService';
import { Project, ProjectStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, FolderOpen, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed']),
  progress: z.number().min(0).max(100),
});
type ProjectForm = z.infer<typeof projectSchema>;

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-slate-500/10 text-slate-400',
  active: 'bg-blue-500/10 text-blue-400',
  'on-hold': 'bg-yellow-500/10 text-yellow-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try { setProjects(await projectService.getAll(user.$id)); }
    catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: 'active', progress: 0 },
  });

  const onSubmit = async (data: ProjectForm) => {
    if (!user) return;
    try {
      if (editProject) {
        const updated = await projectService.update(editProject.$id, data);
        setProjects((prev) => prev.map((p) => p.$id === editProject.$id ? updated : p));
        toast.success('Project updated');
      } else {
        const p = await projectService.create({ ...data, userId: user.$id });
        setProjects((prev) => [p, ...prev]);
        toast.success('Project created');
      }
      reset(); setOpen(false); setEditProject(null);
    } catch { toast.error('Failed to save project'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await projectService.delete(id);
      setProjects((prev) => prev.filter((p) => p.$id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (p: Project) => {
    setEditProject(p);
    setValue('name', p.name);
    setValue('description', p.description || '');
    setValue('status', p.status);
    setValue('progress', p.progress);
    setOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">{projects.filter(p => p.status === 'active').length} active · {projects.filter(p => p.status === 'completed').length} completed</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setEditProject(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />New Project</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader><DialogTitle className="text-white">{editProject ? 'Edit Project' : 'New Project'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><Label className="text-slate-300">Project Name</Label>
                <Input {...register('name')} className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="My awesome project" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div><Label className="text-slate-300">Description</Label>
                <Textarea {...register('description')} className="bg-slate-800 border-slate-700 text-white mt-1" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-slate-300">Status</Label>
                  <Select onValueChange={(v) => setValue('status', v as ProjectStatus)} defaultValue="active">
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-slate-300">Progress (%)</Label>
                  <Input type="number" min="0" max="100" {...register('progress', { valueAsNumber: true })} className="bg-slate-800 border-slate-700 text-white mt-1" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">{editProject ? 'Update' : 'Create'} Project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-16 text-center">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No projects yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Card key={p.$id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-white text-lg">{p.name}</CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(p)} className="text-slate-400 hover:text-white p-1"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p.$id)} className="text-red-400/50 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <Badge className={`w-fit text-xs ${statusColors[p.status]}`}>{p.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.description && <p className="text-sm text-slate-400 line-clamp-2">{p.description}</p>}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-medium">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-2 bg-slate-800" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
