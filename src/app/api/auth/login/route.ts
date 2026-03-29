import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Số điện thoại và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    // Query user directly from users table
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone, password_hash, role, is_active')
      .eq('phone', phone)
      .single();

    if (error) {
       console.error('Supabase query error:', error);
       return NextResponse.json(
         { error: `Lỗi kết nối cơ sở dữ liệu: ${error.message}` },
         { status: 500 }
       );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Số điện thoại hoặc mật khẩu không đúng (Không tìm thấy người dùng)' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Tài khoản của bạn đã bị khóa' },
        { status: 403 }
      );
    }

    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Tài khoản chưa được thiết lập mật khẩu' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Số điện thoại hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Sign JWT
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

    // Set HTTP-Only Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi máy chủ' },
      { status: 500 }
    );
  }
}
