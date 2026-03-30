'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dumbbell, Search, ChevronDown, Plus, Check } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  name_en?: string;
  muscle_group: string;
  equipment?: string;
  is_active: boolean;
}

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  'chest': '🏋️ Ngực',
  'back': '💪 Lưng',
  'legs': '🦵 Chân',
  'shoulders': '🤸 Vai',
  'arms': '💪 Tay',
  'core': '🧘 Core',
  'cardio': '🏃 Cardio',
};

const MUSCLE_GROUP_ORDER = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'];

interface ExercisePickerProps {
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
}

export default function ExercisePicker({ value, onChange, disabled }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/exercises')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setExercises(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return exercises;
    const q = search.toLowerCase();
    return exercises.filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.name_en && e.name_en.toLowerCase().includes(q)) ||
      (e.equipment && e.equipment.toLowerCase().includes(q))
    );
  }, [exercises, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    for (const e of filtered) {
      if (!groups[e.muscle_group]) groups[e.muscle_group] = [];
      groups[e.muscle_group].push(e);
    }
    return groups;
  }, [filtered]);

  const handleSelect = (name: string) => {
    onChange(name);
    setOpen(false);
    setSearch('');
    setShowCustomInput(false);
  };

  const handleCustomSubmit = () => {
    if (customName.trim()) {
      handleSelect(customName.trim());
      setCustomName('');
    }
  };

  if (disabled) {
    return (
      <div className="font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded-md border text-sm truncate">
        {value || 'N/A'}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error asChild type issue */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between font-bold text-left h-auto py-2 bg-white shadow-sm"
        >
          <span className="truncate">
            {value ? (
              <span className="flex items-center gap-2">
                <Dumbbell size={14} className="text-indigo-500 shrink-0" />
                {value}
              </span>
            ) : (
              <span className="text-gray-400">Chọn bài tập...</span>
            )}
          </span>
          <ChevronDown size={14} className="text-gray-400 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 shadow-xl" align="start">
        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              ref={searchRef}
              placeholder="Tìm bài tập..."
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="max-h-[300px] overflow-y-auto">
          {MUSCLE_GROUP_ORDER.map(group => {
            const items = grouped[group];
            if (!items || items.length === 0) return null;
            return (
              <div key={group}>
                <div className="px-3 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b sticky top-0">
                  {MUSCLE_GROUP_LABELS[group] || group}
                </div>
                {items.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => handleSelect(exercise.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-indigo-50 transition-colors text-left ${
                      value === exercise.name ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{exercise.name}</span>
                    <div className="flex items-center gap-2">
                      {exercise.equipment && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                          {exercise.equipment}
                        </span>
                      )}
                      {value === exercise.name && <Check size={14} className="text-indigo-600" />}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-gray-400">
              Không tìm thấy bài tập
            </div>
          )}
        </div>

        {/* Custom Input */}
        <div className="border-t p-2">
          {showCustomInput ? (
            <div className="flex gap-1.5">
              <Input
                placeholder="Nhập tên bài tập..."
                className="h-8 text-sm flex-1"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                autoFocus
              />
              <Button size="sm" className="h-8 px-3 text-xs" onClick={handleCustomSubmit}>OK</Button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md font-medium transition-colors"
            >
              <Plus size={14} /> Thêm bài tập tuỳ chỉnh
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
