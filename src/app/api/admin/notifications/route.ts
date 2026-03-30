import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // 1. Check Authentication (since middleware skips API)
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();
    
    // 2. Fetch logs
    const { data: logs, error } = await supabase
      .from('notification_logs')
      .select(`
        *,
        users (name)
      `)
      .order('sent_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    
    return NextResponse.json(logs ?? []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
