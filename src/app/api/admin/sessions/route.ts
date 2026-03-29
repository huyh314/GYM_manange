import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    // Support basic date filtering if passed via query params (optional)
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*, pt:users!pt_id(name), client:users!client_id(name)')
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(sessions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();

    const { user_package_id, pt_id, client_id, scheduled_at, notes } = body;

    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        user_package_id,
        pt_id,
        client_id,
        scheduled_at,
        notes,
        status: 'scheduled'
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
