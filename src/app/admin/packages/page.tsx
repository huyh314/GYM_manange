'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function PackagesManagement() {
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    total_sessions: '',
    price: '',
    description: '',
    is_active: true
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
        is_active: pkg.is_active
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        total_sessions: '',
        price: '',
        description: '',
        is_active: true
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
        alert('Lưu thất bại');
      }
    } catch(err) {
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
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Gói tập</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" />
          Thêm gói mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground p-4">Đang tải dữ liệu...</p>
        ) : packages.map((pkg) => (
          <Card key={pkg.id} className={!pkg.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xl">{pkg.name}</CardTitle>
              <div className="flex space-x-2">
                <button onClick={() => handleOpenDialog(pkg)} className="text-gray-500 hover:text-blue-600 transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="text-gray-500 hover:text-red-600 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Số buổi:</span> {pkg.total_sessions}</p>
                <p><span className="font-medium">Giá tiền:</span> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}</p>
                {pkg.description && <p className="italic text-xs mt-2 text-gray-500">{pkg.description}</p>}
                {!pkg.is_active && <span className="inline-block mt-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Đã vô hiệu hóa</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simple Dialog implementation built-in to avoid dependency missing issues for Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md bg-white shadow-xl animate-in zoom-in-95">
            <CardHeader>
              <CardTitle>{editingPackage ? 'Sửa gói tập' : 'Thêm gói tập mới'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên gói</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Gói Giảm Cân 24 buổi" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Số buổi</label>
                     <Input type="number" required value={formData.total_sessions} onChange={e => setFormData({...formData, total_sessions: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Giá tiền (VNĐ)</label>
                     <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mô tả thêm</label>
                  <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                   <input type="checkbox" id="activeStatus" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="size-4" />
                   <label htmlFor="activeStatus" className="text-sm font-medium">Kích hoạt (Cho phép hiển thị/bán)</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                  <Button type="submit">Lưu lại</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
