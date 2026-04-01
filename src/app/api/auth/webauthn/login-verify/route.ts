import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { supabase } from '@/lib/supabase';
import { signToken } from '@/lib/auth';

const rpID = process.env.NODE_ENV === 'production' ? 'gym-qn.vercel.app' : 'localhost';
const expectedOrigin = process.env.NODE_ENV === 'production' ? `https://${rpID}` : `http://${rpID}:3000`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Lấy challenge và số điện thoại đã lưu từ cookie
    const expectedChallenge = req.cookies.get('webauthn_login_challenge')?.value;
    const phone = req.cookies.get('webauthn_pending_phone')?.value;

    if (!expectedChallenge || !phone) {
      return NextResponse.json({ error: 'Yêu cầu đăng nhập đã hết hạn, vui lòng thử lại' }, { status: 400 });
    }

    // Lấy thông tin user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, phone, role, is_active')
      .eq('phone', phone)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Tài khoản của bạn đã bị khóa' }, { status: 403 });
    }

    // Tiết kiệm nhất là tìm credential bằng id gửi từ Client
    const { data: credential, error: credError } = await supabase
      .from('webauthn_credentials')
      .select('id, public_key, counter, transports')
      .eq('id', body.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (credError || !credential) {
      return NextResponse.json({ error: 'Thiết bị vân tay chưa được đăng ký cho tài khoản này' }, { status: 401 });
    }

    const { isoBase64URL } = await import('@simplewebauthn/server/helpers');
    const publicKeyBuffer = isoBase64URL.toBuffer(credential.public_key);

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      credential: {
        id: credential.id,
        publicKey: publicKeyBuffer,
        counter: Number(credential.counter) || 0,
        transports: credential.transports ? (credential.transports as unknown as any[]) : undefined,
      },
    });

    if (verification.verified && verification.authenticationInfo) {
      const { newCounter } = verification.authenticationInfo;

      // Cập nhật counter mới vào DB (quan trọng để chống replay attack)
      await supabase
        .from('webauthn_credentials')
        .update({ counter: newCounter, last_used_at: new Date().toISOString() })
        .eq('id', credential.id);

      // Cấp JWT Token giống như đăng nhập mật khẩu
      const token = await signToken({
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      });

      const response = NextResponse.json({
        success: true,
        role: user.role,
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      // Xóa cache session login
      response.cookies.delete('webauthn_login_challenge');
      response.cookies.delete('webauthn_pending_phone');

      return response;
    }

    return NextResponse.json({ error: 'Xác thực vân tay thất bại' }, { status: 401 });
  } catch (error: any) {
    console.error('Login verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
