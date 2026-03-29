'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-red-500">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="text-red-600 w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Truy cập bị từ chối</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            Bạn không có quyền truy cập vào khu vực này. Vui lòng liên hệ Quản trị viên nếu đây là sự nhầm lẫn.
          </p>
          <div className="pt-2">
            <Button className="w-full" onClick={() => router.push('/')}>
              Quay lại Trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
