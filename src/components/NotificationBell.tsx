'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: 'alert' | 'info';
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fallback MVP implementation: Simulating notifications via local state
  // In a real app, this would use Supabase Realtime or similar
  useEffect(() => {
    // Generate some demo notifications for Phase 2
    const mockData: Notification[] = [
      {
        id: '1',
        title: 'Học viên sắp hết buổi',
        message: 'Hoàng Văn A chỉ còn 1 buổi tập. Vui lòng tư vấn gia hạn.',
        created_at: new Date().toISOString(),
        read: false,
        type: 'alert'
      },
      {
         id: '2',
         title: 'Hợp đồng mới',
         message: 'Gói 36 buổi tập đã được bán ra bởi HLV Lê Tiến Đạt.',
         created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
         read: false,
         type: 'info'
      }
    ];
    setNotifications(mockData);
    setUnreadCount(mockData.filter(n => !n.read).length);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:bg-gray-100 hover:text-gray-900 w-10 h-10 rounded-full">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 mt-2 border-0 shadow-xl rounded-2xl" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50 rounded-t-2xl">
          <h4 className="font-bold text-gray-900">Thông báo {unreadCount > 0 && <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full ml-1">{unreadCount}</span>}</h4>
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1 text-xs text-primary hover:text-primary font-medium">
             <CheckSquare className="w-4 h-4 mr-1" /> Đánh dấu đã đọc
          </Button>
        </div>
        <div className="max-h-[350px] flex flex-col overflow-y-auto w-full p-2 gap-1 bg-white rounded-b-2xl">
          {notifications.length === 0 ? (
             <div className="p-6 text-center text-sm text-gray-500 italic flex flex-col items-center">
               <Bell className="w-8 h-8 opacity-10 mb-2" />
               Không có thông báo nào.
             </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-3 rounded-xl transition-colors hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50/30' : 'bg-transparent'}`}>
                <div className="flex justify-between items-start mb-1">
                   <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                     {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 border border-white"></span>}
                     {n.title}
                   </p>
                   <span className="text-[10px] text-gray-400 font-medium shrink-0">
                     {format(new Date(n.created_at), 'HH:mm - dd/MM', { locale: vi })}
                   </span>
                </div>
                <p className={`text-xs ${n.type === 'alert' ? 'text-amber-700 font-medium' : 'text-gray-500'}`}>
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
