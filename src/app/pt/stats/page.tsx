'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Wallet, CheckCircle2, User } from 'lucide-react';

export default function PTStatsPage() {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rate, setRate] = useState<number>(150000); // Default 150k/ca

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      // Calculate date range for selected month
      const start = startOfMonth(parseISO(`${month}-01`));
      const end = endOfMonth(parseISO(`${month}-01`));

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id, checked_in_at, client:client_id(name)
        `)
        .eq('pt_id', userId)
        .eq('status', 'done')
        .gte('checked_in_at', start.toISOString())
        .lte('checked_in_at', end.toISOString())
        .order('checked_in_at', { ascending: false });

      if (data) setSessions(data);
      setLoading(false);
    }
    fetchStats();
  }, [month]);

  const totalSessions = sessions.length;
  const estimatedIncome = totalSessions * rate;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500 pb-20 max-w-lg mx-auto p-4 sm:p-6">
      <div className="flex items-center space-x-3 mb-2">
        <Wallet className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Thu nhập ca dạy</h1>
      </div>

      {/* Month & Rate Config */}
      <Card className="border border-indigo-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 space-y-4">
           <div className="space-y-1.5 flex-1">
             <Label htmlFor="monthPicker" className="text-xs font-bold text-indigo-900 uppercase tracking-widest px-1">Chọn tháng</Label>
             <div className="relative">
               <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
               <Input 
                 id="monthPicker"
                 type="month"
                 value={month}
                 onChange={(e) => setMonth(e.target.value)}
                 className="pl-10 font-bold text-gray-800 bg-white border-white focus-visible:ring-indigo-500 shadow-sm rounded-xl h-12"
               />
             </div>
           </div>
           <div className="space-y-1.5 flex-1">
             <Label htmlFor="rateInput" className="text-xs font-bold text-indigo-900 uppercase tracking-widest px-1">Đơn giá / ca (VNĐ)</Label>
             <Input 
               id="rateInput"
               type="number"
               inputMode="numeric"
               value={rate || ''}
               onChange={(e) => setRate(Number(e.target.value))}
               className="font-bold text-gray-800 bg-white border-white focus-visible:ring-indigo-500 shadow-sm rounded-xl h-12"
             />
           </div>
        </div>
        
        <div className="p-6">
           <div className="flex justify-between items-end mb-4">
             <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tổng số ca:</span>
             <span className="text-3xl font-black text-indigo-600">{loading ? '...' : totalSessions}</span>
           </div>
           <div className="flex justify-between items-end border-t pt-4 border-gray-100">
             <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Ước tính thu nhập:</span>
             <span className="text-3xl font-black text-green-600">
               {loading ? '...' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(estimatedIncome)}
             </span>
           </div>
        </div>
      </Card>

      {/* List of Sessions */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Danh sách buổi tập ({format(parseISO(`${month}-01`), 'MM/yyyy')})</h3>
        
        {loading ? (
          <div className="space-y-3">
             {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl"></div>)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed text-gray-400">
            <p className="font-medium">Chưa có ca dạy nào trong tháng này.</p>
          </div>
        ) : (
          <div className="space-y-2">
             {sessions.map((session, index) => (
                <div key={session.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 tracking-tighter flex items-center justify-center font-black text-lg border border-blue-100">
                     {index + 1}
                  </div>
                  <div className="flex-1">
                     <p className="font-bold text-gray-900 flex items-center gap-1"><User size={14} className="text-gray-400"/> {session.client?.name}</p>
                     <p className="text-xs font-semibold text-gray-500 mt-0.5 ml-5">
                       {format(new Date(session.checked_in_at), 'HH:mm - dd/MM/yyyy')}
                     </p>
                  </div>
                  <CheckCircle2 className="text-green-500 w-5 h-5 shrink-0" />
                </div>
             ))}
          </div>
        )}
      </div>

    </div>
  );
}
