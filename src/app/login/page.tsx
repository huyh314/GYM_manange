'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { QNLogo } from '@/components/QNLogo';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden p-4 sm:p-8">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gradient-to-br from-slate-200/60 to-slate-300/40 rounded-full blur-3xl opacity-70"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-gradient-to-tr from-stone-200/50 to-neutral-200/50 rounded-full blur-3xl opacity-70"></div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-2xl rounded-[2rem] z-10 overflow-hidden ring-1 ring-slate-900/5 hover:shadow-3xl transition-all duration-300">
        <CardHeader className="space-y-3 text-center pt-10 pb-6 relative">
          <div className="flex justify-center mb-3">
             <div className="p-3 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-[1.5rem] shadow-xl ring-1 ring-white/20 transform transition duration-500 hover:scale-105">
               <QNLogo className="w-16 h-16 drop-shadow-md" color="gold" />
             </div>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            QN FITNESS
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium text-base">
            Đăng nhập hệ thống quản lý
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 md:px-8 pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="phone" className="text-slate-700 font-semibold text-sm ml-1">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="h-14 bg-white border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-800 rounded-2xl shadow-sm text-base transition-all px-4"
              />
            </div>
            
            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-slate-700 font-semibold text-sm ml-1">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 bg-white border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-800 rounded-2xl shadow-sm text-base transition-all pl-4 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-2.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50/90 backdrop-blur-sm border border-red-200/60 rounded-2xl font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-sm animate-pulse"></div>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 mt-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 transition-all duration-300 active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="mr-3 h-5 w-5 animate-spin text-slate-300" />
                  Đang xử lý...
                </div>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Footer Branding Elements */}
      <div className="mt-10 text-slate-400 text-sm font-medium z-10 text-center tracking-wide flex flex-col items-center gap-1 opacity-70">
        <span className="uppercase tracking-[0.2em] text-xs">Phần Mềm Gym Chuyên Nghiệp</span>
        <span className="text-slate-300 text-xs">© 2024 QN Fitness</span>
      </div>
    </div>
  );
}
