'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, BarChart3, Package, CalendarDays } from 'lucide-react';

export function AdminBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Hội viên', href: '/admin/users', icon: Users },
    { name: 'Gói tập', href: '/admin/packages', icon: Package },
    { name: 'Buổi tập', href: '/admin/sessions', icon: CalendarDays },
    { name: 'Lương', href: '/admin/payroll', icon: CreditCard },
    { name: 'Báo cáo', href: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-[#1a1c1e]/98 backdrop-blur-xl border-t border-[#2a2b2e] z-40 flex items-center justify-between px-1 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent" />
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors px-0.5 ${
              isActive ? 'text-[#d4af37]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#d4af37]/10' : ''}`}>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : ''} />
            </div>
            <span className={`text-[9px] font-medium tracking-wide truncate max-w-full ${isActive ? 'font-bold' : ''}`}>
              {tab.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
