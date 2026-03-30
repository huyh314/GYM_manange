'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Notebook, Trash2, Edit2, ChevronRight, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/routines');
      if (res.ok) {
        const data = await res.json();
        setRoutines(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setFormData({ name: '', description: '' });
        fetchRoutines();
        toast.success('Đã tạo giáo án mới');
      }
    } catch (err) {
      toast.error('Lỗi khi tạo giáo án');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giáo án này?')) return;
    try {
      const res = await fetch(`/api/admin/routines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRoutines();
        toast.success('Đã xóa giáo án');
      }
    } catch (err) {
      toast.error('Lỗi khi xóa');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <Notebook className="text-indigo-500" /> Quản lý Giáo án
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sáng tạo các buổi tập mẫu cho PT & Học viên</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-md rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Tạo giáo án mới
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : routines.length === 0 ? (
        <Card className="border-dashed border-2 bg-gray-50/50">
          <CardContent className="p-12 text-center text-gray-400">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold text-gray-600">Chưa có giáo án nào</p>
            <p className="text-sm mt-1">Hãy bắt đầu bằng việc tạo một giáo án mẫu đầu tiên.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routines.map((routine) => (
            <Card key={routine.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                      <Notebook size={24} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50" onClick={() => handleDelete(routine.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-1">{routine.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 h-10">{routine.description || 'Không có mô tả'}</p>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {routine.exercises?.length || 0} bài tập
                  </span>
                  <Link href={`/admin/routines/${routine.id}`}>
                    <Button variant="ghost" size="sm" className="font-black text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-full">
                      Thiết kế <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            <CardHeader className="pb-4 border-b bg-gray-50">
              <CardTitle className="text-xl font-black">Tạo giáo án mới</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-500">Tên giáo án</label>
                  <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Lịch tập ngực chuyên sâu" className="rounded-xl border-gray-200 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-500">Mô tả ngắn</label>
                  <textarea 
                    className="w-full min-h-[100px] flex rounded-xl border border-gray-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả mục tiêu của giáo án này..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Hủy</Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-black px-8">Lưu lại</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
