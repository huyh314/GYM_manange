'use client';

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format, subMonths, startOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useMemo } from 'react';

interface MonthPickerProps {
  value: string;
  onChange: (isoString: string) => void;
}

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  const months = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
       const date = startOfMonth(subMonths(now, i));
       arr.push({
         label: format(date, 'MMMM - yyyy', { locale: vi }),
         value: date.toISOString()
       });
    }
    return arr;
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-400">Chọn tháng:</span>
      <Select value={value} onValueChange={(val) => { if (val) onChange(val); }}>
        <SelectTrigger className="w-[200px] h-10 font-bold bg-[#121212] text-white border-white/10 focus:ring-1 focus:ring-[#d4af37] shadow-sm rounded-lg capitalize">
          <SelectValue placeholder="Chọn tháng..." />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1c1e] border-white/10 text-white">
          {months.map(m => (
            <SelectItem key={m.value} value={m.value} className="capitalize font-medium focus:bg-white/10 focus:text-[#d4af37] py-2 cursor-pointer">
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
