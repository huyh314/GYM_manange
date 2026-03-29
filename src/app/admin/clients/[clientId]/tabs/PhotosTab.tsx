'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function PhotosTab() {
  const handleUpload = () => {
    alert('Tính năng tải ảnh lên đang phát triển (Phase 3).');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Camera size={20} className="text-blue-500" /> Ảnh Before / After
        </h3>
        <Button onClick={handleUpload} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full">
          <Upload size={16} className="mr-1" /> Tải ảnh lên
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Before Photo Placeholder */}
        <Card className="border-2 border-dashed border-gray-200 shadow-none rounded-2xl overflow-hidden bg-gray-50/50">
          <CardContent className="h-64 flex flex-col items-center justify-center text-gray-400 p-6">
            <Camera className="w-12 h-12 opacity-20 mb-3" />
            <p className="font-bold text-gray-500 mb-1">Ảnh Trước (Before)</p>
            <p className="text-xs text-center">Chưa có ảnh. Bấm "Tải ảnh lên" để thêm.</p>
          </CardContent>
        </Card>

        {/* After Photo Placeholder */}
        <Card className="border-2 border-dashed border-gray-200 shadow-none rounded-2xl overflow-hidden bg-gray-50/50">
          <CardContent className="h-64 flex flex-col items-center justify-center text-gray-400 p-6">
            <Camera className="w-12 h-12 opacity-20 mb-3" />
            <p className="font-bold text-gray-500 mb-1">Ảnh Sau (After)</p>
            <p className="text-xs text-center">Chưa có ảnh. Bấm "Tải ảnh lên" để thêm.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
