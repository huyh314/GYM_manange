'use client';

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, PackageSearch, Users, CalendarCheck } from "lucide-react";

interface SummaryData {
  totalRevenue: number;
  packagesSold: number;
  totalSessions: number;
  newClientsCount: number;
}

export default function SummaryCards({ data, isLoading }: { data: SummaryData; isLoading: boolean }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const cards = [
    { title: 'Doanh thu', value: formatCurrency(data.totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Gói đã bán', value: data.packagesSold, icon: PackageSearch, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Tổng ca đã dạy', value: data.totalSessions, icon: CalendarCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
    { title: 'Học viên mới', value: data.newClientsCount, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(k => (
          <div key={k} className="h-28 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Card key={i} className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.title}</p>
                <p className={`text-xl font-black mt-1 ${card.color}`}>{card.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
