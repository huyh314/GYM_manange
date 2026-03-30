'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Users, ShieldCheck, Zap, Calendar, TrendingUp, Sparkles, ChevronRight, QrCode } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-bg.png" 
            alt="Gym Hero" 
            className="w-full h-full object-cover grayscale-[20%] brightness-[40%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-white"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            <Sparkles size={14} />
            Hệ thống quản lý Gym thế hệ mới
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
            Nâng tầm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Hiệu suất</span> <br />
            Phòng tập của bạn
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 font-medium leading-relaxed">
            Giải pháp quản lý thông minh dành cho Admin, huấn luyện viên cá nhân và học viên. Tự động hóa điểm danh, giáo án và doanh thu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 group">
                BẮT ĐẦU NGAY
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-14 px-10 rounded-2xl border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 font-bold text-lg cursor-default">
              XEM DEMO
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-10 left-10 animate-bounce transition-all duration-1000">
           <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white/20 rotate-12">
              <Dumbbell size={24} />
           </div>
        </div>
        <div className="absolute top-20 right-20 animate-pulse transition-all duration-1000">
           <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm flex items-center justify-center text-indigo-500/40 -rotate-12">
              <TrendingUp size={32} />
           </div>
        </div>
      </section>

      {/* Role Selection / Features */}
      <section className="py-24 px-6 bg-white relative z-20 -mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Admin Card */}
            <Link href="/login" className="group">
              <Card className="h-full border-0 shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden transition-all hover:-translate-y-2">
                <CardContent className="p-10 space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
                    <ShieldCheck size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900">Quản trị viên</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      Quản lý học viên, gói tập, xếp lịch huấn luyện và theo dõi doanh thu/payroll tự động.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center text-indigo-600 font-black text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                    Vào hệ thống <ChevronRight size={16} />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* PT Card */}
            <Link href="/login" className="group">
              <Card className="h-full border-0 shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden transition-all hover:-translate-y-2">
                <CardContent className="p-10 space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200 group-hover:rotate-6 transition-transform">
                    <Dumbbell size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900">Huấn luyện viên</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      Xây dựng giáo án mẫu, ghi nhật ký tập luyện và theo dõi kết quả học viên mỗi ngày.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center text-purple-600 font-black text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                    Bắt đầu ca dạy <ChevronRight size={16} />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Client Card */}
            <Link href="/login" className="group">
              <Card className="h-full border-0 shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden transition-all hover:-translate-y-2">
                <CardContent className="p-10 space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-200 group-hover:rotate-6 transition-transform">
                    <Users size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900">Học viên</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      Xem lịch tập, theo dõi cân nặng, chỉ số cơ thể và mã QR điểm danh thông minh.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center text-pink-600 font-black text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                    Xem hồ sơ tập <ChevronRight size={16} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em]">Công cụ đột phá</h2>
            <p className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Tính năng chuyên sâu</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-indigo-600">
                <Zap size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-900">Điểm danh 1 Chạm</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Học viên quét mã QR tại quầy để check-in tức thì và thông báo cho HLV.</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-blue-600">
                <Calendar size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-900">Quản lý Giáo án</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Thiết kế mẫu giáo án tập luyện chuyên nghiệp, áp dụng nhanh cho mọi buổi tập.</p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-emerald-600">
                <QrCode size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-900">Tính lương tự động</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Tự động tính toán payroll cho PT dựa trên số buổi thực dạy và đơn giá.</p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-orange-600">
                <TrendingUp size={24} />
              </div>
              <h4 className="text-lg font-black text-gray-900">Báo cáo Trực quan</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Hệ thống dashboard và biểu đồ theo dõi tăng trưởng phòng tập thời gian thực.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t text-center">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          &copy; 2026 GYM MANAGEMENT PRO • REDEFINING EXCELLENCE
        </p>
      </footer>
    </div>
  );
}
