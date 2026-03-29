'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Trang chủ', href: '/client/home', icon: Home },
    { label: 'Lịch sử', href: '/client/history', icon: ClipboardList },
    { label: 'Hồ sơ', href: '/client/profile', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="font-bold text-lg text-primary uppercase tracking-tight">Gym App</h1>
        <button 
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
          }}
          className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 p-4">
        {children}
      </main>

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
