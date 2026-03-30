import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import webpush from 'https://esm.sh/web-push@3.6.6';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

webpush.setVapidDetails(
  'mailto:admin@gymapp.com',
  vapidPublicKey,
  vapidPrivateKey,
);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });

  try {
    const { userId, title, body, url } = await req.json();

    // Lấy thông tin đăng ký nhận thông báo của người dùng
    const { data: subs, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (subError) throw subError;

    const results = await Promise.allSettled(
      (subs ?? []).map(async (sub) => {
        try {
          const pushConfig = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          };
          
          await webpush.sendNotification(
            pushConfig,
            JSON.stringify({ title, body, url, icon: '/icons/icon-192.png' })
          );

          // Log thành công
          await supabaseAdmin.from('notification_logs').insert({
            user_id: userId,
            channel: 'push',
            type: 'manual',
            title,
            body,
            status: 'sent'
          });

        } catch (err: any) {
          // Xóa sub nếu hết hạn (status 410)
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
          }
          throw err;
        }
      })
    );

    return new Response(
      JSON.stringify({ 
        sent: results.filter(r => r.status === 'fulfilled').length,
        errors: results.filter(r => r.status === 'rejected').length
      }), 
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
