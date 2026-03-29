'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, MessageSquare } from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import SessionHistoryTab from './tabs/SessionHistoryTab';
import HealthTab from './tabs/HealthTab';
import PhotosTab from './tabs/PhotosTab';
import { toast } from 'sonner';

export default function ClientProfilePage() {
  const { clientId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/clients/${clientId}`)
      .then(res => {
        if (!res.ok) throw new Error('Authorization failed or client not found');
        return res.json();
      })
      .then(resData => {
        if (resData.error) throw new Error(resData.error);
        setData(resData);
      })
      .catch(err => {
        toast.error('Lỗi khi tải dữ liệu', { description: err.message });
        // Optional: redirect back if forbidden
        // router.push('/admin/dashboard');
      })
      .finally(() => setIsLoading(false));
  }, [clientId, router]);

  const handleTabChange = (value: string) => {
    router.replace(`?tab=${value}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data?.user) return <div className="p-8 text-center text-gray-500">Không tìm thấy hoặc không có quyền.</div>;

  const { user, packages, sessions, weights } = data;
  const activePackage = packages?.find((p: any) => p.status === 'active');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="text-gray-500 hover:text-gray-900 -ml-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
      </Button>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-black text-2xl uppercase">
            {user.name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{user.name}</h1>
            <p className="text-sm font-medium text-gray-500">{user.phone || 'Chưa cập nhật SĐT'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {activePackage ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Đang tập: Còn {activePackage.remaining_sessions} buổi
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-600">
              Chưa có gói active
            </span>
          )}
          {activePackage?.pt && (
             <p className="text-sm font-medium text-gray-500 flex items-center">
               <User size={14} className="mr-1"/> PT: {activePackage.pt.name}
             </p>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-white border rounded-lg p-1 w-full justify-start h-auto flex-wrap sm:flex-nowrap shadow-sm mb-6">
          <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 font-semibold py-2">
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex-1 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 font-semibold py-2">
            Lịch sử buổi tập
          </TabsTrigger>
          <TabsTrigger value="health" className="flex-1 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 font-semibold py-2">
            Sức khoẻ
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex-1 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 font-semibold py-2">
            Ảnh Before/After
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
           <OverviewTab user={user} packages={packages} />
        </TabsContent>
        <TabsContent value="sessions">
           <SessionHistoryTab sessions={sessions} />
        </TabsContent>
        <TabsContent value="health">
           <HealthTab clientId={clientId as string} initialWeights={weights} />
        </TabsContent>
        <TabsContent value="photos">
           <PhotosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
