'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SchedulePage() {
  const [activePackages, setActivePackages] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    user_package_id: '',
    date: '',
    time: '',
    notes: ''
  });

  const fetchData = async () => {
    Promise.all([
      fetch('/api/admin/user-packages').then(res => res.json()),
      fetch('/api/admin/sessions').then(res => res.json())
    ]).then(([packagesData, sessionsData]) => {
      setActivePackages(Array.isArray(packagesData) ? packagesData : []);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_package_id || !formData.date || !formData.time) {
       alert("Vui lòng nhập đủ thông tin (Gói, Ngày, Giờ).");
       return;
    }
    
    // Find the selected user_package to get pt_id and client_id
    const selectedPkg = activePackages.find(p => p.id === formData.user_package_id);
    if (!selectedPkg) return;

    // Create ISO string for scheduled_at
    const scheduled_at = new Date(`${formData.date}T${formData.time}`).toISOString();

    const payload = {
      user_package_id: selectedPkg.id,
      pt_id: selectedPkg.pt_id,
      client_id: selectedPkg.client_id,
      scheduled_at,
      notes: formData.notes
    };

    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Tạo lịch tập thành công!');
        setFormData({ ...formData, date: '', time: '', notes: '' });
        fetchData();
      } else {
        const err = await res.json();
        alert('Lỗi: ' + err.error);
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold border-b border-white/10 pb-4 text-white/90 font-serif">Quản lý Lịch Tập</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Tạo Lịch */}
        <Card className="bg-[#1a1c1e] border-white/5 text-white shadow-2xl">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-[#d4af37] font-serif">Tạo lịch tập mới</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Chọn Gói / Học viên đang active</label>
                <select 
                  required
                  className="w-full flex h-10 rounded-md border border-white/10 bg-[#121212] px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                  value={formData.user_package_id} 
                  onChange={e => setFormData({...formData, user_package_id: e.target.value})}
                >
                  <option value="">-- Chọn Gói --</option>
                  {activePackages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.client?.name} (PT: {p.pt?.name}) - Còn {p.remaining_sessions} buổi
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Ngày tập</label>
                  <Input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-[#121212] border-white/10 text-white css-invert-calendar focus:border-[#d4af37]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Giờ tập</label>
                  <Input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-[#121212] border-white/10 text-white css-invert-calendar focus:border-[#d4af37] w-full block" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Ghi chú (Tùy chọn)</label>
                <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-[#121212] border-white/10 text-white focus:border-[#d4af37]" />
              </div>

              <Button type="submit" className="w-full mt-4 bg-[#d4af37] text-black hover:bg-[#b5952f] font-bold shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] transition-all">Xác nhận Đặt lịch</Button>
            </form>
          </CardContent>
        </Card>

        {/* Danh sách Lịch */}
        <Card className="bg-[#1a1c1e] border-white/5 text-white shadow-2xl flex flex-col">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-[#d4af37] font-serif">Danh sách lịch sắp tới</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex-1 h-[450px]">
            <div className="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar">
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Chưa có lịch tập nào.</p>
              ) : (
                sessions.filter(s => s.status !== 'completed').map(session => (
                  <div key={session.id} className="p-4 border border-white/10 rounded-lg bg-[#121212] flex flex-col gap-2 hover:border-[#d4af37]/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-[#d4af37]">
                        {new Date(session.scheduled_at).toLocaleDateString('vi-VN')}
                        {' - '}
                        {new Date(session.scheduled_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs px-2.5 py-1 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded-full font-medium tracking-wide">
                        {session.status === 'scheduled' ? 'Sắp tới' : session.status}
                      </span>
                    </div>
                    <div className="text-sm mt-1 text-gray-300">
                      <p><strong className="text-gray-400">Học viên:</strong> {session.client?.name}</p>
                      <p><strong className="text-gray-400">PT:</strong> {session.pt?.name}</p>
                    </div>
                    {session.notes && <p className="text-xs text-gray-500 italic mt-1 border-t border-white/5 pt-2">"{session.notes}"</p>}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
