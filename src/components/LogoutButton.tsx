'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LogoutButton({ className, iconOnly = false }: { className?: string, iconOnly?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const defaultStyles = "flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors w-full";

  return (
    <button
      onClick={handleLogout}
      className={className || defaultStyles}
      title="Đăng xuất"
    >
      <LogOut size={18} />
      {!iconOnly && <span>Đăng xuất</span>}
    </button>
  );
}
