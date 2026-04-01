'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle } from "lucide-react";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SoldPackage {
  id: string;
  amount_paid: number;
  created_at: string;
  client?: { id: string; name: string };
  pt?: { id: string; name: string };
  package?: { name: string };
}

export default function PackagesSoldTable({ data, isLoading }: { data: SoldPackage[]; isLoading: boolean }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const totalAmount = data?.reduce((sum, pkg) => sum + (pkg.amount_paid || 0), 0) || 0;

  if (isLoading) {
    return (
      <Card className="border-white/5 bg-[#1a1c1e] shadow-sm rounded-2xl overflow-hidden mt-2">
        <CardContent className="p-0 h-[300px] flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full px-6">
             <div className="h-4 bg-white/5 rounded w-1/4"></div>
             <div className="h-8 bg-white/5 rounded"></div>
             <div className="h-8 bg-white/5 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-white/5 bg-[#1a1c1e] shadow-sm rounded-2xl overflow-hidden mt-2">
        <CardContent className="p-0 h-[250px] flex flex-col items-center justify-center text-gray-500">
          <Package className="w-8 h-8 opacity-20 mb-2" />
          <p className="text-sm font-medium">Chưa bán được gói nào</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/5 bg-[#1a1c1e] text-white shadow-sm rounded-2xl overflow-hidden mt-2">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#121212] border-b border-white/10 font-medium">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-300">Ngày bán</th>
                <th className="px-6 py-4 font-bold text-gray-300">Học viên</th>
                <th className="px-6 py-4 font-bold text-gray-300">Gói</th>
                <th className="px-6 py-4 font-bold text-gray-300">PT phụ trách</th>
                <th className="px-6 py-4 font-bold text-right text-gray-300">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-400">
                    {format(new Date(row.created_at), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 font-bold text-white/90">
                    {row.client?.name || '—'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-blue-400">
                    {row.package?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-medium">
                    {row.pt?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-[#d4af37]">
                    {formatCurrency(row.amount_paid)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#121212] border-t border-white/10">
              <tr>
                <td colSpan={4} className="px-6 py-4 font-bold text-right text-gray-400 uppercase">
                  Tổng cộng
                </td>
                <td className="px-6 py-4 font-black flex-1 text-right text-[#d4af37] text-lg">
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
