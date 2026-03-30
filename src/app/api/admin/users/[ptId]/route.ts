import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { startOfMonth, endOfMonth, endOfDay, addDays } from 'date-fns';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ptId: string }> }
) {
  try {
    const { ptId } = await context.params;
    const supabase = createSupabaseAdminClient();
    
    // Auth check normally handled by middleware for /admin, 
    // but we can add a simple token check here if needed.

    const now = new Date();
    const monthStart = startOfMonth(now).toISOString();
    const monthEnd = endOfMonth(now).toISOString();
    const next7Days = endOfDay(addDays(now, 7)).toISOString();
    
    // 1. Fetch PT Info
    const { data: pt, error: ptError } = await supabase
      .from('users')
      .select('id, name, phone, role, is_active, created_at')
      .eq('id', ptId)
      .single();

    if (ptError || !pt) throw new Error('PT not found');

    // 2. Fetch Sessions for this PT
    const { data: allSessions } = await supabase
      .from('sessions')
      .select(`
        id, status, scheduled_at, checked_in_at,
        client:users!sessions_client_id_fkey(id, name)
      `)
      .eq('pt_id', ptId);

    // 3. Fetch Packages assigned to this PT
    const { data: packages, error: packagesError } = await supabase
      .from('user_packages')
      .select(`
        id, status, total_sessions, remaining_sessions, amount_paid, created_at,
        client:users!user_packages_client_id_fkey(id, name),
        package:packages!user_packages_package_id_fkey(name)
      `)
      .eq('pt_id', ptId);

    const activePackages = packages?.filter(p => p.status === 'active') || [];
    
    // Calculated stats
    const sessionsThisMonth = allSessions?.filter(s => 
      s.status === 'done' && 
      s.checked_in_at >= monthStart && 
      s.checked_in_at <= monthEnd
    ).length || 0;

    const activeClientsCount = new Set(activePackages.map(p => (p as any).client?.id)).size;

    const revenueThisMonth = packages?.filter(p => 
      p.created_at >= monthStart && p.created_at <= monthEnd
    ).reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;

    // Upcoming schedule (7 days)
    const upcomingSchedule = allSessions?.filter(s => 
      s.status === 'scheduled' && 
      s.scheduled_at >= now.toISOString() && 
      s.scheduled_at <= next7Days
    ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()) || [];

    // Active Clients list with details
    // We group active user_packages and find the last session
    const activeClientsObj: Record<string, any> = {};
    activePackages.forEach((pkg: any) => {
      const clientId = pkg.client?.id;
      if (!clientId) return;

      if (!activeClientsObj[clientId]) {
        // Find last session for this client with this PT
        const clientSessions = allSessions?.filter(s => s.status === 'done' && (s as any).client?.id === clientId) || [];
        const lastSessionDate = clientSessions.length > 0 
          ? clientSessions.sort((a, b) => new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime())[0].checked_in_at 
          : null;

        activeClientsObj[clientId] = {
          clientId,
          clientName: pkg.client?.name,
          packageName: pkg.package?.name,
          total_sessions: pkg.total_sessions,
          remaining_sessions: pkg.remaining_sessions,
          last_session: lastSessionDate
        };
      }
    });
    
    const activeClientsList = Object.values(activeClientsObj);

    return NextResponse.json({
      pt,
      stats: {
        sessionsThisMonth,
        activeClientsCount,
        revenueThisMonth
      },
      activeClientsList,
      upcomingSchedule
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
