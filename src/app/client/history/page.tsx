'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SessionDetail } from './SessionDetail';

export default function ClientHistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  
  useEffect(() => {
    async function fetchHistory() {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id, scheduled_at, checked_in_at, status, logbook, notes,
          pt:pt_id(name)
        `)
        .eq('client_id', userId)
        .eq('status', 'done')
        .order('checked_in_at', { ascending: false })
        .limit(20); // Basic pagination

      if (data) setSessions(data);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  return (
    <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-500 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Lịch sử</h1>
        <span className="text-sm font-semibold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">{sessions.length} buổi</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse bg-white/50 border-0 h-24 rounded-2xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-2">Chưa có lịch sử tập luyện</p>
          <p className="text-sm text-gray-500 max-w-[250px] mx-auto leading-relaxed">Khi bạn hoàn thành buổi tập đầu tiên cùng HLV, nó sẽ hiện ở đây.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card 
              key={session.id} 
              className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-2xl overflow-hidden group"
              onClick={() => setSelectedSession(session)}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  <div className="w-1.5 bg-green-500 shrink-0 group-hover:bg-green-400 transition-colors" />
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                       <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                          <CheckCircle2 size={12} className="mr-1" /> Đã tập
                       </span>
                       <div className="text-right">
                         <span className="flex items-center text-xs text-gray-500 font-medium">
                           <Clock size={12} className="mr-1" /> {format(new Date(session.checked_in_at), 'HH:mm')}
                         </span>
                       </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-1 leading-snug">
                      {format(new Date(session.checked_in_at), 'EEEE, dd/MM/yyyy', { locale: vi })}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-3">
                       <p className="text-sm text-gray-600 font-medium flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                         PT: <span className="ml-1 text-gray-900">{session.pt?.name || '---'}</span>
                       </p>
                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">
                         <ChevronRight size={18} />
                       </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSession && (
        <SessionDetail
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
