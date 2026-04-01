'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, Phone, Lock, ShieldCheck, Fingerprint } from 'lucide-react';
import { QNLogo } from '@/components/QNLogo';
import { startAuthentication } from '@simplewebauthn/browser';
import { toast } from 'sonner';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Restore saved phone if "Remember Me" was used
    const savedPhone = localStorage.getItem('qn-saved-phone');
    if (savedPhone) {
      setPhone(savedPhone);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại');
      }

      // Save phone for next login if "Remember Me" checked
      if (rememberMe) {
        localStorage.setItem('qn-saved-phone', phone);
      } else {
        localStorage.removeItem('qn-saved-phone');
      }

      // Success - redirect based on role
      if (data.role === 'admin') router.push('/admin/dashboard');
      else if (data.role === 'pt') router.push('/pt/today');
      else if (data.role === 'client') router.push('/client/home');

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!phone) {
      setError('Vui lòng nhập số điện thoại trước khi đăng nhập bằng vân tay/khuôn mặt');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Get Authentication Options
      const optRes = await fetch('/api/auth/webauthn/login-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const optData = await optRes.json();

      if (!optRes.ok) {
        throw new Error(optData.error || 'Lỗi khi tạo yêu cầu đăng nhập');
      }

      // 2. Start WebAuthn Authentication
      const authResp = await startAuthentication({ optionsJSON: optData });

      // 3. Verify Authentication
      const verifyRes = await fetch('/api/auth/webauthn/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResp),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Xác minh thất bại');
      }

      if (verifyData.success) {
        toast.success('Đăng nhập vân tay thành công!');
        if (rememberMe) {
          localStorage.setItem('qn-saved-phone', phone);
        } else {
          localStorage.removeItem('qn-saved-phone');
        }

        if (verifyData.role === 'admin') router.push('/admin/dashboard');
        else if (verifyData.role === 'pt') router.push('/pt/today');
        else if (verifyData.role === 'client') router.push('/client/home');
        
        router.refresh();
      }
    } catch (err: any) {
      console.error('Biometric Login Error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Bạn đã hủy quá trình quét sinh trắc học.');
      } else {
        setError(err.message || 'Thiết bị không hỗ trợ hoặc xác thực lỗi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Hero Background Image ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/gym-bg.png"
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.3) saturate(0.7)' }}
        />
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* ── Ambient glow decorations ── */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Main Content ── */}
      <div
        className={`relative z-10 w-full max-w-md mx-auto px-5 transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* ── Brand Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-2xl mb-5 transition-transform duration-500 hover:scale-105">
            <QNLogo className="w-16 h-16 drop-shadow-lg" color="gold" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-1.5 drop-shadow-xl">
            QN <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">FITNESS</span>
          </h1>
          <p className="text-white/50 text-sm font-medium tracking-widest uppercase">
            Private Fitness Club
          </p>
        </div>

        {/* ── Glassmorphism Login Card ── */}
        <div className="rounded-[2rem] bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] p-7 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="login-phone" className="text-white/70 text-sm font-semibold ml-1 flex items-center gap-2">
                <Phone size={14} className="text-amber-400/70" />
                Số điện thoại
              </label>
              <div className="relative group">
                <Input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="0901 234 567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                  className="h-14 bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:bg-white/[0.1] focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20 rounded-2xl text-base transition-all duration-300 px-4"
                />
                <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 shadow-[0_0_20px_-4px_rgba(245,158,11,0.15)]" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-white/70 text-sm font-semibold ml-1 flex items-center gap-2">
                <Lock size={14} className="text-amber-400/70" />
                Mật khẩu
              </label>
              <div className="relative group">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-14 bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:bg-white/[0.1] focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20 rounded-2xl text-base transition-all duration-300 pl-4 pr-14"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-amber-400 p-2.5 rounded-xl hover:bg-white/[0.06] transition-all duration-200 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 shadow-[0_0_20px_-4px_rgba(245,158,11,0.15)]" />
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer select-none group" htmlFor="remember-me">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-[22px] bg-white/10 rounded-full peer-checked:bg-amber-500/60 transition-colors duration-300" />
                  <div className="absolute left-0.5 top-[2px] w-[18px] h-[18px] bg-white/60 rounded-full peer-checked:translate-x-[18px] peer-checked:bg-white transition-all duration-300 shadow-sm" />
                </div>
                <span className="text-white/50 text-sm font-medium group-hover:text-white/70 transition-colors">
                  Ghi nhớ đăng nhập
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 text-sm text-red-300 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-1 animate-pulse" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              id="login-submit"
              className="w-full h-14 mt-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-black font-bold rounded-2xl text-base shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang xác thực...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Đăng nhập
                </span>
              )}
            </Button>

            {/* Biometric Button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#121212] px-2 text-white/30 tracking-widest">Hoặc</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleBiometricLogin}
              disabled={loading}
              className="w-full h-14 bg-white/[0.03] border-white/[0.1] text-white hover:bg-white/[0.08] hover:text-amber-400 rounded-2xl text-base transition-all duration-300 backdrop-blur-md"
            >
              <Fingerprint size={20} className="mr-2 text-amber-500/80" />
              Đăng nhập sinh trắc học
            </Button>
          </form>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-white/25 text-xs">
            <ShieldCheck size={14} className="text-emerald-500/50" />
            <span>Kết nối được mã hóa & bảo mật</span>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-8 text-center space-y-1.5">
          <p className="text-white/20 text-xs tracking-[0.25em] uppercase font-medium">
            Private Fitness Management System
          </p>
          <p className="text-white/15 text-xs">
            © {new Date().getFullYear()} QN Fitness — All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
