'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, TrendingUp, Calendar, AlertTriangle, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

// Assuming same interface
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
  avgSessionPrice: number;
  retentionRate: number;
  trends: {
    sessions: number;
    revenue: number;
  }
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

  const getStatusBadge = (status: string) => {
    if (status === 'done' || status === 'active') return (
       <div className="inline-flex items-center justify-center px-3 py-1 rounded bg-[#1a2e21] text-[#34d399] border border-[#34d399]/20 text-[11px] font-bold uppercase tracking-wider">
         Hoạt động
       </div>
    );
    if (status === 'cancelled' || status === 'expired') return (
       <div className="inline-flex items-center justify-center px-3 py-1 rounded bg-[#3b1a1a] text-[#f87171] border border-[#f87171]/20 text-[11px] font-bold uppercase tracking-wider">
         Đã hủy
       </div>
    );
    return (
       <div className="inline-flex items-center justify-center px-3 py-1 rounded bg-[#2a2417] text-[#fbbf24] border border-[#d4af37]/30 text-[11px] font-bold uppercase tracking-wider">
         Đang chờ
       </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h3 className="text-[#d4af37] text-xs font-bold tracking-widest uppercase mb-3">Dashboard</h3>
        <h1 className="text-3xl font-serif text-zinc-100 tracking-wide">Chào mừng, Admin</h1>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-500 rounded-lg p-4 text-sm font-medium">
          ⚠️ Lỗi khi tải dữ liệu: {error}
        </div>
      )}

      {/* Metric Cards - Dark Luxury Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-[#1a1c1e] border border-[#2a2b2e] animate-pulse rounded-2xl" />
          ))
        ) : (
          <>
            {/* Card 1 */}
            <Card className="bg-[#1a1c1e] border-[#2a2b2e] rounded-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">HLV Hoạt Động</p>
                    <Users className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div className="text-3xl font-serif text-zinc-100 mb-2">{stats?.activePtCount || 0}<span className="text-zinc-600 font-sans text-xl font-medium">/{stats?.totalPtCount || 0}</span></div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                   <span className="flex items-center text-[10px] font-bold text-[#34d399] tracking-wider bg-[#34d399]/10 border border-[#34d399]/20 px-2 py-0.5 rounded">
                     {stats?.retentionRate || 0}%
                   </span>
                   <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Tỉ lệ duy trì</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="bg-[#1a1c1e] border-[#2a2b2e] rounded-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Doanh Thu Tháng</p>
                    <div className="w-5 h-5 rounded-md bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/30">
                       <span className="text-[#d4af37] text-xs font-bold leading-none">$</span>
                    </div>
                  </div>
                  <div className="text-3xl font-serif text-zinc-100 mb-2">
                     {stats ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(stats.revenueEstimate) : '0 ₫'}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                   {stats?.trends.revenue !== undefined && (
                     <span className={`flex items-center text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${stats.trends.revenue >= 0 ? 'text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                       {stats.trends.revenue >= 0 ? '▲' : '▼'} {Math.abs(stats.trends.revenue)}%
                     </span>
                   )}
                   <span className="text-[10px] text-zinc-500 uppercase tracking-widest">So vs Tháng trước</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="bg-[#1a1c1e] border-[#2a2b2e] rounded-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Buổi Tập Hôm Nay</p>
                    <TrendingUp className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div className="text-3xl font-serif text-zinc-100 mb-2">{stats?.sessionsTodayCount || 0}</div>
                </div>
                <div className="flex items-center justify-between mt-4">
                   <div className="flex items-end gap-1 mb-1">
                      {/* Fake mini sparkline */}
                      <div className="w-1.5 h-3 bg-zinc-600 rounded-t-sm"></div>
                      <div className="w-1.5 h-4 bg-zinc-600 rounded-t-sm"></div>
                      <div className="w-1.5 h-2 bg-zinc-600 rounded-t-sm"></div>
                      <div className="w-1.5 h-5 bg-[#d4af37] rounded-t-sm shadow-[0_0_5px_rgba(212,175,55,0.5)]"></div>
                   </div>
                   <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Tổng: {stats?.monthlyCompletedCount || 0} ca</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 4 */}
            <Card className="bg-[#1a1c1e] border-[#2a2b2e] rounded-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Spa / Sắp Hết Hạn</p>
                    <AlertTriangle className={`w-4 h-4 ${stats?.lowSessionAlerts ? 'text-amber-500' : 'text-zinc-600'}`} />
                  </div>
                  <div className={`text-3xl font-serif mb-2 ${stats?.lowSessionAlerts ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-zinc-400'}`}>
                     {stats?.lowSessionAlerts || 0}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                   <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Học viên còn ≤ 3 buổi</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Member Management Table (Adapted from Schedule/Alerts for design) */}
      <div className="bg-[#1a1c1e] border border-[#2a2b2e] rounded-xl overflow-hidden mt-8 shadow-lg">
        <div className="px-6 py-5 border-b border-[#2a2b2e] flex items-center justify-between bg-[#121212]/30">
           <h2 className="font-serif text-[17px] tracking-wide text-zinc-100 uppercase">Quản Lý Thành Viên <span className="text-zinc-600 text-sm ml-2 font-sans lowercase">lịch tập hôm nay</span></h2>
           <button className="text-[11px] uppercase tracking-wider bg-[#2a2b2e] hover:bg-[#3a3b3e] text-zinc-300 font-bold px-4 py-2 rounded-lg transition-colors border border-zinc-700">
             Xem tất cả
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-[#2a2b2e] bg-[#1a1c1e] font-bold">
              <tr>
                <th className="px-6 py-4 font-semibold w-16 text-center">STT</th>
                <th className="px-6 py-4 font-semibold">Khách Hàng</th>
                <th className="px-6 py-4 font-semibold">Trạng Thái</th>
                <th className="px-6 py-4 font-semibold">Gói Tập</th>
                <th className="px-6 py-4 font-semibold">Thời Gian</th>
                <th className="px-6 py-4 font-semibold">HLV</th>
                <th className="px-6 py-4 font-semibold text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2b2e]/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-medium tracking-widest uppercase text-xs">Đang tải dữ liệu...</td>
                </tr>
              ) : !stats?.todaySchedule?.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-medium tracking-widest uppercase text-xs">Không có lịch tập</td>
                </tr>
              ) : (
                stats.todaySchedule.slice(0, 5).map((session, index) => (
                  <tr key={session.id} className="hover:bg-[#2a2b2e]/30 transition-colors group">
                    <td className="px-6 py-4 text-center text-zinc-600 font-serif text-lg">
                      {index + 1}.
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-zinc-800 text-[#d4af37] flex items-center justify-center font-bold text-sm uppercase border border-[#d4af37]/20 shadow-sm">
                           {session.client?.name?.charAt(0) || 'U'}
                         </div>
                         <div className="flex flex-col">
                           <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors text-[13px]">{session.client?.name || '—'}</span>
                           <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Thành viên</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[13px] font-medium ${session.client?.vip ? 'text-[#d4af37]' : 'text-zinc-400'}`}>
                         {session.client?.vip ? 'Platinum' : 'Gold'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-[13px]">
                      {format(new Date(session.scheduled_at), 'HH:mm - dd/MM')}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-[13px]">
                      {session.pt?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-zinc-500 hover:text-white p-2 border border-transparent hover:border-zinc-700 rounded-md transition-all">
                         <ChevronRight size={16} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
