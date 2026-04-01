'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';
import NotificationBell from '@/components/NotificationBell';
import { motion } from 'framer-motion';
import { QNLogo } from '@/components/QNLogo';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Bảng số liệu', href: '/admin/dashboard' },
    { label: 'Người dùng', href: '/admin/users' },
    { label: 'Gói tập', href: '/admin/packages' },
    { label: 'Buổi tập', href: '/admin/sessions' },
    { label: 'Xếp lịch', href: '/admin/schedule' },
    { label: 'Tính lương', href: '/admin/payroll' },
    { label: 'Báo cáo', href: '/admin/reports' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-zinc-100 font-sans">
      {/* Desktop Header / Top Nav */}
      <header className="hidden md:flex items-center justify-between px-6 lg:px-10 h-20 bg-[#1a1c1e] border-b border-[#2a2b2e] sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-8 lg:gap-12 h-full">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <QNLogo className="w-10 h-10 group-hover:scale-105 transition-transform" color="gold" />
            <h1 className="font-sans font-medium text-xl uppercase tracking-widest text-zinc-100 hidden lg:block">
              QN<span className="text-[#d4af37]">FITNESS</span>
            </h1>
          </Link>
          
          <nav className="flex items-center h-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative h-full flex items-center px-4 lg:px-6 outline-none group"
                >
                  <span className={`text-[13px] tracking-wider uppercase transition-colors duration-200 ${isActive ? 'text-[#d4af37] font-bold' : 'text-zinc-400 font-medium group-hover:text-zinc-200'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="admin-top-active-nav"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#B45309]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="relative text-zinc-400 hover:text-[#d4af37] transition-colors cursor-pointer">
             <NotificationBell />
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-[#2a2b2e]">
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center border border-[#d4af37]/40 shadow-[0_0_10px_rgba(212,175,55,0.2)] overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Admin&background=1a1c1e&color=d4af37&bold=true" alt="Admin Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-[13px] font-bold text-zinc-100 leading-tight">Sarah Jenkins</span>
              <span className="text-[10px] uppercase tracking-wider text-[#d4af37]">Admin Quản Lý</span>
            </div>
            <div className="ml-2 hidden lg:flex items-center">
              <LogoutButton iconOnly className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 bg-[#1a1c1e] border-b border-[#2a2b2e] sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <QNLogo className="w-8 h-8" color="gold" />
          <span className="text-xl font-serif text-zinc-100 tracking-widest uppercase">
            QN<span className="text-[#d4af37]">FITNESS</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-[#d4af37]/40 overflow-hidden shrink-0">
             <img src="https://ui-avatars.com/api/?name=Admin&background=1a1c1e&color=d4af37&bold=true" alt="Admin Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-10 bg-[#121212] min-h-[calc(100vh-80px)] pb-24 md:pb-6">
         {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <AdminBottomNav />
    </div>
  );
}
