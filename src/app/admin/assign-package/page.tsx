'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AssignPackagePage() {
  const [clients, setClients] = useState<any[]>([]);
  const [pts, setPts] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    client_id: '',
    package_id: '',
    pt_id: '',
    amount_paid: ''
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users?role=client').then(res => res.json()),
      fetch('/api/admin/users?role=pt').then(res => res.json()),
      fetch('/api/admin/packages').then(res => res.json())
    ]).then(([clientsData, ptsData, packagesData]) => {
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setPts(Array.isArray(ptsData) ? ptsData : []);
      setPackages(Array.isArray(packagesData) ? packagesData.filter((p: any) => p.is_active) : []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || !formData.package_id || !formData.pt_id) {
       alert("Vui lòng chọn đầy đủ Học viên, Gói tập và PT.");
       return;
    }
    try {
      const res = await fetch('/api/admin/user-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Gán gói tập thành công!');
        setFormData({ ...formData, client_id: '', amount_paid: '' });
      } else {
        const err = await res.json();
        alert('Lỗi: ' + err.error);
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 border-b pb-4">Gán gói tập cho Học viên</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Học viên</label>
              <select 
                required
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.client_id} 
                onChange={e => setFormData({...formData, client_id: e.target.value})}
              >
                <option value="">-- Chọn học viên --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gói tập</label>
              <select 
                required
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.package_id} 
                onChange={e => setFormData({...formData, package_id: e.target.value})}
              >
                <option value="">-- Chọn gói --</option>
                {packages.map(p => <option key={p.id} value={p.id}>{p.name} - {p.total_sessions} buổi</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">PT Phụ trách</label>
              <select 
                required
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.pt_id} 
                onChange={e => setFormData({...formData, pt_id: e.target.value})}
              >
                <option value="">-- Chọn PT --</option>
                {pts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Số tiền đã thu (VNĐ)</label>
              <Input 
                type="number" 
                placeholder="VD: 5000000"
                value={formData.amount_paid} 
                onChange={e => setFormData({...formData, amount_paid: e.target.value})} 
              />
            </div>

            <Button type="submit" className="w-full mt-4">Xác nhận Đăng ký</Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="text-sm text-gray-500 text-center">
        Lưu ý: Bạn có thể vào "Nhân sự" để tạo thêm học viên mới nếu không thấy trong danh sách.
      </p>
    </div>
  );
}
