import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Fetch all active user_packages with related user names
    const { data, error } = await supabase
      .from('user_packages')
      .select('*, client:users!client_id(name, phone), pt:users!pt_id(name), package:packages(name)')
      .eq('status', 'active')
      .gt('remaining_sessions', 0);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();

    const { client_id, package_id, pt_id, amount_paid, total_sessions } = body;

    // Check if package exists to double check total_sessions
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('total_sessions')
      .eq('id', package_id)
      .single();

    if (pkgError || !pkg) throw new Error('Package không tồn tại!');

    const sessionsCount = parseInt(total_sessions) || pkg.total_sessions;

    const { data, error } = await supabase
      .from('user_packages')
      .insert([{
        client_id,
        package_id,
        pt_id,
        total_sessions: sessionsCount,
        remaining_sessions: sessionsCount,
        amount_paid: parseInt(amount_paid) || 0,
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
