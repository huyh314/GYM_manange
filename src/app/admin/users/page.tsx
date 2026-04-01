'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, UserCog, User, ShieldCheck, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { DigitalMemberCard, MembershipTier } from '@/components/DigitalMemberCard';
import { cn } from '@/lib/utils';

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    role: 'client',
    rate_per_session: 0,
    tier: 'normal' as MembershipTier
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Card View state
  const [viewingCardUser, setViewingCardUser] = useState<any>(null);
  const [viewCardTier, setViewCardTier] = useState<MembershipTier>('normal');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch(err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUserId(user.id);
      setFormData({
        name: user.name,
        phone: user.phone,
        password: '',
        role: user.role,
        rate_per_session: user.rate_per_session || 0,
        tier: user.tier || 'normal'
      });
    } else {
      setEditingUserId(null);
      setFormData({
        name: '',
        phone: '',
        password: '',
        role: 'client',
        rate_per_session: 0,
        tier: 'normal'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/users';
      const method = editingUserId ? 'PATCH' : 'POST';
      const body = editingUserId ? { id: editingUserId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setIsDialogOpen(false);
        fetchUsers();
        alert(editingUserId ? 'Cập nhật thành công!' : 'Tạo người dùng thành công!');
      } else {
        const err = await res.json();
        alert('Lưu thất bại: ' + err.error);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const RoleIcon = ({ role }: { role: string }) => {
     if (role === 'admin') return <ShieldCheck className="text-red-500 w-4 h-4" />;
     if (role === 'pt') return <UserCog className="text-blue-500 w-4 h-4" />;
     return <User className="text-green-500 w-4 h-4" />;
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const colors: any = {
      admin: 'bg-red-900/30 text-red-400 border-red-800/50',
      pt: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
      client: 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[role] || 'bg-white/10 text-gray-300'}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white/90 font-serif">Quản lý Nhân sự & Học viên</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-[#d4af37] text-black hover:bg-[#b5952f] shadow-lg shadow-black/20">
          <Plus className="mr-2 h-4 w-4" />
          Thêm người mới
        </Button>
      </div>

      <Card className="bg-[#1a1c1e] border-white/5 shadow-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tên người dùng</th>
                  <th className="px-6 py-4 font-semibold">Số điện thoại</th>
                  <th className="px-6 py-4 font-semibold text-center">Gói/Hạng</th>
                  <th className="px-6 py-4 font-semibold">Đơn giá/ca</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Đang tải dữ liệu...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Không có dữ liệu</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white/90 flex items-center gap-2">
                        <RoleIcon role={user.role} />
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{user.phone}</td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          user.tier === 'vip' ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50" : 
                          user.tier === 'premium' ? "bg-gray-800 text-gray-300 border border-gray-600/50" : 
                          "bg-blue-900/30 text-blue-400 border border-blue-800/50"
                        )}>
                          {user.tier || 'normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {user.role === 'pt' ? (user.rate_per_session?.toLocaleString() || '0') + ' đ' : '-'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setViewingCardUser(user);
                            setViewCardTier('normal');
                          }} 
                          className="text-[#d4af37] hover:text-[#b5952f] hover:bg-[#d4af37]/10"
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          Xem thẻ
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)} className="text-gray-300 hover:text-white hover:bg-white/10">
                          Sửa
                        </Button>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Simple Dialog wrapper */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <Card className="w-full max-w-md bg-[#1a1c1e] text-white border-white/10 shadow-2xl animate-in zoom-in-95">
            <CardHeader className="pb-4 border-b border-white/10">
              <CardTitle className="font-serif text-[#d4af37]">{editingUserId ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Họ và tên</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Nguyễn Văn A" className="bg-[#121212] border-white/10 focus:border-[#d4af37] text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Số điện thoại (Dùng làm Tên đăng nhập)</label>
                  <Input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="VD: 0901234567" className="bg-[#121212] border-white/10 focus:border-[#d4af37] text-white" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-300">Mật khẩu (Mặc định: 123456)</label>
                   <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Bỏ trống để dùng mặc định" className="bg-[#121212] border-white/10 focus:border-[#d4af37] text-white" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-300">Vai trò</label>
                   <select 
                     className="w-full flex h-10 rounded-md border border-white/10 bg-[#121212] px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:border-[#d4af37] text-white"
                     value={formData.role}
                     onChange={e => setFormData({...formData, role: e.target.value})}
                   >
                     <option value="client">Khách hàng (Client)</option>
                     <option value="pt">Huấn luyện viên (PT)</option>
                     <option value="admin">Quản trị viên (Admin)</option>
                   </select>
                </div>
                {formData.role === 'pt' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#d4af37]">Đơn giá mỗi ca dạy (VNĐ)</label>
                    <Input 
                      type="number" 
                      value={formData.rate_per_session} 
                      onChange={e => setFormData({...formData, rate_per_session: Number(e.target.value)})} 
                      placeholder="VD: 150000" 
                      className="bg-[#121212] border-[#d4af37]/30 focus:border-[#d4af37] text-white"
                    />
                  </div>
                )}
                <div className="space-y-2">
                   <label className="text-sm font-medium text-[#d4af37]">Hạng thẻ hội viên</label>
                   <select 
                     className="w-full flex h-10 rounded-md border border-[#d4af37]/30 bg-[#121212] px-3 py-2 text-sm focus:border-[#d4af37] text-white"
                     value={formData.tier}
                     onChange={e => setFormData({...formData, tier: e.target.value as MembershipTier})}
                   >
                     <option value="normal">Normal (Bản chuẩn)</option>
                     <option value="vip">VIP (Thỏa sức tập luyện)</option>
                     <option value="premium">Premium (Thượng lưu)</option>
                   </select>
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

      {/* Card Viewer Dialog */}
      {viewingCardUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative animate-in zoom-in-95 duration-300 w-full max-w-sm flex flex-col items-center my-8">
            
            {/* Close button */}
            <button 
              onClick={() => setViewingCardUser(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 font-bold bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
            
            {/* Tier Toggle (3 options) */}
            <div className="mb-6 flex space-x-1 bg-white/10 p-1.5 rounded-xl border border-white/20">
              <button 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewCardTier === 'normal' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                onClick={() => setViewCardTier('normal')}
              >
                Thường
              </button>
              <button 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewCardTier === 'vip' ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'text-white/60 hover:text-white'}`}
                onClick={() => setViewCardTier('vip')}
              >
                VIP
              </button>
              <button 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewCardTier === 'premium' ? 'bg-gradient-to-r from-gray-400 to-gray-300 text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                onClick={() => setViewCardTier('premium')}
              >
                Premium
              </button>
            </div>

            {/* The Card */}
            <DigitalMemberCard user={viewingCardUser} tier={viewingCardUser.tier || viewCardTier} />
            
          </div>
        </div>
      )}
    </div>
  );
}
