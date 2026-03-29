'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, CalendarPlus, Menu, X, UserCog, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { LogoutButton } from '@/components/LogoutButton';
import NotificationBell from '@/components/NotificationBell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Bảng số liệu', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Báo cáo', href: '/admin/reports', icon: BarChart3 },
    { label: 'Quản lý Người dùng', href: '/admin/users', icon: UserCog },
    { label: 'Danh Sách Gói', href: '/admin/packages', icon: Package },
    { label: 'Học Viên & Đăng ký', href: '/admin/assign-package', icon: Users },
    { label: 'Xếp lịch', href: '/admin/schedule', icon: CalendarPlus },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-6 border-b">
        <span className="text-xl font-bold text-primary tracking-tight">GYM ADMIN</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t mt-auto">
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="h-full sticky top-0">
            <NavContent />
        </div>
      </aside>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
        <div className={`relative w-72 h-full transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <NavContent />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white border-b sticky top-0 z-30 shadow-sm">
          <span className="text-lg font-bold text-primary">GYM ADMIN</span>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -mr-2 text-gray-700">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 h-16 bg-white border-b sticky top-0 z-30 shadow-sm">
          <h2 className="font-semibold text-lg text-gray-800">Cổng Quản Trị</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <NotificationBell />
            <div className="flex items-center gap-2 border-l pl-4">
              <span className="font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
           {children}
        </main>
      </div>
    </div>
  );
}
