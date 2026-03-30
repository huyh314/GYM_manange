import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createSupabaseAdminClient();
  const { clientId } = await req.json();

  if (!clientId) {
    return NextResponse.json({ error: 'Thiếu Client ID' }, { status: 400 });
  }

  // 1. Check user exists
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('id', clientId)
    .single();

  if (userErr || !user) {
    return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
  }

  // 2. Log access (Arrival)
  const { error: logErr } = await supabase
    .from('attendance_logs')
    .insert([{
        user_id: clientId,
        check_in_at: new Date().toISOString(),
        type: 'arrival'
    }]);

  if (logErr) {
    console.error(logErr);
    return NextResponse.json({ error: 'Lỗi ghi log điểm danh' }, { status: 500 });
  }

  // 3. Find if there's an active session today for this client
  const today = new Date().toISOString().split('T')[0];
  const { data: session } = await supabase
    .from('sessions')
    .select('*, pt:pt_id(name)')
    .eq('client_id', clientId)
    .gte('scheduled_at', today + 'T00:00:00')
    .lte('scheduled_at', today + 'T23:59:59')
    .not('status', 'eq', 'completed')
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single();

  return NextResponse.json({ 
    success: true, 
    user: { name: user.name, phone: user.phone },
    session: session ? { id: session.id, pt: session.pt?.name, time: session.scheduled_at } : null
  });
}
