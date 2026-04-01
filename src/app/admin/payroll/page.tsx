'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Calendar, ChevronDown, ChevronRight, CheckCircle, Clock, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PayrollEntry {
  pt_id: string;
  pt_name: string;
  rate_per_session: number;
  sessions_count: number;
  total_amount: number;
  status: 'pending' | 'paid';
  paid_at: string | null;
  record_id: string | null;
  sessions: Array<{
    id: string;
    client_name: string;
    checked_in_at: string;
  }>;
}

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    return format(now, 'yyyy-MM');
  });
  const [expandedPT, setExpandedPT] = useState<string | null>(null);
  const [monthKey, setMonthKey] = useState('');

  useEffect(() => {
    loadPayroll();
  }, [selectedMonth]);

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payroll?month=${selectedMonth}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPayroll(data.payroll || []);
      setMonthKey(data.monthKey);
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (entry: PayrollEntry) => {
    if (!confirm(`Đánh dấu đã trả lương cho ${entry.pt_name}?\n${formatVND(entry.total_amount)}`)) return;
    
    try {
      const res = await fetch('/api/admin/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pt_id: entry.pt_id,
          month: monthKey,
          sessions_count: entry.sessions_count,
          rate_per_session: entry.rate_per_session,
          total_amount: entry.total_amount,
          record_id: entry.record_id,
          action: entry.record_id ? 'mark_paid' : 'create',
        }),
      });
      
      if (!res.ok) throw new Error('Failed');
      toast.success(`Đã đánh dấu trả lương cho ${entry.pt_name}`);
      loadPayroll();
    } catch {
      toast.error('Lỗi khi cập nhật');
    }
  };

  const handleExportPDF = async (entry: PayrollEntry) => {
    try {
      const { exportPayrollPDF } = await import('@/lib/export/exportPayrollPDF');
      exportPayrollPDF({
        name: entry.pt_name,
        ratePerSession: entry.rate_per_session,
        sessionsCount: entry.sessions_count,
        totalAmount: entry.total_amount,
        sessions: entry.sessions,
      }, selectedMonth);
      toast.success('Đã tạo file PDF');
    } catch (err: any) {
      toast.error('Lỗi tạo PDF: ' + err.message);
    }
  };

  const totalPayroll = payroll.reduce((sum, p) => sum + p.total_amount, 0);
  const totalSessions = payroll.reduce((sum, p) => sum + p.sessions_count, 0);
  const paidCount = payroll.filter(p => p.status === 'paid').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white/90 font-serif flex items-center gap-2">
            <DollarSign className="text-[#d4af37]" /> Tính Lương PT
          </h1>
          <p className="text-sm text-gray-400 mt-1">Tổng kết lương theo tháng</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-xl px-3 py-2 shadow-sm text-white focus-within:border-[#d4af37] transition-colors">
            <Calendar size={16} className="text-[#d4af37]" />
            <Input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="border-0 p-0 h-auto text-sm font-bold bg-transparent text-white focus-visible:ring-0 w-36 css-invert-calendar"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] bg-gradient-to-br from-[#1a1c1e] to-emerald-900/10">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-emerald-400 uppercase">Tổng lương</p>
            <p className="text-xl font-black text-emerald-500 mt-1">{formatVND(totalPayroll)}</p>
          </CardContent>
        </Card>
        <Card className="border border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] bg-gradient-to-br from-[#1a1c1e] to-blue-900/10">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-blue-400 uppercase">Tổng ca</p>
            <p className="text-xl font-black text-blue-500 mt-1">{totalSessions}</p>
          </CardContent>
        </Card>
        <Card className="border border-violet-900/50 shadow-[0_0_15px_rgba(139,92,246,0.1)] bg-gradient-to-br from-[#1a1c1e] to-violet-900/10">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-violet-400 uppercase">Số PT</p>
            <p className="text-xl font-black text-violet-500 mt-1">{payroll.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-[#d4af37]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)] bg-gradient-to-br from-[#1a1c1e] to-[#d4af37]/10">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-[#d4af37] uppercase">Đã trả</p>
            <p className="text-xl font-black text-[#d4af37] mt-1">{paidCount}/{payroll.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      {loading ? (
        <Card className="border-white/5 bg-[#1a1c1e] shadow-sm mt-4">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-white/5 rounded w-1/3" />
              <div className="h-10 bg-white/5 rounded" />
              <div className="h-10 bg-white/5 rounded" />
            </div>
          </CardContent>
        </Card>
      ) : payroll.length === 0 ? (
        <Card className="border-white/5 bg-[#1a1c1e] shadow-sm mt-4">
          <CardContent className="p-12 text-center text-gray-500">
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold">Không có dữ liệu</p>
            <p className="text-sm mt-1 text-gray-400">Chưa có PT nào hoặc tháng này chưa có ca dạy</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/5 bg-[#1a1c1e] text-white shadow-sm rounded-2xl overflow-hidden mt-4">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-6 py-3 bg-[#121212] border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-3">PT</div>
              <div className="col-span-2 text-center">Đơn giá/ca</div>
              <div className="col-span-2 text-center">Ca đã dạy</div>
              <div className="col-span-2 text-right">Thành tiền</div>
              <div className="col-span-3 text-right">Thao tác</div>
            </div>

            {/* Table Body */}
            {payroll.map((entry) => (
              <div key={entry.pt_id} className="border-b border-white/5 last:border-0">
                {/* Main Row */}
                <div
                  className={`grid grid-cols-1 sm:grid-cols-12 gap-2 px-6 py-4 items-center cursor-pointer hover:bg-white/5 transition-colors ${
                    expandedPT === entry.pt_id ? 'bg-[#d4af37]/5' : ''
                  }`}
                  onClick={() => setExpandedPT(expandedPT === entry.pt_id ? null : entry.pt_id)}
                >
                  <div className="sm:col-span-3 flex items-center gap-3">
                    <button className="p-0.5 text-gray-500 hover:text-white">
                      {expandedPT === entry.pt_id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] font-black text-sm">
                      {entry.pt_name.charAt(0)}
                    </div>
                    <span className="font-bold text-white/90">{entry.pt_name}</span>
                  </div>
                  <div className="sm:col-span-2 text-center font-bold text-gray-300 text-sm">
                    <span className="sm:hidden text-xs text-gray-500 mr-2">Đơn giá:</span>
                    {formatVND(entry.rate_per_session)}
                  </div>
                  <div className="sm:col-span-2 text-center flex items-center justify-center gap-2">
                    <span className="sm:hidden text-xs text-gray-500">Ca dạy:</span>
                    <span className="font-black text-blue-400 text-lg">{entry.sessions_count}</span>
                  </div>
                  <div className="sm:col-span-2 text-right flex items-center justify-end gap-2">
                    <span className="sm:hidden text-xs text-gray-500">Tổng:</span>
                    <span className="font-black text-emerald-400 text-base">{formatVND(entry.total_amount)}</span>
                  </div>
                  <div className="sm:col-span-3 flex text-right items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                    {entry.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle size={12} /> Đã trả
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold text-xs h-8 rounded-full"
                        onClick={() => handleMarkPaid(entry)}
                      >
                        <CheckCircle size={14} className="mr-1" /> Đánh dấu đã trả
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-full bg-transparent"
                      onClick={() => handleExportPDF(entry)}
                    >
                      <FileText size={14} className="mr-1" /> PDF
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedPT === entry.pt_id && (
                  <div className="px-6 pb-4 animate-in slide-in-from-top-2 duration-200 mt-2">
                    <div className="bg-[#121212] rounded-xl border border-white/10 p-4 shadow-inner">
                      <h4 className="text-xs font-bold text-[#d4af37] uppercase mb-3 border-b border-white/10 pb-2">Chi tiết buổi dạy trong tháng</h4>
                      {entry.sessions.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Không có ca dạy</p>
                      ) : (
                        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {entry.sessions.map((s, idx) => (
                            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2 px-3 rounded hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors gap-2">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-[#d4af37] font-bold w-6">{idx + 1}.</span>
                                <span className="font-medium text-gray-300">{s.client_name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <Calendar size={12} className="text-[#d4af37]" />
                                {s.checked_in_at ? format(new Date(s.checked_in_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
