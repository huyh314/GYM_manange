import { ProgressRing } from './ProgressRing';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, BarChart3, User, CalendarDays, TrendingUp } from 'lucide-react';
import { format, isFuture, startOfWeek, startOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

export default async function ClientHomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;

  // 1. Fetch Active Packages
  const { data: activePackages } = await supabase
    .from('user_packages')
    .select('*, package:packages(name)')
    .eq('client_id', userId)
    .eq('status', 'active')
    .order('remaining_sessions', { ascending: true })
    .limit(1);

  const activePackage = activePackages?.[0];

  // 2. Fetch Next Session
  const { data: nextSessions } = await supabase
    .from('sessions')
    .select('*, pt:users!sessions_pt_id_fkey(name)')
    .eq('client_id', userId)
    .eq('status', 'scheduled')
    .gt('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1);

  const nextSession = nextSessions?.[0];

  // 3. Stats Row
  const { data: allSessions } = await supabase
    .from('sessions')
    .select('checked_in_at')
    .eq('client_id', userId)
    .eq('status', 'done');

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

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      {/* 1a. Hero Card */}
      <Card className="border-0 shadow-lg bg-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <CardContent className="pt-8 pb-6 flex flex-col items-center">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Tiến độ gói tập</h2>
          {activePackage ? (
            <>
              <ProgressRing 
                remaining={activePackage.remaining_sessions} 
                total={activePackage.total_sessions} 
              />
              <div className="mt-6 text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                  {activePackage.package?.name || 'Gói tập'}
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                  Còn {activePackage.remaining_sessions} buổi
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-gray-400 w-8 h-8" />
              </div>
              <p className="text-gray-500 font-medium">Bạn chưa đăng ký gói tập nào.</p>
              <p className="text-gray-400 text-sm mt-1">Liên hệ với PT để được tư vấn.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1b. Next Session Card */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Lịch tập sắp tới</h3>
        <Card className="border shadow-sm bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardContent className="p-5">
            {nextSession ? (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-900 font-bold text-lg mb-1">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span>{format(new Date(nextSession.scheduled_at), 'EEEE, dd/MM', { locale: vi })}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium text-gray-800">{format(new Date(nextSession.scheduled_at), 'HH:mm')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/60 px-2 py-1 flex-inline rounded-md border border-indigo-100">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>PT: <strong className="text-gray-800">{nextSession.pt?.name || 'Chưa rõ'}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex animate-pulse items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm">
                    Sắp tới
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-gray-500 py-2">
                <CalendarDays className="w-8 h-8 text-gray-300" />
                <div>
                  <p className="font-medium text-gray-700">Chưa có lịch tập</p>
                  <p className="text-sm">Liên hệ PT để đặt lịch.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 1c. Stats Row */}
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 mt-8">Tổng quan hoạt động</h3>
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white shadow-sm border-0 border-t-2 border-green-500">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-gray-800">{totalCompleted}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Tổng hoàn thành</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-0 border-t-2 border-blue-500">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-gray-800">{thisMonth}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Tháng này</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-0 border-t-2 border-amber-500">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-gray-800">{thisWeek}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Tuần này</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
