'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from '@/app/admin/clients/[clientId]/tabs/OverviewTab';
import HealthTab from '@/app/admin/clients/[clientId]/tabs/HealthTab';
import SessionHistoryTab from '@/app/admin/clients/[clientId]/tabs/SessionHistoryTab';

export default function ClientProfileTab({ clientId }: { clientId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    fetch(`/api/admin/clients/${clientId}`)
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải dữ liệu học viên');
        return res.json();
      })
      .then(resData => {
        if (resData.error) throw new Error(resData.error);
        setData(resData);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return <div className="p-8 text-center animate-pulse text-gray-500">Đang tải hồ sơ học viên...</div>;
  }

  if (!data?.user) {
    return (
      <Card className="border-0 shadow-sm mt-4">
        <CardContent className="p-8 text-center text-gray-500">
          Không tìm thấy hồ sơ học viên hoặc không có quyền truy cập.
        </CardContent>
      </Card>
    );
  }

  const { user, packages, sessions, weights } = data;

  return (
    <div className="space-y-4 pt-4 animate-in fade-in duration-300">
      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xl uppercase shrink-0">
            {user.name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{user.name}</h3>
            <p className="text-xs font-medium text-gray-500">{user.phone || 'Chưa cập nhật SĐT'}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-100/50 rounded-xl p-1 w-full justify-start overflow-x-auto flex-nowrap h-auto border">
          <TabsTrigger value="overview" className="flex-1 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold py-1.5 text-xs">
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="health" className="flex-1 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold py-1.5 text-xs">
            Sức khoẻ
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold py-1.5 text-xs">
            Lịch sử tập
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-4 mt-0">
           <OverviewTab user={user} packages={packages} />
        </TabsContent>
        <TabsContent value="health" className="pt-4 mt-0">
           <HealthTab clientId={clientId} initialWeights={weights} />
        </TabsContent>
        <TabsContent value="history" className="pt-4 mt-0">
           <SessionHistoryTab sessions={sessions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
