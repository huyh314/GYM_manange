import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { supabase } from '@/lib/supabase';

const rpID = process.env.NODE_ENV === 'production' ? 'gym-qn.vercel.app' : 'localhost';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Vui lòng cung cấp số điện thoại' }, { status: 400 });
    }

    // Tìm user theo số điện thoại
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Lấy tất cả phương thức xác thực vân tay của user này
    const { data: userCredentials } = await supabase
      .from('webauthn_credentials')
      .select('id, transports')
      .eq('user_id', user.id);

    if (!userCredentials || userCredentials.length === 0) {
      return NextResponse.json({ error: 'Tài khoản này chưa cài đặt vân tay/khuôn mặt' }, { status: 400 });
    }

    const allowCredentials = (userCredentials || []).map((cred: any) => ({
      id: cred.id,
      type: 'public-key' as const,
      transports: cred.transports ? (cred.transports as unknown as any[]) : undefined,
    }));

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: 'preferred',
    });

    const response = NextResponse.json(options);

    // Lưu challenge và phone vào cookie để kiểm tra lại
    response.cookies.set('webauthn_login_challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5, // 5 phút
      path: '/',
    });
    
    response.cookies.set('webauthn_pending_phone', phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5, // 5 phút
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login options error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
