'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User, LogOut, TrendingUp, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState, useEffect } from 'react';
import { QRCheckInModal } from '@/components/QRCheckInModal';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';


// Memoized NavItem to prevent unnecessary re-renders of the entire navbar
const NavItem = memo(({ item, isActive }: { item: any, isActive: boolean }) => {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="relative flex flex-col items-center justify-center flex-1 h-full z-10"
    >
      {isActive && (
        <motion.div
           layoutId="client-active-nav"
           className="absolute top-1.5 bottom-1.5 left-3 right-3 bg-[#2a2b2e]/80 rounded-2xl"
           initial={false}
           transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <motion.div 
         whileTap={{ scale: 0.92 }}
         className={`relative z-10 flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors duration-200 ${isActive ? 'text-[#d4af37] font-bold' : 'text-zinc-500 hover:text-zinc-300 font-medium'}`}
      >
         <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
         <span className="text-[10px] leading-none">{item.label}</span>
      </motion.div>
    </Link>
  );
});

NavItem.displayName = 'NavItem';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Trang chủ', href: '/client/home', icon: Home },
    { label: 'Tiến độ', href: '/client/progress', icon: TrendingUp },
    { label: 'Lịch sử', href: '/client/history', icon: ClipboardList },
    { label: 'Hồ sơ', href: '/client/profile', icon: User },
  ];

  const [user, setUser] = useState<{ id: string, name: string, phone: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const { data: profile } = await supabase.from('users').select('id, name, phone').eq('id', data.id).single();
        if (profile) setUser(profile);
      }
    }
    loadUser();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] pb-16">
      <header className="sticky top-0 z-50 bg-[#121212]/90 px-4 py-4 flex items-center justify-between backdrop-blur-md">
        <h1 className="font-sans font-medium text-lg text-zinc-100 uppercase tracking-widest">
          QN<span className="text-[#d4af37] ml-2">FITNESS</span>
        </h1>
        <div className="flex items-center space-x-2">
          {user && (
            <QRCheckInModal 
              user={user} 
              trigger={
                <Button size="icon" variant="ghost" className="text-[#d4af37] hover:bg-[#2a2b2e] hover:text-[#e5c56c] rounded-xl transition-all">
                  <QrCode size={22} strokeWidth={2.5} />
                </Button>
              }
            />
          )}
          <button 
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
                // Force full page reload to clear all states and ensure middleware gets fresh cookie state
                window.location.href = '/login';
              } catch (err) {
                console.error('Đăng xuất thất bại:', err);
                // Fallback to push if fetch fails for some weird reason
                router.push('/login');
              }
            }}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-[#1a1c1e] border-t border-[#2a2b2e] flex justify-around items-center h-16 px-2 shadow-2xl">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} isActive={pathname === item.href} />
        ))}
      </nav>
    </div>
  );
}
