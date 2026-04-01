import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const rpID = process.env.NODE_ENV === 'production' ? 'gym-qn.vercel.app' : 'localhost';
const expectedOrigin = process.env.NODE_ENV === 'production' ? `https://${rpID}` : `http://${rpID}:3000`;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Phiên đăng nhập hết hạn' }, { status: 401 });

    const body = await req.json();
    
    // Đọc challenge từ cookie
    const expectedChallenge = req.cookies.get('webauthn_challenge')?.value;
    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Lỗi xác minh. Yêu cầu đã hết hạn.' }, { status: 400 });
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { 
        credential, 
        credentialDeviceType, 
        credentialBackedUp,
        userVerified
      } = verification.registrationInfo;

      // Import helper for base64url encodings
      const { isoBase64URL } = await import('@simplewebauthn/server/helpers');

      // Lưu public key vào DB
      const { error } = await supabase
        .from('webauthn_credentials')
        .insert({
          id: credential.id,
          user_id: payload.id,
          public_key: isoBase64URL.fromBuffer(credential.publicKey), 
          webauthn_user_id: payload.id, 
          counter: credential.counter,
          device_type: credentialDeviceType,
          backed_up: credentialBackedUp,
          transports: credential.transports || []
        });

      if (error) {
        throw new Error('Không thể lưu mã khóa: ' + error.message);
      }

      // Xóa challenge cookie
      const response = NextResponse.json({ success: true, verified: true });
      response.cookies.delete('webauthn_challenge');
      return response;
    }

    return NextResponse.json({ error: 'Đăng ký thất bại' }, { status: 400 });

  } catch (error: any) {
    console.error('Registration verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
