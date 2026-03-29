'use client';

import { useRouter } from 'next/navigation';
import { Users, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ExpiringClient {
  id: string; // package id
  remaining_sessions: number;
  client: { name: string; id: string };
  pt?: { name: string; id: string };
  package?: { name: string };
}

export default function ExpiringClientsTable({ data }: { data: ExpiringClient[] }) {
  const router = useRouter();

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-gray-400">
        <AlertTriangle className="w-8 h-8 opacity-20 mb-2" />
        <p className="text-sm font-medium">Không có học viên sắp hết buổi</p>
      </div>
    );
  }

  const getBadgeClass = (sessions: number) => {
    if (sessions <= 1) return 'bg-red-100 text-red-700 border border-red-200';
    if (sessions === 2) return 'bg-rose-100 text-rose-700 border border-rose-200';
    return 'bg-amber-100 text-amber-700 border border-amber-200';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b font-medium">
          <tr>
            <th className="px-4 py-3 font-semibold">Học viên</th>
            <th className="px-4 py-3 font-semibold text-center">PT phụ trách</th>
            <th className="px-4 py-3 font-semibold text-center">Còn lại</th>
            <th className="px-4 py-3 font-semibold text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.map((pkg) => (
            <tr 
              key={pkg.id} 
              className="border-b last:border-0 hover:bg-gray-50/60 transition-colors"
            >
              <td className="px-4 py-3 font-bold text-gray-800">
                <Link 
                  href={`/admin/clients/${pkg.client?.id}`} 
                  className="hover:underline hover:text-[#534AB7] flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] uppercase font-black text-gray-600">
                    {pkg.client?.name?.charAt(0) || '?'}
                  </div>
                  {pkg.client?.name || '—'}
                </Link>
              </td>
              <td className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                {pkg.pt?.name || '—'}
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold leading-tight ${getBadgeClass(pkg.remaining_sessions)}`}>
                  {pkg.remaining_sessions} buổi
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs px-2.5 font-bold border-[#534AB7]/30 text-[#534AB7] hover:bg-[#534AB7] hover:text-white"
                  onClick={() => router.push(`/admin/assign-package?client_id=${pkg.client?.id}`)}
                >
                  Gia hạn <ArrowRight size={12} className="ml-1" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
