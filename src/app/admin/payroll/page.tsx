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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <DollarSign className="text-emerald-500" /> Tính Lương PT
          </h1>
          <p className="text-sm text-gray-500 mt-1">Tổng kết lương theo tháng</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2 shadow-sm">
            <Calendar size={16} className="text-gray-400" />
            <Input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="border-0 p-0 h-auto text-sm font-bold focus-visible:ring-0 w-36"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-emerald-600 uppercase">Tổng lương</p>
            <p className="text-xl font-black text-emerald-700 mt-1">{formatVND(totalPayroll)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-blue-600 uppercase">Tổng ca</p>
            <p className="text-xl font-black text-blue-700 mt-1">{totalSessions}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-purple-50">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-violet-600 uppercase">Số PT</p>
            <p className="text-xl font-black text-violet-700 mt-1">{payroll.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-amber-600 uppercase">Đã trả</p>
            <p className="text-xl font-black text-amber-700 mt-1">{paidCount}/{payroll.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      {loading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      ) : payroll.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center text-gray-400">
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold">Không có dữ liệu</p>
            <p className="text-sm mt-1">Chưa có PT nào hoặc tháng này chưa có ca dạy</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">PT</div>
              <div className="col-span-2 text-center">Đơn giá/ca</div>
              <div className="col-span-2 text-center">Ca đã dạy</div>
              <div className="col-span-2 text-right">Thành tiền</div>
              <div className="col-span-3 text-right">Thao tác</div>
            </div>

            {/* Table Body */}
            {payroll.map((entry) => (
              <div key={entry.pt_id} className="border-b last:border-0">
                {/* Main Row */}
                <div
                  className={`grid grid-cols-1 sm:grid-cols-12 gap-2 px-6 py-4 items-center cursor-pointer hover:bg-gray-50/60 transition-colors ${
                    expandedPT === entry.pt_id ? 'bg-indigo-50/30' : ''
                  }`}
                  onClick={() => setExpandedPT(expandedPT === entry.pt_id ? null : entry.pt_id)}
                >
                  <div className="sm:col-span-3 flex items-center gap-3">
                    <button className="p-0.5 text-gray-400">
                      {expandedPT === entry.pt_id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm">
                      {entry.pt_name.charAt(0)}
                    </div>
                    <span className="font-bold text-gray-900">{entry.pt_name}</span>
                  </div>
                  <div className="sm:col-span-2 text-center font-bold text-gray-600 text-sm">
                    <span className="sm:hidden text-xs text-gray-400 mr-2">Đơn giá:</span>
                    {formatVND(entry.rate_per_session)}
                  </div>
                  <div className="sm:col-span-2 text-center">
                    <span className="sm:hidden text-xs text-gray-400 mr-2">Ca dạy:</span>
                    <span className="font-black text-blue-600 text-lg">{entry.sessions_count}</span>
                  </div>
                  <div className="sm:col-span-2 text-right">
                    <span className="sm:hidden text-xs text-gray-400 mr-2">Tổng:</span>
                    <span className="font-black text-emerald-600">{formatVND(entry.total_amount)}</span>
                  </div>
                  <div className="sm:col-span-3 flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                    {entry.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle size={12} /> Đã trả
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 rounded-full"
                        onClick={() => handleMarkPaid(entry)}
                      >
                        <CheckCircle size={14} className="mr-1" /> Đánh dấu đã trả
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full"
                      onClick={() => handleExportPDF(entry)}
                    >
                      <FileText size={14} className="mr-1" /> PDF
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedPT === entry.pt_id && (
                  <div className="px-6 pb-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-gray-50 rounded-xl border p-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Chi tiết buổi dạy trong tháng</h4>
                      {entry.sessions.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">Không có ca dạy</p>
                      ) : (
                        <div className="space-y-1.5">
                          {entry.sessions.map((s, idx) => (
                            <div key={s.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-white">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 font-bold w-6">{idx + 1}.</span>
                                <span className="font-medium text-gray-800">{s.client_name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <Calendar size={12} />
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
