import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'pt') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    // Lấy danh sách user_packages mà PT này quản lý
    const { data: packages, error } = await supabase
      .from('user_packages')
      .select(`
        id, status, total_sessions, remaining_sessions, start_date,
        client:users!user_packages_client_id_fkey(id, name, phone, avatar_url),
        package:packages!user_packages_package_id_fkey(name)
      `)
      .eq('pt_id', payload.id)
      .order('status', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Gom theo client_id, lấy session gần nhất cho mỗi client
    const clientMap = new Map<string, any>();

    for (const pkg of (packages || [])) {
      const client = pkg.client as any;
      if (!client?.id) continue;

      if (!clientMap.has(client.id)) {
        clientMap.set(client.id, {
          id: client.id,
          name: client.name,
          phone: client.phone,
          avatar_url: client.avatar_url,
          packages: [],
          totalRemaining: 0,
          totalSessions: 0,
        });
      }

      const entry = clientMap.get(client.id);
      entry.packages.push({
        id: pkg.id,
        status: pkg.status,
        total_sessions: pkg.total_sessions,
        remaining_sessions: pkg.remaining_sessions,
        package_name: (pkg.package as any)?.name || 'Gói tập',
      });
      entry.totalRemaining += pkg.remaining_sessions || 0;
      entry.totalSessions += pkg.total_sessions || 0;
    }

    // Lấy ngày tập gần nhất cho mỗi client
    const clientIds = Array.from(clientMap.keys());
    if (clientIds.length > 0) {
      for (const cid of clientIds) {
        const { data: lastSession } = await supabase
          .from('sessions')
          .select('checked_in_at')
          .eq('client_id', cid)
          .eq('pt_id', payload.id)
          .eq('status', 'done')
          .order('checked_in_at', { ascending: false })
          .limit(1);

        if (lastSession && lastSession[0]) {
          clientMap.get(cid).lastSessionAt = lastSession[0].checked_in_at;
        }
      }
    }

    const clients = Array.from(clientMap.values());

    // Sắp xếp: active trước, rồi theo tên
    clients.sort((a, b) => {
      const aActive = a.packages.some((p: any) => p.status === 'active');
      const bActive = b.packages.some((p: any) => p.status === 'active');
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
