import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) throw new Error('Unauthorized');
    
    const user = await verifyToken(token);
    if (!user || user.role !== 'pt') throw new Error('Forbidden');

    const id = (await params).id;
    const body = await req.json();

    const supabase = await createSupabaseServerClient();
    
    // Auto-save logic: just updates the logbook field, doesn't complete the session
    const { data, error } = await supabase
      .from('sessions')
      .update({ logbook: body.logbook, notes: body.notes })
      .eq('id', id)
      .eq('pt_id', user.id) // Security check
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, session: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
