import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Calendar, Clock, BarChart3, User, CalendarDays, TrendingUp, QrCode, Dumbbell, Award, Package, Zap } from 'lucide-react';
import { format, isFuture, startOfWeek, startOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { QRCheckInModal } from '@/components/QRCheckInModal';
import Link from 'next/link';

import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export default async function ClientHomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const userId = payload.id;
  const supabase = await createSupabaseServerClient();

  // Execute all queries in parallel
  const [
    { data: profile },
    { data: activePackages },
    { data: nextSessions },
    { data: allSessions },
    { data: recentDoneSessions },
    { data: weightLogs }
  ] = await Promise.all([
    supabase.from('users').select('id, name, phone, tier, role').eq('id', userId).single(),
    supabase.from('user_packages').select('*, package:packages(name, total_sessions)').eq('client_id', userId).eq('status', 'active').order('remaining_sessions', { ascending: true }).limit(1),
    supabase.from('sessions').select('*, pt:users!sessions_pt_id_fkey(name)').eq('client_id', userId).eq('status', 'scheduled').gt('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(3),
    supabase.from('sessions').select('checked_in_at').eq('client_id', userId).eq('status', 'done'),
    supabase.from('sessions').select('id, checked_in_at, pt:users!sessions_pt_id_fkey(name)').eq('client_id', userId).eq('status', 'done').order('checked_in_at', { ascending: false }).limit(3),
    supabase.from('weight_logs').select('weight_kg, recorded_at').eq('client_id', userId).order('recorded_at', { ascending: false }).limit(1)
  ]);

  const activePackage = activePackages?.[0];
  const nextSession = nextSessions?.[0];
  const latestWeight = weightLogs?.[0]?.weight_kg;

  if (!profile) return null;

  let totalCompleted = 0;
  let thisWeek = 0;
  let thisMonth = 0;

  if (allSessions) {
    totalCompleted = allSessions.length;
    const now = new Date();
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
    const startOfCurrentMonth = startOfMonth(now);

    allSessions.forEach(session => {
      const checkedInAt = new Date(session.checked_in_at);
      if (checkedInAt >= startOfCurrentWeek) thisWeek++;
      if (checkedInAt >= startOfCurrentMonth) thisMonth++;
    });
  }

  // Dynamic greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const firstName = (profile.name as string)?.split(' ').pop() || (profile.name as string);

  const totalInPackage = activePackage?.package?.total_sessions || activePackage?.remaining_sessions || 0;
  const remainingSessions = activePackage?.remaining_sessions || 0;
  const usedSessions = totalInPackage - remainingSessions;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 mt-1 pb-6">

      {/* ═══════════════════════════════════════════════ */}
      {/* 1. MEMBERSHIP CARD (Hero) */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="w-full flex justify-center drop-shadow-2xl">
        <div className="relative w-full max-w-sm h-48 rounded-2xl overflow-hidden p-5 flex flex-col justify-between"
             style={{
               background: 'linear-gradient(135deg, #2a2d34 0%, #1e1f24 50%, #141518 100%)',
               boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
             }}
        >
          {/* Subtle geometric background pattern */}
          <div className="absolute inset-x-0 inset-y-0 opacity-10 pointer-events-none"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}
          />
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex flex-col">
              <span className="font-serif text-[#d4af37] text-xl tracking-wider leading-tight">QN FITNESS</span>
              <span className="text-[8px] text-[#d4af37]/70 tracking-[0.2em]">PRIVATE CLUB</span>
            </div>
            <span className="text-[#d4af37] text-xs font-semibold tracking-widest mt-1">MEMBERSHIP</span>
          </div>

          <div className="relative z-10 flex justify-between items-end">
            <div>
              <div className="text-zinc-100 font-bold text-lg tracking-wide uppercase">{profile.name}</div>
              <div className="text-zinc-400 text-[10px] mt-1 space-x-1">
                <span>Thành viên</span>
                <span className="text-zinc-300">QN FITNESS</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#d4af37] to-[#e5c56c] px-3 py-1.5 rounded-md shadow-sm">
              <span className="text-zinc-900 font-bold text-sm tracking-widest uppercase">
                {(profile.tier as string) === 'vip' ? 'VIP' : (profile.tier as string) === 'premium' ? 'PREMIUM' : activePackage ? 'MEMBER' : 'BASIC'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* 2. WELCOME GREETING */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="mt-6 mb-2 px-1">
        <h2 className="text-2xl font-serif text-[#d4af37]">{greeting}, {firstName}</h2>
        <p className="text-zinc-500 text-sm mt-1">Let's Elevate Your Journey 💪</p>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* 3. QUICK STATS ROW */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-3">
        {/* Buổi tập tháng này */}
        <div className="bg-[#1e1e1e] rounded-2xl p-3 border border-[#2a2b2e] text-center">
          <div className="w-8 h-8 mx-auto rounded-xl bg-[#d4af37]/10 flex items-center justify-center mb-2 border border-[#d4af37]/20">
            <Zap size={16} className="text-[#d4af37]" />
          </div>
          <p className="text-2xl font-black text-zinc-100">{thisMonth}</p>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Tháng này</p>
        </div>
        {/* Tổng buổi */}
        <div className="bg-[#1e1e1e] rounded-2xl p-3 border border-[#2a2b2e] text-center">
          <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2 border border-emerald-500/20">
            <Award size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-zinc-100">{totalCompleted}</p>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Tổng buổi</p>
        </div>
        {/* Gói tập còn lại */}
        <div className="bg-[#1e1e1e] rounded-2xl p-3 border border-[#2a2b2e] text-center">
          <div className="w-8 h-8 mx-auto rounded-xl bg-sky-500/10 flex items-center justify-center mb-2 border border-sky-500/20">
            <Package size={16} className="text-sky-400" />
          </div>
          <p className="text-2xl font-black text-zinc-100">{remainingSessions}</p>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Còn lại</p>
        </div>
      </div>

      {/* Active Package Info */}
      {activePackage && (
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2b2e] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8c7442] flex items-center justify-center shadow-lg shrink-0">
            <Package size={20} className="text-zinc-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-100 truncate">{activePackage.package?.name || 'Gói tập'}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Đã dùng {usedSessions}/{totalInPackage} buổi</p>
          </div>
          <div className="shrink-0">
            {/* Mini progress bar */}
            <div className="w-20 h-2 bg-[#2a2b2e] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#e5c56c] transition-all duration-700"
                style={{ width: `${totalInPackage > 0 ? (usedSessions / totalInPackage) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[9px] text-zinc-500 text-right mt-1">{remainingSessions} buổi còn</p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* 4. QUICK ACTIONS GRID */}
      {/* ═══════════════════════════════════════════════ */}
      <div>
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-1">Thao tác nhanh</h3>
        <div className="grid grid-cols-2 gap-3">
          <QRCheckInModal 
            user={{ id: profile.id as string, name: profile.name as string, phone: profile.phone as string }} 
            trigger={
              <button className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-[#1e1e1e] rounded-2xl border border-[#2a2b2e] hover:border-[#d4af37]/50 shadow-sm transition-all text-left w-full h-full group">
                <div className="p-2.5 bg-[#d4af37]/10 rounded-xl text-[#d4af37] border border-[#d4af37]/20 group-hover:bg-[#d4af37]/20 transition-colors">
                  <QrCode size={20} />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-zinc-100 uppercase tracking-wide">Check-In</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Quét mã QR</div>
                </div>
              </button>
            }
          />
          <Link href="/client/history" className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-[#1e1e1e] rounded-2xl border border-[#2a2b2e] hover:border-[#d4af37]/50 shadow-sm transition-all text-left w-full h-full group">
            <div className="p-2.5 bg-[#d4af37]/10 rounded-xl text-[#d4af37] border border-[#d4af37]/20 group-hover:bg-[#d4af37]/20 transition-colors">
              <CalendarDays size={20} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-zinc-100 uppercase tracking-wide">Lịch Tập</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Xem lịch sử</div>
            </div>
          </Link>
          <Link href="/client/profile" className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-[#1e1e1e] rounded-2xl border border-[#2a2b2e] hover:border-[#d4af37]/50 shadow-sm transition-all text-left w-full h-full group">
            <div className="p-2.5 bg-[#d4af37]/10 rounded-xl text-[#d4af37] border border-[#d4af37]/20 group-hover:bg-[#d4af37]/20 transition-colors">
              <User size={20} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-zinc-100 uppercase tracking-wide">My Trainer</div>
              <div className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[100px] sm:max-w-[120px]">{nextSession?.pt?.name || 'Chi tiết PT'}</div>
            </div>
          </Link>
          <Link href="/client/progress" className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-[#1e1e1e] rounded-2xl border border-[#2a2b2e] hover:border-[#d4af37]/50 shadow-sm transition-all text-left w-full h-full group">
            <div className="p-2.5 bg-[#d4af37]/10 rounded-xl text-[#d4af37] border border-[#d4af37]/20 group-hover:bg-[#d4af37]/20 transition-colors">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-zinc-100 uppercase tracking-wide">Tiến Độ</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{activePackage ? `Còn ${remainingSessions} buổi` : 'Xem thống kê'}</div>
            </div>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* 5. YOUR SCHEDULE */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="mt-4">
        <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 px-1">Lịch tập sắp tới</h3>
        
        {nextSessions && nextSessions.length > 0 ? (
          <div className="space-y-3">
            {nextSessions.map((session: any, idx: number) => (
              <div key={session.id || idx} className="flex items-center gap-4 pl-4 border-l-2 border-[#d4af37] py-3 bg-gradient-to-r from-[#1e1e1e]/80 to-transparent rounded-r-2xl">
                <div className="flex-1">
                  <div className="text-zinc-100 font-bold text-[15px] tracking-wide">Buổi tập cùng PT</div>
                  <div className="text-zinc-500 text-sm mt-1">{session.pt?.name || 'Chưa rõ'}</div>
                </div>
                <div className="text-right pr-2">
                  <div className="text-[#d4af37] text-xs font-semibold tracking-wide mb-1">
                    {format(new Date(session.scheduled_at), 'EEEE, dd/MM', { locale: vi })}
                  </div>
                  <div className="text-zinc-300 text-sm font-medium tracking-wider">{format(new Date(session.scheduled_at), 'HH:mm')}</div>
                  <div className="w-2 h-2 rounded-full bg-[#d4af37] ml-auto mt-2 animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.6)]"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[#1e1e1e] rounded-2xl border border-[#2a2b2e] shadow-sm mt-2">
             <CalendarDays className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
             <p className="text-zinc-400 text-sm">Chưa có lịch tập sắp tới</p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* 6. RECENT ACTIVITY */}
      {/* ═══════════════════════════════════════════════ */}
      {recentDoneSessions && recentDoneSessions.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Hoạt động gần đây</h3>
            <Link href="/client/history" className="text-[11px] text-[#d4af37] font-semibold hover:text-[#e5c56c] transition-colors">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-2">
            {recentDoneSessions.map((session: any) => (
              <div key={session.id} className="flex items-center gap-3 p-3 bg-[#1e1e1e] rounded-xl border border-[#2a2b2e] hover:border-[#2a2b2e]/80 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <Dumbbell size={16} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-200 truncate">Buổi tập với {session.pt?.name || 'PT'}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {format(new Date(session.checked_in_at), 'EEEE, dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 uppercase">
                    Đã tập
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* 7. BODY STATS SNAPSHOT (if has weight data) */}
      {/* ═══════════════════════════════════════════════ */}
      {latestWeight && (
        <Link href="/client/profile" className="block mt-2">
          <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2b2e] flex items-center gap-4 hover:border-[#d4af37]/30 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#8c7442]/20 flex items-center justify-center border border-[#d4af37]/20">
              <TrendingUp size={22} className="text-[#d4af37]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-zinc-100">Cân nặng hiện tại</p>
              <p className="text-xs text-zinc-500 mt-0.5">Nhấn để xem biểu đồ chi tiết</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#d4af37]">{latestWeight}<span className="text-xs text-zinc-500 ml-0.5 font-bold">kg</span></p>
            </div>
          </div>
        </Link>
      )}

    </div>
  );
}
