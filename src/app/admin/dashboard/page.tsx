'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, TrendingUp, AlertTriangle, ChevronRight, QrCode, UserPlus, Activity, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { format } from 'date-fns';

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

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-[#d4af37] text-xs font-bold tracking-widest uppercase mb-2">Dashboard</h3>
          <h1 className="text-2xl md:text-3xl font-serif text-zinc-100 tracking-wide">Command Center</h1>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#b5952f] text-black px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <QrCode size={18} />
            <span>Quét Mã QR</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1a1c1e] hover:bg-[#2a2b2e] text-zinc-100 border border-[#2a2b2e] px-4 py-2.5 rounded-xl font-bold text-sm transition-all">
            <UserPlus size={18} />
            <span>Thêm Hội Viên</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-500 rounded-lg p-4 text-sm font-medium">
          ⚠️ Lỗi khi tải dữ liệu: {error}
        </div>
      )}

      {/* Metric Cards - Dark Luxury Style with Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-[#1a1c1e] border border-[#2a2b2e] animate-pulse rounded-2xl" />
          ))
        ) : (
          <>
            {/* Card 1 */}
            <Card className="bg-[#1a1c1e] border-[#2a2b2e] rounded-2xl overflow-hidden relative group transition-all duration-300 hover:border-[#d4af37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl group-hover:bg-[#d4af37]/10 transition-colors pointer-events-none" />
               <CardContent className="p-4 sm:p-5 relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                   <div className="flex justify-between items-start mb-2">
                     <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">HLV / Tổng số</p>
                     <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700">
                       <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                     </div>
                   </div>
                   <div className="text-2xl sm:text-3xl font-serif text-zinc-100">{stats?.activePtCount || 0}<span className="text-zinc-600 font-sans text-lg sm:text-xl font-medium">/{stats?.totalPtCount || 0}</span></div>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="flex items-center text-[10px] font-bold text-[#34d399] tracking-wider px-1.5 py-0.5 rounded bg-[#34d399]/10 border border-[#34d399]/20">
                      {stats?.retentionRate || 0}%
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest hidden sm:inline">Duy trì</span>
                    <Activity size={12} className="text-[#34d399] opacity-50 sm:hidden" />
                 </div>
               </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="bg-[#1a1c1e] border-[#2a2b2e] rounded-2xl overflow-hidden relative group transition-all duration-300 hover:border-[#d4af37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl group-hover:bg-[#d4af37]/10 transition-colors pointer-events-none" />
               <CardContent className="p-4 sm:p-5 relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                   <div className="flex justify-between items-start mb-2">
                     <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">Doanh Thu</p>
                     <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700">
                        <span className="text-[#d4af37] text-[10px] font-bold leading-none align-middle block">VNĐ</span>
                     </div>
                   </div>
                   <div className="text-xl sm:text-2xl lg:text-3xl font-serif text-zinc-100 truncate mt-1">
                      {stats ? new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(stats.revenueEstimate) : '0'}
                   </div>
                 </div>
                 <div className="flex items-center justify-between">
                    {stats?.trends.revenue !== undefined && (
                      <span className={`flex items-center text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${stats.trends.revenue >= 0 ? 'text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                        {stats.trends.revenue >= 0 ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />} 
                        {Math.abs(stats.trends.revenue)}%
                      </span>
                    )}
                 </div>
               </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="bg-[#1a1c1e] border-[#2a2b2e] rounded-2xl overflow-hidden relative group transition-all duration-300 hover:border-[#d4af37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl group-hover:bg-[#d4af37]/10 transition-colors pointer-events-none" />
               <CardContent className="p-4 sm:p-5 relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                   <div className="flex justify-between items-start mb-2">
                     <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">Buổi Tập Nay</p>
                     <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700">
                       <TrendingUp className="w-3.5 h-3.5 text-[#d4af37]" />
                     </div>
                   </div>
                   <div className="text-2xl sm:text-3xl font-serif text-zinc-100">{stats?.sessionsTodayCount || 0}</div>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-end gap-1 mb-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                       <div className="w-1 sm:w-1.5 h-2 bg-zinc-600 rounded-sm"></div>
                       <div className="w-1 sm:w-1.5 h-4 bg-zinc-600 rounded-sm"></div>
                       <div className="w-1 sm:w-1.5 h-3 bg-zinc-600 rounded-sm"></div>
                       <div className="w-1 sm:w-1.5 h-5 bg-[#d4af37] rounded-sm shadow-[0_0_5px_rgba(212,175,55,0.5)]"></div>
                    </div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">THÁNG: {stats?.monthlyCompletedCount || 0}</span>
                 </div>
               </CardContent>
            </Card>

            {/* Card 4 */}
            <Card className="bg-[#1a1c1e] border-[#2a2b2e] rounded-2xl overflow-hidden relative group transition-all duration-300 hover:border-[#d4af37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl group-hover:bg-[#d4af37]/10 transition-colors pointer-events-none" />
               <CardContent className="p-4 sm:p-5 relative z-10 flex flex-col h-full justify-between gap-4">
                 <div>
                   <div className="flex justify-between items-start mb-2">
                     <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">Sắp Hết Hạn</p>
                     <div className={`p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700 animate-pulse`}>
                       <AlertTriangle className={`w-3.5 h-3.5 ${stats?.lowSessionAlerts ? 'text-amber-500' : 'text-zinc-500'}`} />
                     </div>
                   </div>
                   <div className={`text-2xl sm:text-3xl font-serif mb-1 ${stats?.lowSessionAlerts ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-zinc-100'}`}>
                      {stats?.lowSessionAlerts || 0}
                   </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Cần gia hạn</span>
                 </div>
               </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Live Activity Feed */}
      <div className="bg-[#1a1c1e] border border-[#2a2b2e] rounded-2xl overflow-hidden mt-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
        <div className="px-5 py-4 border-b border-[#2a2b2e] flex items-center justify-between bg-gradient-to-b from-[#ffffff03] to-transparent">
           <div className="flex items-center gap-2.5">
             <div className="w-2 h-2 rounded-full bg-[#34d399] animate-[ping_2s_ease-in-out_infinite] absolute ml-0.5" />
             <div className="w-3 h-3 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
             <h2 className="font-serif text-[15px] sm:text-[17px] tracking-wide text-zinc-100 uppercase">Hoạt Động Gần Đây</h2>
           </div>
           <button className="text-[10px] uppercase tracking-wider text-zinc-400 hover:text-[#d4af37] transition-colors flex items-center gap-1 group">
             Xem tất cả <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
        <div className="p-0">
          <div className="divide-y divide-[#2a2b2e]/50">
            {isLoading ? (
               <div className="p-8 text-center text-zinc-500 text-xs tracking-widest uppercase flex flex-col items-center justify-center gap-3">
                 <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                 Đang tải dữ liệu trực tiếp...
               </div>
             ) : !stats?.todaySchedule?.length ? (
               <div className="p-8 text-center text-zinc-500 text-xs tracking-widest uppercase flex flex-col items-center justify-center gap-2">
                 <Activity size={24} className="opacity-20 mb-2" />
                 Chưa có hoạt động check-in nào trong ngày
               </div>
             ) : (
               stats.todaySchedule.slice(0, 5).map((session) => {
                 const isDone = session.status === 'done';
                 const clientInitial = session.client?.name?.charAt(0) || 'U';
                 
                 return (
                   <div key={session.id} className="p-4 flex items-center gap-4 hover:bg-[#2a2b2e]/30 transition-colors group cursor-pointer">
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base uppercase shadow-inner overflow-hidden border ${isDone ? 'bg-[#1a2e21] text-[#34d399] border-[#34d399]/20' : 'bg-zinc-800 text-[#d4af37] border-[#d4af37]/20'}`}>
                          {clientInitial}
                        </div>
                        {isDone ? (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#121212] flex items-center justify-center shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                          </div>
                        ) : (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#121212] flex items-center justify-center shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-zinc-200 text-[13px] sm:text-sm truncate group-hover:text-white transition-colors pr-2">
                            {session.client?.name || 'Thành viên vô danh'}
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap shrink-0 flex items-center gap-1">
                            <Clock size={10} />
                            {format(new Date(session.scheduled_at), 'HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                            PT: <span className="text-zinc-200">{session.pt?.name || '—'}</span>
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isDone ? (
                              <span className="px-1.5 py-0.5 border border-[#34d399]/20 bg-[#34d399]/10 text-[#34d399] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded">
                                Đã tập
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 border border-amber-500/20 bg-amber-500/10 text-amber-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded">
                                Sắp tới
                              </span>
                            )}
                            {session.client?.vip && (
                              <span className="px-1.5 py-0.5 border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded shadow-[0_0_5px_rgba(212,175,55,0.2)]">
                                VIP
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                   </div>
                 );
               })
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
