import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const now = new Date();
    const todayStart = startOfDay(now).toISOString();
    const todayEnd = endOfDay(now).toISOString();
    const monthStart = startOfMonth(now).toISOString();
    const monthEnd = endOfMonth(now).toISOString();

    // 1. Sessions today (all statuses)
    const { data: todaySessions } = await supabase
      .from('sessions')
      .select('id, status, pt:users!sessions_pt_id_fkey(id, name)')
      .gte('scheduled_at', todayStart)
      .lte('scheduled_at', todayEnd);

    const sessionsTodayCount = todaySessions?.length ?? 0;

    // 2. Sessions completed this month (for revenue estimate)
    const { data: monthSessions } = await supabase
      .from('sessions')
      .select('id')
      .eq('status', 'done')
      .gte('checked_in_at', monthStart)
      .lte('checked_in_at', monthEnd);

    const monthlyCompletedCount = monthSessions?.length ?? 0;
    // Estimate 150k/session as default rate
    const revenueEstimate = monthlyCompletedCount * 150000;

    // 3. Clients with low sessions (remaining_sessions <= 3)
    const { data: lowSessionPackages } = await supabase
      .from('user_packages')
      .select('id, remaining_sessions, client:users!user_packages_client_id_fkey(name)')
      .eq('status', 'active')
      .lte('remaining_sessions', 3)
      .gt('remaining_sessions', 0);

    const lowSessionAlerts = lowSessionPackages?.length ?? 0;

    // 4. Active PT count
    const { data: ptUsers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'pt');
    
    const { data: allPtUsers } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'pt');

    // PTs with sessions today
    const activePtIds = new Set(
      (todaySessions || []).map((s: any) => s.pt?.id).filter(Boolean)
    );
    const activePtCount = activePtIds.size;
    const totalPtCount = allPtUsers?.length ?? 0;

    // 5. Today's schedule details
    const { data: scheduleDetails } = await supabase
      .from('sessions')
      .select(`
        id, scheduled_at, status,
        pt:users!sessions_pt_id_fkey(name),
        client:users!sessions_client_id_fkey(name)
      `)
      .gte('scheduled_at', todayStart)
      .lte('scheduled_at', todayEnd)
      .order('scheduled_at', { ascending: true });

    // 6. Revenue Chart Data (8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    
    const { data: userPackagesData } = await supabase
      .from('user_packages')
      .select('amount_paid, created_at')
      .gte('created_at', eightWeeksAgo.toISOString());
      
    const weeklyRevenueMap = new Map<string, { revenue: number; packages_sold: number }>();
    if (userPackagesData) {
      userPackagesData.forEach(pkg => {
        const d = new Date(pkg.created_at);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
        const weekStart = new Date(d.setDate(diff)).toISOString().split('T')[0];
        
        const existing = weeklyRevenueMap.get(weekStart) || { revenue: 0, packages_sold: 0 };
        weeklyRevenueMap.set(weekStart, {
          revenue: existing.revenue + (pkg.amount_paid || 0),
          packages_sold: existing.packages_sold + 1
        });
      });
    }
    const weeklyRevenue = Array.from(weeklyRevenueMap.entries()).map(([week_start, data]) => ({
      week_start,
      ...data
    })).sort((a, b) => a.week_start.localeCompare(b.week_start));

    // 7. PT Performance
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const { data: allPtSessions } = await supabase
      .from('sessions')
      .select('id, pt_id, status, checked_in_at, scheduled_at')
      .in('pt_id', allPtUsers?.map(u => u.id) || []);

    const { data: activeUserPackages } = await supabase
      .from('user_packages')
      .select('pt_id, client_id')
      .eq('status', 'active');

    const ptPerformance = allPtUsers?.map(pt => {
      const thisMonthSessionsCount = allPtSessions?.filter(s => 
        s.pt_id === pt.id && 
        s.status === 'done' && 
        s.checked_in_at >= monthStart && 
        s.checked_in_at <= monthEnd
      ).length || 0;

      const upcomingSessionsCount = allPtSessions?.filter(s => 
        s.pt_id === pt.id && 
        s.status === 'scheduled' && 
        new Date(s.scheduled_at) >= now && 
        new Date(s.scheduled_at) <= next7Days
      ).length || 0;

      const activeClientsSet = new Set(
        activeUserPackages?.filter(p => p.pt_id === pt.id).map(p => p.client_id) || []
      );

      return {
        id: pt.id,
        name: pt.name,
        sessions_this_month: thisMonthSessionsCount,
        active_clients: activeClientsSet.size,
        upcoming_sessions: upcomingSessionsCount
      };
    }).sort((a, b) => b.sessions_this_month - a.sessions_this_month) || [];

    return NextResponse.json({
      sessionsTodayCount,
      revenueEstimate,
      lowSessionAlerts,
      activePtCount,
      totalPtCount,
      monthlyCompletedCount,
      todaySchedule: scheduleDetails || [],
      lowSessionClients: lowSessionPackages || [],
      weeklyRevenue,
      ptPerformance,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
