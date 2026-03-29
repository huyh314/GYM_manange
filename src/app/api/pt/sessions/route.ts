import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json([], { status: 200 }); // Return empty array for unauthenticated
    }
    
    const user = await verifyToken(token);
    if (!user || user.role !== 'pt') {
      return NextResponse.json([], { status: 200 }); // Return empty array for non-PT
    }

    const supabase = await createSupabaseServerClient();
    
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*, client:users!client_id(name, phone), package:user_packages(package_id, remaining_sessions)')
      .eq('pt_id', user.id)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(sessions ?? []);
  } catch (err: any) {
    // On any error, return empty array so the UI doesn't crash
    console.error('PT sessions API error:', err.message);
    return NextResponse.json([]);
  }
}
