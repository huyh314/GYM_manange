'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, Plus, Search, Edit, Eye, EyeOff, X, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  name_en?: string;
  muscle_group: string;
  equipment?: string;
  description?: string;
  video_url?: string;
  is_active: boolean;
}

const MUSCLE_GROUPS = [
  { value: '', label: 'Tất cả' },
  { value: 'chest', label: '🏋️ Ngực' },
  { value: 'back', label: '💪 Lưng' },
  { value: 'legs', label: '🦵 Chân' },
  { value: 'shoulders', label: '🤸 Vai' },
  { value: 'arms', label: '💪 Tay' },
  { value: 'core', label: '🧘 Core' },
  { value: 'cardio', label: '🏃 Cardio' },
];

const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formGroup, setFormGroup] = useState('chest');
  const [formEquipment, setFormEquipment] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const res = await fetch('/api/admin/exercises?active_only=false');
      const data = await res.json();
      if (Array.isArray(data)) setExercises(data);
    } catch {
      toast.error('Lỗi khi tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingExercise(null);
    setFormName('');
    setFormNameEn('');
    setFormGroup('chest');
    setFormEquipment('');
    setFormDescription('');
    setShowDialog(true);
  };

  const openEditDialog = (ex: Exercise) => {
    setEditingExercise(ex);
    setFormName(ex.name);
    setFormNameEn(ex.name_en || '');
    setFormGroup(ex.muscle_group);
    setFormEquipment(ex.equipment || '');
    setFormDescription(ex.description || '');
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formGroup) {
      toast.error('Tên và nhóm cơ bắt buộc');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(editingExercise ? { id: editingExercise.id } : {}),
        name: formName.trim(),
        name_en: formNameEn.trim() || null,
        muscle_group: formGroup,
        equipment: formEquipment || null,
        description: formDescription.trim() || null,
      };

      const res = await fetch('/api/admin/exercises', {
        method: editingExercise ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi');
      }

      toast.success(editingExercise ? 'Đã cập nhật' : 'Đã thêm bài tập mới');
      setShowDialog(false);
      loadExercises();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ex: Exercise) => {
    try {
      await fetch('/api/admin/exercises', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ex.id, is_active: !ex.is_active }),
      });
      loadExercises();
      toast.success(ex.is_active ? 'Đã ẩn bài tập' : 'Đã kích hoạt bài tập');
    } catch {
      toast.error('Lỗi');
    }
  };

  const filtered = exercises.filter(e => {
    const matchSearch = !search.trim() ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.name_en && e.name_en.toLowerCase().includes(search.toLowerCase()));
    const matchGroup = !filterGroup || e.muscle_group === filterGroup;
    return matchSearch && matchGroup;
  });

  const groupColor: Record<string, string> = {
    chest: 'bg-red-100 text-red-700',
    back: 'bg-blue-100 text-blue-700',
    legs: 'bg-green-100 text-green-700',
    shoulders: 'bg-purple-100 text-purple-700',
    arms: 'bg-yellow-100 text-yellow-700',
    core: 'bg-pink-100 text-pink-700',
    cardio: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <Dumbbell className="text-indigo-500" /> Thư Viện Bài Tập
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý danh sách bài tập chuẩn</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-indigo-600 hover:bg-indigo-700 font-bold rounded-full">
          <Plus size={16} className="mr-1" /> Thêm bài tập
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm bài tập..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MUSCLE_GROUPS.map(g => (
            <button
              key={g.value}
              onClick={() => setFilterGroup(g.value)}
              className={`whitespace-nowrap px-3 py-1.5 text-sm font-bold rounded-full border transition-all ${
                filterGroup === g.value
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="hidden sm:grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase">
              <div className="col-span-4">Tên bài tập</div>
              <div className="col-span-2 text-center">Nhóm cơ</div>
              <div className="col-span-2 text-center">Dụng cụ</div>
              <div className="col-span-2 text-center">Trạng thái</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="font-medium">Không tìm thấy bài tập</p>
              </div>
            ) : (
              filtered.map(ex => (
                <div key={ex.id} className={`grid grid-cols-1 sm:grid-cols-12 gap-2 px-6 py-3.5 items-center border-b last:border-0 hover:bg-gray-50/60 transition-colors ${!ex.is_active ? 'opacity-50' : ''}`}>
                  <div className="sm:col-span-4">
                    <p className="font-bold text-gray-900">{ex.name}</p>
                    {ex.name_en && <p className="text-xs text-gray-400">{ex.name_en}</p>}
                  </div>
                  <div className="sm:col-span-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${groupColor[ex.muscle_group] || 'bg-gray-100 text-gray-600'}`}>
                      {ex.muscle_group}
                    </span>
                  </div>
                  <div className="sm:col-span-2 text-center text-sm text-gray-500 font-medium">
                    {ex.equipment || '—'}
                  </div>
                  <div className="sm:col-span-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${ex.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ex.is_active ? <Eye size={10} /> : <EyeOff size={10} />}
                      {ex.is_active ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openEditDialog(ex)}>
                      <Edit size={12} className="mr-1" /> Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-7 text-xs ${ex.is_active ? 'text-gray-500' : 'text-green-600'}`}
                      onClick={() => handleToggleActive(ex)}
                    >
                      {ex.is_active ? <><EyeOff size={12} className="mr-1" /> Ẩn</> : <><Eye size={12} className="mr-1" /> Hiện</>}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Total count */}
      <p className="text-sm text-gray-400 text-center">
        {filtered.length} bài tập {filterGroup ? `trong nhóm "${filterGroup}"` : ''} {search ? `khớp "${search}"` : ''}
      </p>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowDialog(false)} className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full">
              <X size={18} className="text-gray-500" />
            </button>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-black text-gray-900">
                {editingExercise ? 'Sửa bài tập' : 'Thêm bài tập mới'}
              </h3>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-gray-500">Tên bài tập *</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="VD: Bench Press" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-gray-500">Tên tiếng Anh</Label>
                <Input value={formNameEn} onChange={e => setFormNameEn(e.target.value)} placeholder="VD: Bench Press" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-gray-500">Nhóm cơ *</Label>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.filter(g => g.value).map(g => (
                    <button
                      key={g.value}
                      onClick={() => setFormGroup(g.value)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                        formGroup === g.value ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-gray-500">Dụng cụ</Label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map(eq => (
                    <button
                      key={eq}
                      onClick={() => setFormEquipment(formEquipment === eq ? '' : eq)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                        formEquipment === eq ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-gray-500">Mô tả</Label>
                <textarea
                  className="w-full flex min-h-[60px] rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none"
                  placeholder="Hướng dẫn thực hiện..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-11">
                {saving ? 'Đang lưu...' : (
                  <><Save size={16} className="mr-2" /> {editingExercise ? 'Cập nhật' : 'Thêm bài tập'}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
