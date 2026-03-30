import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Key to protect the endpoint from unauthorized calls
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  // 1. Verify Authentication
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // 2. Fetch sessions occurring in the next 2 hours (120 mins) 
    // that haven't had a reminder sent yet.
    // We join with users to get names for the message content.
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id,
        scheduled_at,
        pt_id,
        client_id,
        pt:users!pt_id(name),
        client:users!client_id(name)
      `)
      .eq('status', 'scheduled')
      .eq('reminder_sent', false)
      .lte('scheduled_at', new Date(Date.now() + 120 * 60 * 1000).toISOString())
      .gt('scheduled_at', new Date().toISOString());

    if (sessionError) throw sessionError;

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ message: 'No upcoming sessions needing reminders.' });
    }

    const results = [];

    for (const session of sessions) {
      // 3. For each session, find user preferences
      const userIds = [session.pt_id, session.client_id];
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .in('user_id', userIds);

      // 4. Trigger reminders based on preferences
      const ptPref = prefs?.find(p => p.user_id === session.pt_id);
      const clientPref = prefs?.find(p => p.user_id === session.client_id);

      // --- PT Reminders ---
      if (ptPref?.push_session_reminder) {
        const clientName = Array.isArray(session.client) ? session.client[0]?.name : (session.client as any)?.name;
        await triggerEdgeFunction('send-push-notification', {
          userId: session.pt_id,
          title: 'Nhắc lịch dạy',
          body: `Bạn có buổi tập với ${clientName} vào lúc ${new Date(session.scheduled_at).toLocaleTimeString('vi-VN')}`,
          url: `/pt/session/${session.id}`
        });
      }

      // --- Client Reminders ---
      if (clientPref?.push_session_reminder) {
        const ptName = Array.isArray(session.pt) ? session.pt[0]?.name : (session.pt as any)?.name;
        await triggerEdgeFunction('send-push-notification', {
          userId: session.client_id,
          title: 'Nhắc lịch tập',
          body: `Bạn có hẹn tập với PT ${ptName} vào lúc ${new Date(session.scheduled_at).toLocaleTimeString('vi-VN')}`,
          url: `/client/dashboard`
        });
      }

      // Zalo (PT/Client)
      if (ptPref?.zalo_session_reminder) {
        const clientName = Array.isArray(session.client) ? session.client[0]?.name : (session.client as any)?.name;
        await triggerEdgeFunction('send-zalo-message', {
          userId: session.pt_id,
          message: `[GYM] Nhắc lịch: Bạn có buổi dạy với ${clientName} lúc ${new Date(session.scheduled_at).toLocaleTimeString('vi-VN')}.`
        });
      }
      
      if (clientPref?.zalo_session_reminder) {
        const ptName = Array.isArray(session.pt) ? session.pt[0]?.name : (session.pt as any)?.name;
        await triggerEdgeFunction('send-zalo-message', {
          userId: session.client_id,
          message: `[GYM] Nhắc lịch: Bạn có buổi tập với PT ${ptName} lúc ${new Date(session.scheduled_at).toLocaleTimeString('vi-VN')}. Chúc bạn tập luyện hăng say!`
        });
      }

      // 5. Mark as sent
      await supabase
        .from('sessions')
        .update({ reminder_sent: true })
        .eq('id', session.id);

      results.push({ sessionId: session.id, status: 'reminded' });
    }

    return NextResponse.json({ processed: results.length, details: results });

  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function triggerEdgeFunction(name: string, payload: any) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceRoleKey}`
      },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch (e) {
    console.error(`Edge Function ${name} failed:`, e);
    return false;
  }
}
