'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, CheckCircle, Plus, Trash2, Dumbbell, UserSquare2, ListTodo } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClientProfileTab from './ClientProfileTab';

type LogbookSet = { reps: number | string; kg: number | string };
type LogbookEntry = { exercise: string; sets: LogbookSet[] };

export default function SessionDetailPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  
  const [session, setSession] = useState<any>(null);
  
  // Structured logbook
  const [logbook, setLogbook] = useState<LogbookEntry[]>([]);
  const [notes, setNotes] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/pt/sessions')
      .then(res => res.json())
      .then((data: any[]) => {
        const current = data.find(s => s.id === sessionId);
        if (current) {
          setSession(current);
          if (Array.isArray(current.logbook)) {
            setLogbook(current.logbook);
          } else if (current.logbook && current.logbook.exercises) {
             // Fallback if old format
             setNotes(current.logbook.exercises + '\n' + (current.notes || ''));
          }
          if (current.notes) setNotes(current.notes);
          setIsDone(current.status === 'done' || current.status === 'completed');
        }
        setLoading(false);
      });
  }, [sessionId]);

  const saveLogbook = async () => {
    if (isDone) return;
    setIsSaving(true);
    try {
      await fetch(`/api/pt/sessions/${sessionId}/logbook`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logbook, notes })
      });
    } catch(err) {
      console.error(err);
    }
    setIsSaving(false);
  };

  // Implement autosave 30s
  useEffect(() => {
    if (!session || isDone || loading) return;
    const interval = setInterval(() => {
      saveLogbook();
    }, 30000);
    return () => clearInterval(interval);
  }, [logbook, notes, session, isDone, loading]);

  const handleCheckIn = async () => {
    if (!confirm('Bạn có chắc chắn muốn điểm danh? Học viên sẽ bị trừ 1 buổi tập.')) return;
    
    await saveLogbook();

    try {
      const res = await fetch(`/api/pt/sessions/${sessionId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logbook, notes })
      });
      if (res.ok) {
        setIsDone(true);
        alert('Điểm danh thành công!');
        router.push('/pt/today');
      } else {
        const err = await res.json();
        alert('Lỗi: ' + err.error);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const addExercise = () => {
    setLogbook([...logbook, { exercise: '', sets: [{ reps: '', kg: '' }] }]);
  };

  const addSet = (exerciseIndex: number) => {
    const newLogbook = [...logbook];
    newLogbook[exerciseIndex].sets.push({ reps: '', kg: '' });
    setLogbook(newLogbook);
  };

  const updateExercise = (index: number, val: string) => {
    const newLogbook = [...logbook];
    newLogbook[index].exercise = val;
    setLogbook(newLogbook);
  };

  const updateSet = (eIndex: number, sIndex: number, field: 'reps' | 'kg', val: string) => {
    const newLogbook = [...logbook];
    newLogbook[eIndex].sets[sIndex][field] = val;
    setLogbook(newLogbook);
  };

  const removeExercise = (index: number) => {
    const newLogbook = [...logbook];
    newLogbook.splice(index, 1);
    setLogbook(newLogbook);
  };

  const removeSet = (eIndex: number, sIndex: number) => {
    const newLogbook = [...logbook];
    newLogbook[eIndex].sets.splice(sIndex, 1);
    setLogbook(newLogbook);
  };

  if (loading) return <div className="p-6 text-center text-gray-500 animate-pulse">Đang tải chi tiết buổi tập...</div>;
  if (!session) return <div className="p-6 text-center text-gray-500">Không tìm thấy buổi tập.</div>;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-24 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 bg-white sticky top-0 z-10 pt-2 px-1">
        <button onClick={() => router.back()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-gray-900 flex-1 tracking-tight">Chi tiết Buổi tập</h2>
        {isSaving && <span className="text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full shadow-sm">Đang lưu..</span>}
      </div>

      <Card className={`${isDone ? 'bg-green-50/50 border-green-100' : 'bg-white shadow-sm'}`}>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Học viên</p>
            <p className="font-bold text-lg text-gray-900">{session.client?.name}</p>
          </div>
          <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-2">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Trạng thái</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isDone ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {isDone ? 'Đã hoàn thành' : 'Chưa điểm danh'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="logbook" className="w-full">
        <TabsList className="bg-gray-100 rounded-xl p-1 w-full flex shadow-sm mb-4">
          <TabsTrigger value="logbook" className="flex-1 font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700">
            <ListTodo size={16} className="mr-2" /> Điểm danh
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700">
            <UserSquare2 size={16} className="mr-2" /> Hồ sơ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logbook" className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
             <h3 className="font-black text-lg text-gray-800 tracking-tight flex items-center">
               <Dumbbell className="w-5 h-5 mr-2 text-indigo-500" />
               Logbook
             </h3>
             {!isDone && (
               <Button onClick={addExercise} size="sm" variant="outline" className="h-8 text-xs font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                 <Plus className="w-3 h-3 mr-1" /> Thêm bài
               </Button>
             )}
          </div>

          {logbook.length === 0 && !isDone && (
            <div className="text-center py-6 bg-gray-50 border border-dashed rounded-xl">
               <p className="text-sm text-gray-500 font-medium">Chưa có bài tập nào.</p>
            </div>
          )}

          <div className="space-y-4">
            {logbook.map((entry, eIdx) => (
              <Card key={eIdx} className="overflow-hidden border shadow-sm">
                 <div className="bg-gray-50 border-b p-3 flex gap-2 items-center">
                    <Input 
                      placeholder="Tên bài tập (VD: Bench Press)" 
                      className="font-bold text-gray-900 bg-white shadow-sm"
                      value={entry.exercise}
                      onChange={(e) => updateExercise(eIdx, e.target.value)}
                      disabled={isDone}
                    />
                    {!isDone && (
                      <Button variant="ghost" size="icon" onClick={() => removeExercise(eIdx)} className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                 </div>
                 <div className="p-3 space-y-2">
                    <div className="flex text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                       <div className="w-12 text-center">Set</div>
                       <div className="flex-1 text-center">Reps</div>
                       <div className="flex-1 text-center">Kg</div>
                       {!isDone && <div className="w-8"></div>}
                    </div>
                    {entry.sets.map((set, sIdx) => (
                      <div key={sIdx} className="flex gap-2 items-center">
                         <div className="w-12 text-center text-sm font-bold text-gray-500">{sIdx + 1}</div>
                         <Input 
                           type="number"
                           inputMode="numeric"
                           placeholder="10"
                           className="flex-1 text-center font-bold text-gray-900 bg-gray-50/50"
                           value={set.reps}
                           onChange={(e) => updateSet(eIdx, sIdx, 'reps', e.target.value)}
                           disabled={isDone}
                         />
                         <Input 
                           type="number"
                           inputMode="numeric"
                           step="0.5"
                           placeholder="50"
                           className="flex-1 text-center font-bold text-blue-700 bg-blue-50/50"
                           value={set.kg}
                           onChange={(e) => updateSet(eIdx, sIdx, 'kg', e.target.value)}
                           disabled={isDone}
                         />
                         {!isDone && (
                           <Button variant="ghost" size="icon" onClick={() => removeSet(eIdx, sIdx)} className="w-8 h-8 text-gray-400 hover:text-red-500 shrink-0">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         )}
                      </div>
                    ))}
                    {!isDone && (
                      <Button variant="ghost" size="sm" onClick={() => addSet(eIdx)} className="w-full mt-2 border border-dashed text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                        <Plus className="w-4 h-4 mr-1" /> Thêm Set
                      </Button>
                    )}
                 </div>
              </Card>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Ghi chú & Đánh giá (Hiển thị cho học viên)</label>
            <textarea 
              className="w-full flex min-h-[100px] rounded-xl border border-input bg-white px-4 py-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 resize-none font-medium"
              placeholder="Ghi chú về buổi tập, lời khuyên dinh dưỡng, nhắc nhở nghỉ ngơi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isDone}
            ></textarea>
          </div>
          
          {/* Actions placeholder inside tab - hidden, maintained below */}
          <div className="h-8"></div>
        </TabsContent>
        
        <TabsContent value="profile" className="mt-0">
            {session.client_id ? (
              <ClientProfileTab clientId={session.client_id} />
            ) : (
              <div className="p-8 text-center text-gray-400 animate-pulse">Đang tải Id học viên...</div>
            )}
        </TabsContent>
      </Tabs>

      {/* Fixed bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-lg mx-auto flex gap-3">
          {!isDone ? (
            <>
              <Button variant="outline" className="flex-1 font-bold h-12 border-gray-200 shadow-sm" onClick={saveLogbook}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
              </Button>
              <Button className="flex-[2] shadow-lg bg-green-600 hover:bg-green-700 font-bold h-12 text-sm" onClick={handleCheckIn}>
                <CheckCircle className="mr-2 h-5 w-5" /> HOÀN THÀNH
              </Button>
            </>
          ) : (
            <Button className="w-full bg-green-50 text-green-700 hover:bg-green-50 h-12 font-bold cursor-default border border-green-200">
              <CheckCircle className="mr-2 h-5 w-5" /> Đã điểm danh thành công
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
