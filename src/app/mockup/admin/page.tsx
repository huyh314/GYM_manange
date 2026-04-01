import React from 'react';
import { Users, CreditCard, Activity, Calendar, Search, Bell, Menu, BarChart2, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminMockup() {
  return (
    <div className="flex h-screen bg-[#121212] font-sans text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1c23] border-r border-[#2a2d34] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-[#2a2d34] flex items-center justify-center">
          <div className="text-[#d4af37] font-serif text-2xl font-bold tracking-widest text-center">
            QN <span className="font-sans text-xs tracking-[0.3em] block mt-1 opacity-80">FITNESS ADMIN</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {['Dashboard', 'Hội Viên', 'Gói Tập (Packages)', 'Lịch Giảng Dạy', 'Báo Cáo Doanh Thu'].map((item, i) => (
            <a key={i} href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${i === 0 ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 shadow-sm' : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#2a2d34]'}`}>
              {i === 0 && <BarChart2 size={20} />}
              {i === 1 && <Users size={20} />}
              {i === 2 && <CreditCard size={20} />}
              {i === 3 && <Calendar size={20} />}
              {i === 4 && <Activity size={20} />}
              <span className="font-medium text-sm">{item}</span>
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-[#2a2d34]">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f9d77e] border-2 border-[#1a1c23]" />
            <div>
              <p className="text-sm font-bold text-zinc-100">Super Admin</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Quản lý hệ thống</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#121212] overflow-y-auto">
        {/* Header */}
        <header className="h-20 bg-[#121212]/80 backdrop-blur-md border-b border-[#2a2d34] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-zinc-400 hover:text-[#d4af37]">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-semibold text-zinc-100">Dashboard Tổng Quan</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input type="text" placeholder="Tìm kiếm hội viên..." className="bg-[#1a1c23] border border-[#2a2d34] rounded-full pl-10 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-[#d4af37]/50 w-64 transition-colors" />
            </div>
            <button className="relative text-zinc-400 hover:text-[#d4af37] transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#121212]"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 ml:grid-cols-4 gap-6">
            {[
              { label: 'Tổng Doanh Thu', value: '124,500,000đ', icon: <Activity className="text-[#d4af37]" size={24} />, trend: '+15.2%', isUp: true },
              { label: 'Hội Viên Mới', value: '48', icon: <Users className="text-[#d4af37]" size={24} />, trend: '+4.5%', isUp: true },
              { label: 'Lượt Check-in Hôm Nay', value: '156', icon: <Calendar className="text-[#d4af37]" size={24} />, trend: '-2.1%', isUp: false },
              { label: 'Gói Tập Gia Hạn', value: '24', icon: <CreditCard className="text-[#d4af37]" size={24} />, trend: '+12.5%', isUp: true },
            ].map((stat, i) => (
              <div key={i} className="bg-[#1a1c23] border border-[#2a2d34] rounded-2xl p-6 relative overflow-hidden group hover:border-[#d4af37]/40 transition-colors">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#d4af37]/5 rounded-full blur-2xl group-hover:bg-[#d4af37]/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/20">
                    {stat.icon}
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.isUp ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.trend}
                  </span>
                </div>
                <h3 className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">{stat.label}</h3>
                <p className="text-3xl font-bold text-zinc-100 mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#1a1c23] border border-[#2a2d34] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-zinc-100">Hội Viên Mới Đăng Ký</h2>
                <button className="text-sm text-[#d4af37] hover:underline">Xem Tất Cả</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2d34] text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      <th className="pb-4 font-medium">Hội Viên</th>
                      <th className="pb-4 font-medium">Gói Đăng Ký</th>
                      <th className="pb-4 font-medium">Trạng Thái</th>
                      <th className="pb-4 font-medium">Ngày Tạo</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {[
                      { name: 'Nguyễn Văn A', package: 'Platinum 1 Năm', status: 'Active', date: 'Hôm nay' },
                      { name: 'Trần Thị B', package: 'Gold 6 Tháng', status: 'Pending', date: 'Hôm qua' },
                      { name: 'Lê Văn C', package: 'PT 1-kèm-1 (10 Buổi)', status: 'Active', date: 'Hôm qua' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[#2a2d34]/50 hover:bg-[#2a2d34]/20 transition-colors">
                        <td className="py-4 font-medium text-zinc-200">{row.name}</td>
                        <td className="py-4 text-zinc-400">{row.package}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'Active' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-zinc-800 text-zinc-400'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-4 text-zinc-500">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-[#1a1c23] border border-[#2a2d34] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-zinc-100">Các Lớp Sắp Diễn Ra</h2>
                <button className="p-1.5 bg-[#d4af37]/10 text-[#d4af37] rounded-lg">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Tập Luyện Cardio (K2)', time: '14:00 - 15:30', pt: 'PT. Hoàng Long' },
                  { title: 'Trị Liệu Cổ Vai Gáy', time: '16:00 - 17:00', pt: 'PT. Nguyễn Hùng' },
                  { title: 'Yoga Trị Liệu Cơ Bản', time: '18:00 - 19:30', pt: 'Master Phương' },
                ].map((cls, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#121212] border border-[#2a2d34] hover:border-[#d4af37]/30 transition-colors cursor-pointer group">
                    <div className="w-2 rounded-full bg-gradient-to-b from-[#d4af37] to-[#8c7442]"></div>
                    <div>
                      <h4 className="font-bold text-zinc-200 group-hover:text-[#d4af37] transition-colors">{cls.title}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{cls.time} • {cls.pt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
