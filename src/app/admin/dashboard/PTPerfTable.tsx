'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CalendarCheck, Calendar } from 'lucide-react';

interface PTPerfData {
  id: string;
  name: string;
  sessions_this_month: number;
  active_clients: number;
  upcoming_sessions: number;
}

export default function PTPerfTable({ data }: { data: PTPerfData[] }) {
  const router = useRouter();

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-400">
        <Users className="w-8 h-8 opacity-20 mb-2" />
        <p className="text-sm font-medium">Chưa có dữ liệu HLV</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b font-medium">
          <tr>
            <th className="px-4 py-3 font-semibold">Tên PT</th>
            <th className="px-4 py-3 font-semibold text-center">
              <div className="flex items-center justify-center gap-1">
                 <CalendarCheck size={14} className="text-green-600" />
                 <span>Ca dạy</span>
              </div>
            </th>
            <th className="px-4 py-3 font-semibold text-center">
              <div className="flex items-center justify-center gap-1">
                 <Users size={14} className="text-blue-600" />
                 <span>Học viên</span>
              </div>
            </th>
            <th className="px-4 py-3 font-semibold text-center">
              <div className="flex items-center justify-center gap-1">
                 <span>Doanh thu (Ước tính)</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((pt, idx) => (
            <tr 
              key={pt.id} 
              onClick={() => router.push(`/admin/users/${pt.id}`)}
              className="border-b last:border-0 hover:bg-violet-50/30 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3.5 font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xs font-black text-violet-400 bg-violet-100 w-5 h-5 flex items-center justify-center rounded-md">
                   {idx + 1}
                </span>
                {pt.name}
              </td>
              <td className="px-4 py-3.5 text-center font-bold text-gray-700">
                {pt.sessions_this_month}
              </td>
              <td className="px-4 py-3.5 text-center font-semibold text-gray-600">
                {pt.active_clients}
              </td>
              <td className="px-4 py-3.5 text-center font-bold text-emerald-600">
                {new Intl.NumberFormat('vi-VN').format((pt as any).estimated_revenue || 0)}đ
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
