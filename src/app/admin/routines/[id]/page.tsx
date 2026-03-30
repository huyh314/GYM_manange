'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Notebook, Trash2, Dumbbell, ArrowLeft, Search, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RoutineDetailPage({ params }: { params: { id: string } }) {
  const [routine, setRoutine] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]); // Full exercise list
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/admin/routines/${params.id}`);
      if (res.ok) {
        setRoutine(await res.json());
      }
    } catch (err) {
      toast.error('Lỗi khi tải thông tin giáo án');
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await fetch('/api/admin/exercises');
      if (res.ok) {
        setExercises(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchExercises();
  }, []);

  const handleAddExercise = async (ex: any) => {
    try {
      const res = await fetch(`/api/admin/routines/${params.id}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise_id: ex.id, order_index: routine.items?.length || 0 }),
      });
      if (res.ok) {
        toast.success(`Đã thêm ${ex.name}`);
        fetchDetails();
      }
    } catch (err) {
      toast.error('Lỗi khi thêm bài tập');
    }
  };

  const handleUpdateItem = async (itemId: string, updates: any) => {
    try {
      const res = await fetch(`/api/admin/routines/${params.id}/exercises/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success('Đã cập nhật');
        fetchDetails();
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Xóa bài tập này khỏi giáo án?')) return;
    try {
      const res = await fetch(`/api/admin/routines/${params.id}/exercises/${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Đã xóa');
        fetchDetails();
      }
    } catch (err) {
      toast.error('Lỗi khi xóa');
    }
  };

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ex.muscle_group?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Đang tải giáo án...</div>;
  if (!routine) return <div className="p-8 text-center text-rose-500 font-bold">Không tìm thấy giáo án</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-4">
          <Link href="/admin/routines">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <ArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">{routine.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{routine.description || 'Chỉnh sửa các bài tập trong giáo án'}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button 
             variant={isAddingMode ? "default" : "outline"} 
             onClick={() => setIsAddingMode(!isAddingMode)}
             className={`rounded-xl font-bold ${isAddingMode ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
           >
             <Dumbbell className="mr-2 h-4 w-4" /> 
             {isAddingMode ? "Đóng thư viện bài" : "Thêm bài tập"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content: Current Items */}
        <div className={`space-y-4 ${isAddingMode ? 'lg:col-span-12' : 'lg:col-span-12'}`}>
          <h2 className="text-sm font-black uppercase text-gray-500 flex items-center gap-2 px-2">
            <Notebook size={14} className="text-indigo-500" />
            Các bài tập trong giáo án ({routine.items?.length || 0})
          </h2>

          {routine.items?.length === 0 ? (
            <Card className="border-dashed border-2 bg-gray-50/50 py-12 text-center">
              <div className="max-w-xs mx-auto text-gray-400">
                <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-bold text-gray-600">Chưa có bài tập</p>
                <p className="text-xs mt-1">Sử dụng nút "Thêm bài tập" để chọn các động tác từ thư viện vào giáo án này.</p>
              </div>
            </Card>
          ) : (
             <div className="grid grid-cols-1 gap-4">
               {routine.items.map((item: any, idx: number) => (
                 <Card key={item.id} className="border-0 shadow-sm bg-white hover:ring-2 ring-indigo-100 transition-all rounded-2xl overflow-hidden">
                   <CardContent className="p-0">
                     <div className="flex flex-col sm:flex-row p-4 sm:p-6 sm:items-center gap-6">
                        {/* Order & Icon */}
                        <div className="hidden sm:flex flex-col items-center">
                          <span className="text-3xl font-black text-gray-100 italic leading-none">{idx + 1}</span>
                        </div>
                        
                        {/* Exercise Meta */}
                        <div className="flex-1 space-y-1">
                          <h3 className="text-lg font-black text-gray-900 line-clamp-1">{item.exercise?.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg">
                              {item.exercise?.muscle_group}
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-lg">
                              {item.exercise?.equipment}
                            </span>
                          </div>
                        </div>

                        {/* Controls: Sets, Reps, Rest */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 sm:w-[450px]">
                           <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase text-gray-400">Số hiệp (Sets)</label>
                             <Input 
                               type="number" 
                               value={item.sets} 
                               onBlur={(e) => handleUpdateItem(item.id, { sets: Number(e.target.value) })}
                               className="h-9 font-bold bg-gray-50/50 border-gray-100" 
                             />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase text-gray-400">Số lần (Reps)</label>
                             <Input 
                               value={item.reps} 
                               onBlur={(e) => handleUpdateItem(item.id, { reps: e.target.value })}
                               className="h-9 font-bold bg-gray-50/50 border-gray-100" 
                             />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase text-gray-400">Nghỉ (sec)</label>
                             <Input 
                               type="number" 
                               value={item.rest_seconds} 
                               onBlur={(e) => handleUpdateItem(item.id, { rest_seconds: Number(e.target.value) })}
                               className="h-9 font-bold bg-gray-50/50 border-gray-100" 
                             />
                           </div>
                        </div>

                        {/* Action */}
                        <div className="flex justify-end pt-4 sm:pt-0 border-t sm:border-0">
                           <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-full" onClick={() => handleDeleteItem(item.id)}>
                             <Trash2 size={18} />
                           </Button>
                        </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
          )}
        </div>

        {/* Floating Adding Library (Drawer style overlay or Sidebar) */}
        {isAddingMode && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-500 flex flex-col pt-20 sm:pt-0">
             <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                <div>
                   <h2 className="text-xl font-black text-gray-900">Thư viện bài tập</h2>
                   <p className="text-xs text-gray-500 mt-1">Tìm kiếm và nhấn "+" để thêm vào lịch</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsAddingMode(false)}>
                   <Trash2 className="rotate-45" />
                </Button>
             </div>

             <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên bài, nhóm cơ..."
                    className="pl-10 rounded-xl bg-gray-100 border-0 focus:ring-indigo-500" 
                  />
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredExercises.map(ex => (
                  <div key={ex.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group">
                     <div>
                        <p className="font-black text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">{ex.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-400 capitalize">{ex.muscle_group} • {ex.equipment}</p>
                     </div>
                     <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white" onClick={() => handleAddExercise(ex)}>
                        <Plus size={16} />
                     </Button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {isAddingMode && <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40" onClick={() => setIsAddingMode(false)} />}
    </div>
  );
}
