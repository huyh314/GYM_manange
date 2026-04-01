import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// Nơi bạn lưu tên miền/App ID của web
const rpName = 'QN Fitness';
const rpID = process.env.NODE_ENV === 'production' ? 'gym-qn.vercel.app' : 'localhost';
const origin = process.env.NODE_ENV === 'production' ? `https://${rpID}` : `http://${rpID}:3000`;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Phiên đăng nhập hết hạn' }, { status: 401 });
    }

    // Tùy chọn: kiểm tra user tồn tại hay không và lấy thông tin
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone')
      .eq('id', payload.id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Lấy các thiết bị đã đăng ký trước đó (nếu có)
    const { data: existingCreds } = await supabase
      .from('webauthn_credentials')
      .select('id, transports')
      .eq('user_id', user.id);

    const excludeCredentials = (existingCreds || []).map((cred: any) => ({
      id: cred.id,
      type: 'public-key' as const,
      transports: cred.transports ? (cred.transports as unknown as any[]) : undefined,
    }));

    // Convert string UUID to Uint8Array
    const uint8UserID = new TextEncoder().encode(user.id);

    // Generate options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: uint8UserID, 
      userName: user.phone, // Username nên là phone/email duy nhất
      userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    // Tạo response và lưu challenge vào cookie HTTPOnly tạm thời
    const response = NextResponse.json(options);
    
    response.cookies.set('webauthn_challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5, // 5 phút
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration options error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
