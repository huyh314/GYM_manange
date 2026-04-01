import React from 'react';
import { Users, Calendar, Search, Bell, Menu, Star, Clock, CheckCircle, Video, FileText } from 'lucide-react';

export default function TrainerMockup() {
  return (
    <div className="flex h-screen bg-[#121212] font-sans text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1c23] border-r border-[#2a2d34] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-[#2a2d34] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#e6c15b] p-1 border-2 border-[#121212] mb-3">
            <div className="w-full h-full bg-[#2a2d34] rounded-full overflow-hidden flex items-center justify-center">
              <span className="font-serif font-bold text-xl text-[#d4af37]">PT</span>
            </div>
          </div>
          <h2 className="font-bold tracking-wide">Trần Quốc Bảo</h2>
          <p className="text-[10px] text-[#d4af37] tracking-[0.2em] mt-1">MASTER TRAINER</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {['Lịch Hôm Nay', 'Học Viên Của Tôi', 'Giáo Án & Lộ Trình', 'Thư Viện Bài Tập', 'Đánh Giá & Báo Cáo'].map((item, i) => (
            <a key={i} href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${i === 0 ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 shadow-sm' : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#2a2d34]'}`}>
              {i === 0 && <Calendar size={20} />}
              {i === 1 && <Users size={20} />}
              {i === 2 && <FileText size={20} />}
              {i === 3 && <Video size={20} />}
              {i === 4 && <Star size={20} />}
              <span className="font-medium text-sm">{item}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#121212] overflow-y-auto">
        {/* Header */}
        <header className="h-20 bg-[#121212]/80 backdrop-blur-md border-b border-[#2a2d34] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-zinc-400 hover:text-[#d4af37]">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-serif text-[#d4af37]">Lịch Trình Hôm Nay</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-[#d4af37] text-zinc-900 font-bold rounded-full hover:bg-[#e6c15b] transition-colors text-sm flex items-center gap-2">
              <CheckCircle size={16} /> Check-in Lớp
            </button>
            <button className="relative text-zinc-400 hover:text-[#d4af37] transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-5xl mx-auto w-full">
          {/* Daily Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1c23] to-[#121212] border border-[#2a2d34]">
              <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1">Tổng Số Lớp</p>
              <h3 className="text-3xl font-bold text-zinc-100">6 <span className="text-sm font-medium text-zinc-500">Ca Tập</span></h3>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1c23] to-[#121212] border border-[#2a2d34]">
              <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1">Đã Hoàn Thành</p>
              <h3 className="text-3xl font-bold text-[#d4af37]">2 <span className="text-sm font-medium text-zinc-500">Lớp</span></h3>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1c23] to-[#121212] border border-[#2a2d34]">
              <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1">Tổng Thời Gian</p>
              <h3 className="text-3xl font-bold text-zinc-100">5.5 <span className="text-sm font-medium text-zinc-500">Giờ</span></h3>
            </div>
          </div>

          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Chi Tiết Timeline</h2>

          {/* Timeline */}
          <div className="space-y-6">
            {[
              { time: '08:00 AM', status: 'done', title: 'PT 1-1: Sarah Anderson', type: 'Giảm Mỡ - Tăng Cơ', duration: '60 phút', location: 'Khu Functional' },
              { time: '10:00 AM', status: 'done', title: 'PT Group (3 người): Cardio', type: 'Sức Bền', duration: '90 phút', location: 'Studio 1' },
              { time: '14:00 PM', status: 'current', title: 'PT 1-1: Anna Nguyen', type: 'Yoga Trị Liệu', duration: '60 phút', location: 'Phòng VIP 2' },
              { time: '16:30 PM', status: 'upcoming', title: 'Đánh Giá Form: Hùng Lê', type: 'Định Tuyến Cơ Xương', duration: '45 phút', location: 'Khu Máy Tập' },
              { time: '18:00 PM', status: 'upcoming', title: 'VIP Traning: Mr. Quân', type: 'Sức Mạnh', duration: '90 phút', location: 'Khu Free Weight' },
            ].map((session, i) => (
              <div key={i} className="flex gap-4 items-start relative pb-6 border-b border-[#2a2d34]">
                <div className="w-16 text-right pt-1 shrink-0">
                  <span className={`text-sm font-bold ${session.status === 'current' ? 'text-[#d4af37]' : 'text-zinc-400'}`}>{session.time}</span>
                </div>
                
                <div className="relative z-10 flex flex-col items-center shrink-0 pt-1.5">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    session.status === 'done' ? 'bg-[#d4af37] border-[#d4af37]' : 
                    session.status === 'current' ? 'bg-[#121212] border-[#d4af37] animate-pulse' : 
                    'bg-[#121212] border-zinc-600'
                  }`} />
                  {i !== 4 && <div className="absolute top-4 bottom-[-1.5rem] w-px bg-gradient-to-b from-[#2a2d34] to-transparent"></div>}
                </div>

                <div className={`flex-1 p-5 rounded-2xl border ${
                    session.status === 'current' ? 'bg-[#d4af37]/5 border-[#d4af37]/30 shadow-[0_0_15px_rgba(212,175,55,0.05)]' : 
                    'bg-[#1a1c23] border-[#2a2d34]'
                  }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold text-lg mb-1 ${session.status === 'current' ? 'text-[#d4af37]' : 'text-zinc-200'}`}>{session.title}</h3>
                      <div className="flex gap-4 text-xs font-medium text-zinc-500">
                        <span className="flex items-center gap-1"><Clock size={14} /> {session.duration}</span>
                        <span className="flex items-center gap-1 text-zinc-400 border px-2 py-0.5 rounded bg-zinc-800/50 border-zinc-700">{session.type}</span>
                      </div>
                    </div>
                    {session.status === 'current' && (
                      <button className="px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold uppercase tracking-wider rounded-lg border border-[#d4af37]/30 hover:bg-[#d4af37]/30 transition-colors">
                        Bắt đầu
                      </button>
                    )}
                    {session.status === 'done' && (
                      <span className="text-green-500"><CheckCircle size={20} /></span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mt-3 pt-3 border-t border-[#2a2d34] border-dashed">
                    Khu vực: <span className="text-zinc-300 font-semibold">{session.location}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
