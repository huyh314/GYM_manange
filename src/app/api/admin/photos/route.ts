import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('client_id', clientId)
      .order('taken_at', { ascending: true });

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
    const { client_id, uploaded_by, photo_url, photo_type, taken_at, note } = body;

    if (!client_id || !photo_url || !photo_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('progress_photos')
      .insert([{
        client_id,
        uploaded_by,
        photo_url,
        photo_type,
        taken_at: taken_at || new Date().toISOString().split('T')[0],
        note: note || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const storagePath = searchParams.get('storagePath');

    if (!id) {
      return NextResponse.json({ error: 'Photo id required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Delete from storage if path provided
    if (storagePath) {
      await supabase.storage.from('progress-photos').remove([storagePath]);
    }

    // Delete record
    const { error } = await supabase
      .from('progress_photos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
