import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string, itemId: string }> }) {
  try {
    const supabase = createSupabaseAdminClient();
    const { itemId } = await params;
    const body = await req.json();

    const { data, error } = await supabase
      .from('routine_exercises')
      .update(body)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, itemId: string }> }) {
  try {
    const supabase = createSupabaseAdminClient();
    const { itemId } = await params;

    const { error } = await supabase
      .from('routine_exercises')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
