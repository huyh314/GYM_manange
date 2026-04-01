'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Loader2 } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import { toast } from 'sonner';

export function WebAuthnRegister() {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);

      // 1. Get options from server
      const optRes = await fetch('/api/auth/webauthn/register-options');
      const optData = await optRes.json();

      if (!optRes.ok) {
        throw new Error(optData.error || 'Failed to get registration options');
      }

      // 2. Start WebAuthn registration
      const attResp = await startRegistration({ optionsJSON: optData });

      // 3. Send back to server
      const verifyRes = await fetch('/api/auth/webauthn/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.verified) {
        toast.success('Đã cấu hình đăng nhập vân tay/khuôn mặt thành công!');
      } else {
        throw new Error(verifyData.error || 'Xác thực thất bại');
      }
    } catch (err: any) {
      console.error('WebAuthn Error:', err);
      // NotSupportedError means the device doesn't support passkeys.
      if (err.name === 'NotSupportedError') {
         toast.error('Thiết bị hoặc trình duyệt không hỗ trợ WebAuthn/Passkeys.');
      } else if (err.name === 'InvalidStateError') {
         toast.error('Mã khóa này đã được đăng ký từ trước.');
      } else if (err.name === 'NotAllowedError') {
         toast.error('Đăng ký bị hủy hoặc không được phép.');
      } else {
         toast.error('Lỗi thiết lập vân tay: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-2xl border border-dashed border-[#2a2b2e] p-4 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <Fingerprint size={16} className="text-[#d4af37]" />
          Đăng nhập sinh trắc học
        </h3>
        <p className="text-xs text-zinc-500 mt-1">Sử dụng Vân tay hoặc FaceID để đăng nhập nhanh.</p>
      </div>
      <Button
        variant="outline"
        className="bg-transparent border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
        Thiết lập
      </Button>
    </div>
  );
}
