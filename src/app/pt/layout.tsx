'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Wallet, LogOut, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSyncOnReconnect } from '@/hooks/useSyncOnReconnect';

export default function PTLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Kích hoạt đồng bộ ngầm khi online trở lại
  useSyncOnReconnect();

  const navItems = [
    { label: 'Hôm nay', href: '/pt/today', icon: Calendar },
    { label: 'Học viên', href: '/pt/clients', icon: Users },
    { label: 'Ca dạy', href: '/pt/stats', icon: Wallet },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="font-black tracking-tight text-lg text-indigo-900">PT Dashboard</h1>
        <div className="flex items-center gap-2">
            <button 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login');
              }}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full bg-gray-50 border border-gray-100 shadow-sm"
            >
              <LogOut size={16} />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t flex justify-around items-center h-16 px-2 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
