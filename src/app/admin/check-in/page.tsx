'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, AlertCircle, User, Calendar, Clock, RefreshCw, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCheckInPage() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
            "reader", 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );
        
        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;
    }

    return () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
            scannerRef.current = null;
        }
    };
  }, [isScanning]);

  async function onScanSuccess(decodedText: string) {
    if (!isScanning) return;
    
    setIsScanning(false);
    toast.info("Đang xử lý mã...");

    try {
        const res = await fetch('/api/admin/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId: decodedText })
        });

        const data = await res.json();
        if (res.ok) {
            setScanResult(data);
            toast.success("Điểm danh thành công!");
        } else {
            toast.error(data.error || "Lỗi điểm danh");
            setIsScanning(true); // Retry
        }
    } catch (err) {
        toast.error("Lỗi kết nối máy chủ");
        setIsScanning(true);
    }
  }

  function onScanFailure(error: any) {
    // Quietly fail or log
  }

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Quét mã diểm danh</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Sử dụng camera để quét QR Code của học viên</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Scanner Section */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gray-900 rounded-3xl">
           <CardHeader className="p-6 bg-gray-800 border-b border-gray-700">
             <CardTitle className="text-sm font-black text-white flex items-center gap-2">
               <Smartphone className="w-4 h-4 text-indigo-400" />
               CAMERA SCANNER
             </CardTitle>
           </CardHeader>
           <CardContent className="p-0">
             <div className="relative aspect-square">
                {isScanning ? (
                   <div id="reader" className="w-full h-full bg-black"></div>
                ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-900/20 backdrop-blur-sm space-y-4 p-8 text-center text-white">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 animate-in zoom-in duration-300">
                        <CheckCircle size={40} />
                      </div>
                      <p className="font-black text-xl">Đã nhận diện xong</p>
                      <Button onClick={resetScanner} size="lg" className="bg-white text-indigo-900 hover:bg-gray-100 rounded-2xl px-8 font-black">
                         TIẾP TỤC QUÉT
                      </Button>
                   </div>
                )}
                {isScanning && (
                   <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border-2 border-indigo-500/50 rounded-2xl animate-pulse"></div>
                   </div>
                )}
             </div>
           </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-4">
           {!scanResult ? (
              <Card className="border-dashed border-2 bg-gray-50/50 py-16 text-center rounded-3xl">
                <CardContent className="p-6">
                   <RefreshCw className="w-12 h-12 text-gray-200 mx-auto mb-4 animate-spin-slow" />
                   <p className="font-bold text-gray-400">Đang đợi quyét mã...</p>
                   <p className="text-xs text-gray-400 mt-2 px-6">Hãy hướng camera vào mã QR hiển thị trên điện thoại của học viên</p>
                </CardContent>
              </Card>
           ) : (
              <div className="space-y-4 animate-in slide-in-from-right duration-500">
                 {/* User Info */}
                 <Card className="border-0 shadow-lg bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="bg-indigo-600 text-white p-6">
                       <CardTitle className="flex items-center gap-3">
                          <CheckCircle size={24} />
                          <span className="font-black">ĐÃ ĐẾN PHÒNG TẬP</span>
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                             <User size={32} />
                          </div>
                          <div>
                             <p className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">{scanResult.user?.name}</p>
                             <p className="text-sm font-bold text-gray-500 mt-1">{scanResult.user?.phone}</p>
                          </div>
                       </div>

                       {scanResult.session ? (
                          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
                             <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                                <Calendar size={16} />
                                CÓ LỊCH TẬP HÔM NAY
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-600/70">GIỜ TẬP:</span>
                                <span className="font-black text-emerald-900 flex items-center gap-1">
                                   <Clock size={14} />
                                   {new Date(scanResult.session.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-600/70">HLV:</span>
                                <span className="font-black text-emerald-900">{scanResult.session.pt}</span>
                             </div>
                             <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-2 h-11" onClick={() => window.location.href = `/admin/sessions?id=${scanResult.session.id}`}>
                                XEM CHI TIẾT LỊCH
                             </Button>
                          </div>
                       ) : (
                          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                             <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                             <div>
                                <p className="text-sm font-bold text-amber-900">KHÔNG CÓ LỊCH TẬP PT</p>
                                <p className="text-xs text-amber-600 font-medium leading-relaxed mt-1">Học viên này hiện không có lịch tập với PT nào trong ngày hôm nay.</p>
                             </div>
                          </div>
                       )}

                       <Button variant="outline" className="w-full border-gray-200 text-gray-500 font-bold h-12 rounded-2xl" onClick={resetScanner}>
                          ĐÓNG & TIẾP TỤC QUÉT
                       </Button>
                    </CardContent>
                 </Card>
              </div>
           )}
        </div>
      </div>

      {/* Style for html5-qrcode overrides to fit our premium design */}
      <style jsx global>{`
        #reader { border: none !important; }
        #reader__dashboard { background: #1f2937 !important; border-top: 1px solid #374151 !important; color: white !important; }
        #reader__dashboard_section_csr button { background: #4f46e5 !important; border: none !important; border-radius: 12px !important; color: white !important; font-weight: bold !important; padding: 10px 20px !important; cursor: pointer !important; }
        #reader__status_span { color: #9ca3af !important; font-size: 12px !important; font-weight: 600 !important; }
        video { border-radius: 0 !important; object-fit: cover !important; }
      `}</style>
    </div>
  );
}
