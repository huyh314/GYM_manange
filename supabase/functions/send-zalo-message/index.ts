import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function sendZaloMessage(zaloId: string, message: string, accessToken: string) {
  const res = await fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': accessToken,
    },
    body: JSON.stringify({
      recipient: { user_id: zaloId },
      message: { text: message },
    }),
  });
  return res.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });

  try {
    const { zaloId, type, data } = await req.json();

    // Lấy Access Token từ bảng app_config
    const { data: config, error: configError } = await supabaseAdmin
      .from('app_config')
      .select('value')
      .eq('key', 'ZALO_ACCESS_TOKEN')
      .single();

    if (configError) throw new Error('Zalo Access Token not found in app_config');
    const accessToken = config.value;

    const templates: Record<string, (d: any) => string> = {
      session_reminder: (d) =>
        `🏋️ Nhắc lịch tập!\n\nBạn có buổi tập lúc ${d.time} hôm nay với PT ${d.ptName}.\n\nHẹn gặp tại phòng gym nhé! 💪`,

      expiring_sessions: (d) =>
        `⚠️ Gói tập sắp hết!\n\nBạn còn ${d.remaining} buổi tập (Gói ${d.packageName}).\n\nLiên hệ phòng gym để gia hạn sớm nhé!`,

      checkin_confirmed: (d) =>
        `✅ Đã ghi nhận buổi tập!\n\nBuổi tập ${d.sessionNumber}/${d.totalSessions} với PT ${d.ptName} đã hoàn thành.\nCòn ${d.remaining} buổi.`,

      custom: (d) => d.text,
    };

    const message = templates[type]?.(data) ?? data.text;
    const result = await sendZaloMessage(zaloId, message, accessToken);

    // Log lịch sử
    await supabaseAdmin.from('notification_logs').insert({
      user_id: data.userId || null,
      channel: 'zalo',
      type: type || 'custom',
      body: message,
      status: result.error ? 'failed' : 'sent',
      error_msg: result.error ? JSON.stringify(result) : null
    });

    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
