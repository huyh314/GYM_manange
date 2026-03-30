import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await context.params;

    // Check auth
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !['admin', 'pt'].includes(payload.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    // 1. Fetch user data (basic info + notes)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, phone, role, is_active, notes, created_at')
      .eq('id', clientId)
      .single();

    if (userError || !user) throw new Error('Client not found');

    // 2. Security Check for PT: PTs can only view clients assigned to them
    if (payload.role === 'pt') {
      const { data: assignmentCheck } = await supabase
        .from('user_packages')
        .select('id')
        .eq('client_id', clientId)
        .eq('pt_id', payload.id)
        .eq('status', 'active');
      
      if (!assignmentCheck || assignmentCheck.length === 0) {
         return NextResponse.json({ error: 'Forbidden. You do not manage this client.' }, { status: 403 });
      }
    }

    // 3. Fetch Packages
    const { data: packages, error: packagesError } = await supabase
      .from('user_packages')
      .select(`
        id, status, total_sessions, remaining_sessions, amount_paid, created_at,
        package:packages!user_packages_package_id_fkey(name),
        pt:users!user_packages_pt_id_fkey(name)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    // 4. Fetch Sessions (done only for history)
    const { data: sessions } = await supabase
      .from('sessions')
      .select(`
        id, scheduled_at, checked_in_at, pt_notes, logbook, status,
        pt:users!sessions_pt_id_fkey(name)
      `)
      .eq('client_id', clientId)
      .eq('status', 'done')
      .order('checked_in_at', { ascending: false });

    // 5. Fetch Weight logs
    const { data: weights } = await supabase
      .from('weight_logs')
      .select('id, weight_kg, log_date, notes')
      .eq('client_id', clientId)
      .order('log_date', { ascending: true });

    return NextResponse.json({
      user,
      packages: packages || [],
      sessions: sessions || [],
      weights: weights || [],
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
