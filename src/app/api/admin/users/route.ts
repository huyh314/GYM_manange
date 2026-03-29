import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const role = req.nextUrl.searchParams.get('role');
    
    let query = supabase.from('users').select('id, name, phone, role').order('name');
    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;
    if (error) throw error;
    
    return NextResponse.json(users ?? []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await req.json();

    // Setup password hash for new user
    const passwordHash = await hashPassword(body.password || '123456');

    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: body.name,
        phone: body.phone,
        password_hash: passwordHash,
        role: body.role || 'client'
      }])
      .select('id, name, phone, role')
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
