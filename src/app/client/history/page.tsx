'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SessionDetail } from './SessionDetail';

const fetchHistory = async () => {
  const meRes = await fetch('/api/auth/me');
  if (!meRes.ok) throw new Error('Not logged in');
  const me = await meRes.json();
  const userId = me.id;

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id, scheduled_at, checked_in_at, status, logbook, notes,
      pt:pt_id(name)
    `)
    .eq('client_id', userId)
    .eq('status', 'done')
    .order('checked_in_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
};

export default function ClientHistoryPage() {
  const { data: sessions = [], isLoading: loading } = useSWR('client-history', fetchHistory, {
    revalidateOnFocus: true
  });
  const [selectedSession, setSelectedSession] = useState<any>(null);
  

  return (
    <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-500 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-zinc-100 tracking-tight">Lịch sử</h1>
        <span className="text-sm font-semibold text-zinc-400 bg-[#1e1e1e] px-3 py-1 rounded-full border border-[#2a2b2e]">{sessions.length} buổi</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-[#1e1e1e] border border-[#2a2b2e] h-24 rounded-2xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="w-20 h-20 bg-[#1e1e1e] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#2a2b2e]">
            <ClipboardList className="w-10 h-10 text-zinc-600" />
          </div>
          <p className="text-lg font-bold text-zinc-200 mb-2">Chưa có lịch sử tập luyện</p>
          <p className="text-sm text-zinc-500 max-w-[250px] mx-auto leading-relaxed">Khi bạn hoàn thành buổi tập đầu tiên cùng HLV, nó sẽ hiện ở đây.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session: any) => (
            <div 
              key={session.id} 
              className="bg-[#1e1e1e] border border-[#2a2b2e] hover:border-[#d4af37]/30 transition-all cursor-pointer rounded-2xl overflow-hidden group"
              onClick={() => setSelectedSession(session)}
            >
              <div className="flex items-stretch">
                <div className="w-1.5 bg-emerald-500 shrink-0 group-hover:bg-[#d4af37] transition-colors" />
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                     <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                        <CheckCircle2 size={12} className="mr-1" /> Đã tập
                     </span>
                     <div className="text-right">
                       <span className="flex items-center text-xs text-zinc-500 font-medium">
                         <Clock size={12} className="mr-1" /> {format(new Date(session.checked_in_at), 'HH:mm')}
                       </span>
                     </div>
                  </div>
                  
                  <h3 className="font-bold text-zinc-100 mb-1 leading-snug">
                    {format(new Date(session.checked_in_at), 'EEEE, dd/MM/yyyy', { locale: vi })}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-3">
                     <p className="text-sm text-zinc-400 font-medium flex items-center bg-[#121212] px-2 py-1 rounded-md border border-[#2a2b2e]">
                       PT: <span className="ml-1 text-zinc-200">{session.pt?.name || '---'}</span>
                     </p>
                     <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 hover:text-[#e5c56c] transition-colors border border-[#d4af37]/20">
                       <ChevronRight size={18} />
                     </Button>
                  </div>
                </div>
              </div>
            </div>
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
