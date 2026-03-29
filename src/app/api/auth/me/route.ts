import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 401 });
  }

  return NextResponse.json({
    id: payload.id,
    name: payload.name,
    phone: payload.phone,
    role: payload.role,
  });
}
