'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem('pwa-dismissed')) return;

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Detect iOS Safari
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    
    if (isiOS) {
      setIsIOS(true);
      if (isSafari) {
        setShowBanner(true);
      }
      return;
    }

    // Android / Desktop Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSModal(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
        <div className="max-w-lg mx-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl p-4 shadow-2xl shadow-violet-500/25 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
            <Download className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm leading-tight">Cài GymApp về máy</p>
            <p className="text-xs text-white/70 mt-0.5">Truy cập nhanh hơn, không cần mở trình duyệt</p>
          </div>
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-white text-violet-700 hover:bg-white/90 font-bold rounded-xl shrink-0 shadow-lg"
          >
            Cài đặt
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">Cài app trên iPhone/iPad</h3>
              <button onClick={handleDismiss} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">1</div>
                <div>
                  <p className="font-bold text-gray-900">Nhấn nút Chia sẻ</p>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    Biểu tượng <Share className="w-4 h-4 inline" /> ở thanh công cụ Safari
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">2</div>
                <div>
                  <p className="font-bold text-gray-900">Chọn &quot;Thêm vào MH chính&quot;</p>
                  <p className="text-sm text-gray-500 mt-0.5">Cuộn xuống nếu không thấy ngay</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">3</div>
                <div>
                  <p className="font-bold text-gray-900">Nhấn &quot;Thêm&quot;</p>
                  <p className="text-sm text-gray-500 mt-0.5">App sẽ xuất hiện trên màn hình chính</p>
                </div>
              </div>
            </div>

            <Button onClick={handleDismiss} className="w-full mt-6 bg-gray-900 hover:bg-gray-800 font-bold h-12 rounded-xl">
              Đã hiểu
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
