import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { startOfMonth, endOfMonth, parseISO, format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get('month'); // e.g. "2025-01"
    
    // Parse month — expecting "YYYY-MM" or full ISO
    let monthDate: Date;
    if (monthParam && monthParam.length === 7) {
      monthDate = parseISO(`${monthParam}-01`);
    } else if (monthParam) {
      monthDate = parseISO(monthParam);
    } else {
      // Default: previous month
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      monthDate = now;
    }

    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthKey = format(monthStart, 'yyyy-MM-dd'); // for payroll_records.month

    const supabase = createSupabaseAdminClient();

    // Get all PTs
    const { data: pts, error: ptError } = await supabase
      .from('users')
      .select('id, name, rate_per_session')
      .eq('role', 'pt');

    if (ptError) throw ptError;

    // Get completed sessions in the month
    const { data: sessions, error: sessError } = await supabase
      .from('sessions')
      .select('id, pt_id, client_id, checked_in_at, client:users!client_id(name)')
      .eq('status', 'done')
      .gte('checked_in_at', monthStart.toISOString())
      .lte('checked_in_at', monthEnd.toISOString())
      .order('checked_in_at', { ascending: true });

    if (sessError) throw sessError;

    // Get existing payroll records for this month
    const { data: existingRecords } = await supabase
      .from('payroll_records')
      .select('*')
      .eq('month', monthKey);

    // Build payroll data per PT
    const payrollData = pts?.map((pt: any) => {
      const ptSessions = sessions?.filter((s: any) => s.pt_id === pt.id) || [];
      const sessionsCount = ptSessions.length;
      const rate = pt.rate_per_session || 0;
      const totalAmount = sessionsCount * rate;

      const existingRecord = existingRecords?.find((r: any) => r.pt_id === pt.id);

      return {
        pt_id: pt.id,
        pt_name: pt.name,
        rate_per_session: rate,
        sessions_count: sessionsCount,
        total_amount: totalAmount,
        status: existingRecord?.status || 'pending',
        paid_at: existingRecord?.paid_at || null,
        record_id: existingRecord?.id || null,
        sessions: ptSessions.map((s: any) => ({
          id: s.id,
          client_name: (s.client as any)?.name || 'N/A',
          checked_in_at: s.checked_in_at,
        })),
      };
    }) || [];

    return NextResponse.json({
      month: format(monthStart, 'yyyy-MM'),
      monthKey,
      payroll: payrollData.sort((a: any, b: any) => b.sessions_count - a.sessions_count),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Mark as paid / Create payroll record
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await req.json();
    const { pt_id, month, sessions_count, rate_per_session, total_amount, note, action } = body;

    if (action === 'mark_paid' && body.record_id) {
      // Update existing record
      const { data, error } = await supabase
        .from('payroll_records')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', body.record_id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    // Create new payroll record
    if (!pt_id || !month) {
      return NextResponse.json({ error: 'pt_id and month required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('payroll_records')
      .upsert({
        pt_id,
        month,
        sessions_count,
        rate_per_session,
        total_amount,
        status: 'paid',
        paid_at: new Date().toISOString(),
        note: note || null,
      }, { onConflict: 'pt_id,month' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
