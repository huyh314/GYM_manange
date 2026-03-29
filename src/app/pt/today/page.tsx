'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function PTTodayPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pt/sessions')
      .then(res => res.json())
      .then(data => {
        // Guard against error objects being returned instead of arrays
        setSessions(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="p-4">Đang tải lịch tập...</div>;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">Lịch tập hôm nay</h2>
      
      {sessions.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="p-6 text-center text-gray-500">
            Bạn không có lịch tập nào trong khoảng thời gian này.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => {
            const dateObj = new Date(session.scheduled_at);
            const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const isCompleted = session.status === 'completed';
            
            return (
              <Link key={session.id} href={`/pt/session/${session.id}`} className="block">
                <Card className={`transition-all hover:shadow-md ${isCompleted ? 'bg-green-50 border-green-200 opacity-80' : 'bg-white'}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg text-primary">{timeStr}</div>
                      <div className="text-sm font-medium mt-1">{session.client?.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Gói: {session.package?.package_id?.substring(0,8)}... (Còn {session.package?.remaining_sessions} buổi)
                      </div>
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {isCompleted ? 'Hoàn thành' : 'Chưa tập'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
