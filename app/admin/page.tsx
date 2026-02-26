'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Shield, Trash2, ArrowLeft } from 'lucide-react';
import { account } from '@/lib/appwrite';
import { toast } from 'sonner';
import Link from 'next/link';

interface AdminUser {
  $id: string;
  name: string;
  email: string;
  labels: string[];
  $createdAt: string;
}

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to load users. Admin API required.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Shield className="w-7 h-7 text-purple-400" />Admin Panel
            </h1>
            <p className="text-slate-400 mt-1">Manage users and system settings</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg"><Users className="w-5 h-5 text-purple-400" /></div>
                <div>
                  <p className="text-sm text-slate-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg"><Shield className="w-5 h-5 text-blue-400" /></div>
                <div>
                  <p className="text-sm text-slate-400">Admins</p>
                  <p className="text-2xl font-bold text-white">{users.filter(u => u.labels?.includes('admin')).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg"><Users className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="text-sm text-slate-400">Regular Users</p>
                  <p className="text-2xl font-bold text-white">{users.filter(u => !u.labels?.includes('admin')).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No users found</p>
                <p className="text-slate-500 text-sm mt-1">Admin API endpoint required for user management</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">User</th>
                      <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">Email</th>
                      <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">Role</th>
                      <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">Joined</th>
                      <th className="text-right text-xs text-slate-400 font-medium py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.$id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {u.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-white font-medium text-sm">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-sm">{u.email}</td>
                        <td className="py-3 px-4">
                          <Badge className={u.labels?.includes('admin') ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-500/10 text-slate-400'}>
                            {u.labels?.includes('admin') ? 'Admin' : 'User'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-sm">
                          {new Date(u.$createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.$id !== user?.$id && (
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                              <Trash2 className="w-3.5 h-3.5 mr-1" />Delete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
