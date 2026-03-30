import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { addDays } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await req.json();
    const { action, ids, shiftDays } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No sessions selected' }, { status: 400 });
    }

    if (action === 'cancel') {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'cancelled' })
        .in('id', ids)
        .eq('status', 'scheduled'); // Only cancel scheduled sessions

      if (error) throw error;
      return NextResponse.json({ success: true, cancelled: ids.length });
    }

    if (action === 'reschedule') {
      if (!shiftDays || typeof shiftDays !== 'number') {
        return NextResponse.json({ error: 'shiftDays required' }, { status: 400 });
      }

      // Fetch current sessions
      const { data: currentSessions, error: fetchErr } = await supabase
        .from('sessions')
        .select('id, scheduled_at')
        .in('id', ids)
        .eq('status', 'scheduled');

      if (fetchErr) throw fetchErr;

      // Update each session with shifted date
      const updates = (currentSessions || []).map(async (s) => {
        const newDate = addDays(new Date(s.scheduled_at), shiftDays);
        return supabase
          .from('sessions')
          .update({ scheduled_at: newDate.toISOString() })
          .eq('id', s.id);
      });

      await Promise.all(updates);
      return NextResponse.json({ success: true, rescheduled: ids.length });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
