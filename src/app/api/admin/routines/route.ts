import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

// Admin / PT can manage routines
export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: routines, error } = await supabase
      .from('routines')
      .select('*, exercises:routine_exercises(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(routines);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await req.json();
    const { name, description, created_by } = body;

    const { data, error } = await supabase
      .from('routines')
      .insert([{ name, description, created_by }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
