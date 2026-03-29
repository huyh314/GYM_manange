'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, UserCheck, Users, CalendarCheck, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

export default function PTDetailsPage() {
  const { ptId } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/users/${ptId}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.error) throw new Error(resData.error);
        setData(resData);
      })
      .catch(err => toast.error('Lỗi khi tải dữ liệu', { description: err.message }))
      .finally(() => setIsLoading(false));
  }, [ptId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data?.pt) return <div className="p-8 text-center text-gray-500">Không tìm thấy HLV.</div>;

  const { pt, stats, activeClientsList, upcomingSchedule } = data;

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="text-gray-500 hover:text-gray-900 -ml-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
      </Button>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-2xl uppercase">
            {pt.name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{pt.name}</h1>
            <p className="text-sm font-medium text-gray-500">{pt.phone || 'Chưa cập nhật SĐT'}</p>
          </div>
        </div>
        <div>
          {pt.is_active ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700">
              <UserCheck size={16} className="mr-1.5" /> PT · Active
            </span>
          ) : (
             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-600">
               Không hoạt động
             </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-50`}>
              <CalendarCheck className={`w-6 h-6 text-blue-600`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ca đã dạy (tháng này)</p>
              <p className={`text-xl font-black mt-1 text-blue-600`}>{stats.sessionsThisMonth}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-violet-50`}>
              <Users className={`w-6 h-6 text-violet-600`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Học viên phụ trách</p>
              <p className={`text-xl font-black mt-1 text-violet-600`}>{stats.activeClientsCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50`}>
              <TrendingUp className={`w-6 h-6 text-emerald-600`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Doanh thu (tháng này)</p>
              <p className={`text-xl font-black mt-1 text-emerald-600`}>{formatCurrency(stats.revenueThisMonth)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Clients */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Users size={20} className="text-violet-500" /> Học viên đang theo học
          </h2>
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden min-h-[300px]">
            <CardContent className="p-0">
               {activeClientsList.length > 0 ? (
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b font-medium">
                        <tr>
                          <th className="px-4 py-3 font-bold text-gray-700">Tên học viên</th>
                          <th className="px-4 py-3 font-bold text-gray-700">Gói</th>
                          <th className="px-4 py-3 font-bold text-center text-gray-700">Còn lại</th>
                          <th className="px-4 py-3 font-bold text-gray-700">Gần nhất</th>
                        </tr>
                     </thead>
                     <tbody>
                       {activeClientsList.map((client: any) => (
                         <tr 
                           key={client.clientId} 
                           onClick={() => router.push(`/admin/clients/${client.clientId}`)}
                           className="border-b last:border-0 hover:bg-violet-50 cursor-pointer transition-colors"
                         >
                           <td className="px-4 py-3 font-bold text-gray-800">{client.clientName}</td>
                           <td className="px-4 py-3 text-sm font-semibold text-gray-600">{client.packageName}</td>
                           <td className="px-4 py-3 text-center">
                              <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full text-xs">
                                {client.remaining_sessions} / {client.total_sessions}
                              </span>
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-500 font-medium">
                              {client.last_session ? format(new Date(client.last_session), 'dd/MM/yyyy') : 'Chưa tập'}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                    <Users className="w-8 h-8 opacity-20 mb-2" />
                    <p className="text-sm">Chưa có học viên nào.</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Next 7 Days Schedule */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <CalendarIcon size={20} className="text-blue-500" /> Lịch tập 7 ngày tới
          </h2>
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden min-h-[300px]">
             <CardContent className="p-0">
                {upcomingSchedule.length > 0 ? (
                  <div className="overflow-x-auto flex flex-col">
                    {upcomingSchedule.map((session: any) => (
                      <div key={session.id} className="border-b last:border-0 p-4 hover:bg-gray-50/50 flex items-center justify-between">
                         <div>
                            <p className="font-bold text-gray-900">
                              {format(new Date(session.scheduled_at), "EEEE, dd/MM — HH:mm", { locale: vi })}
                            </p>
                            <p className="text-sm font-medium text-gray-600 mt-0.5">
                              Học viên: <span className="font-bold">{session.client?.name}</span>
                            </p>
                         </div>
                         <div className="bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold rounded-full">
                            Sắp tới
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                    <CalendarIcon className="w-8 h-8 opacity-20 mb-2" />
                    <p className="text-sm">Không có lịch tập nào trong 7 ngày tới.</p>
                 </div>
                )}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
