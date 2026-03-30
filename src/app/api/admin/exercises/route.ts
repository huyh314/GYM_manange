import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const muscleGroup = searchParams.get('muscle_group');
    const activeOnly = searchParams.get('active_only') !== 'false';

    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from('exercises')
      .select('*')
      .order('muscle_group')
      .order('name');

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    if (muscleGroup) {
      query = query.eq('muscle_group', muscleGroup);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await req.json();
    const { name, name_en, muscle_group, equipment, description, video_url } = body;

    if (!name || !muscle_group) {
      return NextResponse.json({ error: 'Name and muscle_group required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('exercises')
      .insert([{ name, name_en, muscle_group, equipment, description, video_url }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Exercise id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await req.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Exercise id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('exercises')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
