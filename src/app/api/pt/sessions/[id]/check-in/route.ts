import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) throw new Error('Unauthorized');
    
    const user = await verifyToken(token);
    if (!user || user.role !== 'pt') throw new Error('Forbidden');

    const id = (await params).id;
    const body = await req.json();

    const supabase = await createSupabaseServerClient();
    
    // Call the custom RPC function configured in Supabase to atomically check-in and decrement user_package session count
    const { data, error } = await supabase.rpc('checkin_session', {
      p_session_id: id,
      p_pt_id: user.id,
      p_logbook: body.logbook || {},
      p_notes: body.notes || ''
    });

    if (error) throw error;
    
    return NextResponse.json({ success: true, message: 'Check-in thành công!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
