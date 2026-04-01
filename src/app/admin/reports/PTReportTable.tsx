'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertTriangle } from "lucide-react";

interface PTReportRow {
  pt_name: string;
  sessions_done: number;
  unique_clients: number;
  revenue_generated: number;
}

export default function PTReportTable({ data, isLoading }: { data: PTReportRow[]; isLoading: boolean }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

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
          <AlertTriangle className="w-8 h-8 opacity-20 mb-2" />
          <p className="text-sm font-medium">Không có dữ liệu PT</p>
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
                <th className="px-6 py-4 font-bold text-gray-300">Tên PT</th>
                <th className="px-6 py-4 font-bold text-center text-gray-300">Ca đã dạy</th>
                <th className="px-6 py-4 font-bold text-center text-gray-300">Học viên phụ trách</th>
                <th className="px-6 py-4 font-bold text-right text-gray-300">Doanh thu thu về</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((row, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-white/90">
                    {row.pt_name}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-blue-400">
                    {row.sessions_done}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-400">
                    {row.unique_clients}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-[#d4af37]">
                    {formatCurrency(row.revenue_generated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
