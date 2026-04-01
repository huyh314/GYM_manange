'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function PackagesManagement() {
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    total_sessions: '',
    price: '',
    description: '',
    is_active: true,
    tier: 'normal'
  });

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/packages');
      if (res.ok) {
        const data = await res.json();
        setPackages(Array.isArray(data) ? data : []);
      }
    } catch(err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenDialog = (pkg?: any) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        total_sessions: pkg.total_sessions.toString(),
        price: pkg.price.toString(),
        description: pkg.description || '',
        is_active: pkg.is_active,
        tier: pkg.tier || 'normal'
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        total_sessions: '',
        price: '',
        description: '',
        is_active: true,
        tier: 'normal'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingPackage ? 'PUT' : 'POST';
      const url = editingPackage ? `/api/admin/packages/${editingPackage.id}` : '/api/admin/packages';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsDialogOpen(false);
        fetchPackages();
      } else {
        const errorData = await res.json();
        alert(`Lưu thất bại: ${errorData.error || res.statusText}`);
      }
    } catch(err: any) {
      alert(`Lỗi hệ thống: ${err.message}`);
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa gói tập này?')) return;
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPackages();
      } else {
        alert('Không thể xóa (có thể gói đã được sử dụng)');
      }
    } catch(err) {
       console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white/90 font-serif">Quản lý Gói tập</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-[#d4af37] text-black hover:bg-[#b5952f] shadow-lg shadow-black/20">
          <Plus className="mr-2 h-4 w-4" />
          Thêm gói mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground p-4">Đang tải dữ liệu...</p>
        ) : packages.map((pkg) => (
          <Card key={pkg.id} className={cn("relative overflow-hidden bg-[#1a1c1e] text-white border-white/5 shadow-2xl transition hover:border-[#d4af37]/50", !pkg.is_active && 'opacity-60 grayscale')}>
            {pkg.tier === 'vip' && <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden"><div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black text-[10px] font-bold py-1 px-4 text-center transform rotate-45 translate-x-[25px] translate-y-[10px] uppercase shadow-sm">VIP</div></div>}
            {pkg.tier === 'premium' && <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden"><div className="bg-gradient-to-r from-gray-500 to-gray-400 text-black text-[9px] font-bold py-1 px-4 text-center transform rotate-45 translate-x-[25px] translate-y-[10px] uppercase shadow-sm">PREMIUM</div></div>}
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl text-white/90 font-serif">{pkg.name}</CardTitle>
                <div className="flex gap-2 items-center">
                  {pkg.tier === 'normal' && <span className="text-[10px] font-semibold bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800/50 uppercase tracking-wider">Thường</span>}
                  {pkg.tier === 'vip' && <span className="text-[10px] font-semibold bg-yellow-900/30 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-800/50 uppercase tracking-wider">VIP</span>}
                  {pkg.tier === 'premium' && <span className="text-[10px] font-semibold bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700 uppercase tracking-wider">Premium</span>}
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleOpenDialog(pkg)} className="text-gray-400 hover:text-[#d4af37] transition-colors p-1 rounded-full hover:bg-white/10">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-white/10">
                  <Trash2 size={16} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-gray-400">
                <p><span className="font-medium text-gray-300">Số buổi:</span> {pkg.total_sessions}</p>
                <p><span className="font-medium text-gray-300">Giá tiền:</span> <span className="text-[#d4af37] font-bold tracking-widest">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}</span></p>
                {pkg.description && <p className="italic text-xs mt-2 text-gray-500 line-clamp-2">{pkg.description}</p>}
                {!pkg.is_active && <span className="inline-block mt-2 text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded">Đã vô hiệu hóa</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simple Dialog wrapper */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <Card className="w-full max-w-md bg-[#1a1c1e] text-white border-white/10 shadow-2xl animate-in zoom-in-95">
            <CardHeader className="pb-4 border-b border-white/10">
              <CardTitle className="font-serif text-[#d4af37]">{editingPackage ? 'Sửa gói tập' : 'Thêm gói tập mới'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Hạng gói</label>
                  <Tabs value={formData.tier} onValueChange={(val: any) => setFormData({...formData, tier: val})}>
                    <TabsList className="w-full bg-[#121212] border border-white/10 p-1">
                      <TabsTrigger value="normal" className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Gói thường</TabsTrigger>
                      <TabsTrigger value="vip" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-500 data-[state=active]:text-black text-gray-400">Gói VIP</TabsTrigger>
                      <TabsTrigger value="premium" className="flex-1 data-[state=active]:bg-gray-300 data-[state=active]:text-black text-gray-400">Gói Premium</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Tên gói</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Gói Giảm Cân 24 buổi" className="bg-[#121212] border-white/10 focus:border-[#d4af37] text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300">Số buổi</label>
                     <Input type="number" required value={formData.total_sessions} onChange={e => setFormData({...formData, total_sessions: e.target.value})} className="bg-[#121212] border-white/10 focus:border-[#d4af37] text-white" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300">Giá tiền (VNĐ)</label>
                     <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-[#121212] border-white/10 focus:border-[#d4af37] text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Mô tả thêm</label>
                  <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-[#121212] border-white/10 focus:border-[#d4af37] text-white" />
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                   <input type="checkbox" id="activeStatus" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="size-4 accent-[#d4af37] bg-black" />
                   <label htmlFor="activeStatus" className="text-sm font-medium text-gray-300">Kích hoạt (Cho phép hiển thị/bán)</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10 mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/10">Hủy</Button>
                  <Button type="submit" className="bg-[#d4af37] text-black hover:bg-[#b5952f]">Lưu lại</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
