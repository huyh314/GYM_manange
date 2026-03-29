'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, CalendarCheck, AlertTriangle, UserCheck,
  Clock, CheckCircle2, XCircle, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import PTPerfTable from './PTPerfTable';
import ExpiringClientsTable from './ExpiringClientsTable';

const RevenueChart = dynamic(() => import('./RevenueChart'), { 
  ssr: false,
  loading: () => <div className="w-full h-[250px] bg-gray-50 animate-pulse rounded-xl" />
});

interface DashboardStats {
  sessionsTodayCount: number;
  revenueEstimate: number;
  lowSessionAlerts: number;
  activePtCount: number;
  totalPtCount: number;
  monthlyCompletedCount: number;
  todaySchedule: any[];
  lowSessionClients: any[];
  weeklyRevenue: any[];
  ptPerformance: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const metricCards = stats ? [
    {
      title: 'Doanh thu tháng (ước tính)',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenueEstimate),
      sub: `${stats.monthlyCompletedCount} ca hoàn thành`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-t-emerald-500',
    },
    {
      title: 'Lịch tập hôm nay',
      value: stats.sessionsTodayCount,
      sub: `${format(new Date(), 'EEEE, dd/MM', { locale: vi })}`,
      icon: CalendarCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-t-blue-500',
    },
    {
      title: 'HLV đang hoạt động',
      value: `${stats.activePtCount}/${stats.totalPtCount}`,
      sub: 'Có lịch hôm nay',
      icon: UserCheck,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-t-violet-500',
    },
    {
      title: 'Học viên sắp hết buổi',
      value: stats.lowSessionAlerts,
      sub: 'Còn ≤ 3 buổi',
      icon: AlertTriangle,
      color: stats.lowSessionAlerts > 0 ? 'text-amber-600' : 'text-gray-400',
      bg: stats.lowSessionAlerts > 0 ? 'bg-amber-50' : 'bg-gray-50',
      border: stats.lowSessionAlerts > 0 ? 'border-t-amber-500' : 'border-t-gray-300',
    },
  ] : [];

  const getStatusBadge = (status: string) => {
    if (status === 'done') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle2 size={12} /> Xong
      </span>
    );
    if (status === 'cancelled') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <XCircle size={12} /> Huỷ
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        <Clock size={12} /> Chờ
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Bảng Tổng Quan</h1>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(), "EEEE, dd 'tháng' MM 'năm' yyyy", { locale: vi })}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm font-medium">
          ⚠️ Lỗi khi tải dữ liệu: {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
          ))
        ) : (
          metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className={`border-0 shadow-sm border-t-4 ${card.border} rounded-2xl overflow-hidden`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">{card.title}</p>
                    <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`${card.color} w-5 h-5`} />
                    </div>
                  </div>
                  <div className={`text-3xl font-black ${card.color} leading-none mb-1`}>{card.value}</div>
                  <div className="text-xs text-gray-400 font-medium mt-1">{card.sub}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Today's Schedule Table */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-800">Lịch tập hôm nay</h2>
        </div>
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b font-semibold">
                  <tr>
                    <th className="px-6 py-3">Giờ</th>
                    <th className="px-6 py-3">Học viên</th>
                    <th className="px-6 py-3">HLV</th>
                    <th className="px-6 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400">Đang tải...</td>
                    </tr>
                  ) : !stats?.todaySchedule?.length ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <CalendarCheck className="w-8 h-8 text-gray-200" />
                          <p className="font-medium text-gray-500">Không có lịch tập hôm nay</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    stats.todaySchedule.map(session => (
                      <tr key={session.id} className="border-b last:border-0 hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-gray-800">
                          {format(new Date(session.scheduled_at), 'HH:mm')}
                        </td>
                        <td className="px-6 py-3.5 text-gray-700 font-medium">
                          {session.client?.name || '—'}
                        </td>
                        <td className="px-6 py-3.5 text-gray-600">
                          {session.pt?.name || '—'}
                        </td>
                        <td className="px-6 py-3.5">
                          {getStatusBadge(session.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Performance section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-gray-800">Doanh thu 8 tuần gần đây</h2>
            </div>
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden h-[300px]">
              <CardContent className="p-4 h-full">
                <RevenueChart data={stats.weeklyRevenue} />
              </CardContent>
            </Card>
          </div>

          {/* PT Performance */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <UserCheck className="w-5 h-5 text-violet-500" />
              <h2 className="text-lg font-bold text-gray-800">Hiệu suất PT (Tháng này)</h2>
            </div>
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden h-[300px]">
              <CardContent className="p-0 h-full overflow-y-auto">
                <PTPerfTable data={stats.ptPerformance} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Low Session Alerts (Replaced with new component) */}
      {stats && stats.lowSessionClients.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800">Cảnh báo: Học viên sắp hết buổi</h2>
          </div>
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0">
               <ExpiringClientsTable data={stats.lowSessionClients} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
