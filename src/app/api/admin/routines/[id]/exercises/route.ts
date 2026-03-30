import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

// POST /api/admin/routines/[id]/exercises -> Add exercise to routine
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseAdminClient();
    const { id } = await params;
    const body = await req.json();

    const { data, error } = await supabase
      .from('routine_exercises')
      .insert([{
        routine_id: id,
        exercise_id: body.exercise_id,
        sets: body.sets || 3,
        reps: body.reps || '12',
        rest_seconds: body.rest_seconds || 60,
        order_index: body.order_index || 0,
        note: body.note || ''
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
