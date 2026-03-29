import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    
    // Defaults to current month if not provided
    const date = monthParam ? parseISO(monthParam) : new Date();
    const monthStart = startOfMonth(date).toISOString();
    const monthEnd = endOfMonth(date).toISOString();

    const supabase = createSupabaseAdminClient();

    // Fetch user packages in the month
    const { data: packages, error: packagesError } = await supabase
      .from('user_packages')
      .select(`
        id, amount_paid, created_at,
        client:users!user_packages_client_id_fkey(id, name),
        pt:users!user_packages_pt_id_fkey(id, name),
        package:packages!user_packages_package_id_fkey(name)
      `)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd)
      .order('created_at', { ascending: false });

    if (packagesError) throw new Error(packagesError.message);

    // Fetch completed sessions in the month
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, pt_id, client_id')
      .eq('status', 'done')
      .gte('checked_in_at', monthStart)
      .lte('checked_in_at', monthEnd);

    if (sessionsError) throw new Error(sessionsError.message);

    // Fetch all active PTs
    const { data: pts } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'pt')
      .eq('is_active', true);

    // 1. Summary Cards
    const totalRevenue = packages?.reduce((sum, pkg) => sum + (pkg.amount_paid || 0), 0) || 0;
    const packagesSold = packages?.length || 0;
    const totalSessions = sessions?.length || 0;
    const newClientsSet = new Set(packages?.map((p: any) => p.client?.id));
    const newClientsCount = newClientsSet.size;

    // 2. PT Report
    const ptReport = pts?.map((pt: any) => {
      const ptSessions = sessions?.filter(s => s.pt_id === pt.id) || [];
      const ptPackages = packages?.filter((p: any) => p.pt?.id === pt.id) || [];
      
      const uniqueClientsSet = new Set(ptSessions.map(s => s.client_id));
      const revenueGenerated = ptPackages.reduce((sum, p) => sum + (p.amount_paid || 0), 0);

      return {
        pt_name: pt.name,
        sessions_done: ptSessions.length,
        unique_clients: uniqueClientsSet.size,
        revenue_generated: revenueGenerated,
      };
    }).sort((a: any, b: any) => b.sessions_done - a.sessions_done) || [];

    return NextResponse.json({
      summary: {
        totalRevenue,
        packagesSold,
        totalSessions,
        newClientsCount,
      },
      ptReport,
      packagesList: packages || [],
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
