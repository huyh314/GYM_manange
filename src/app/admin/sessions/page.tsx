'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Filter, CheckSquare, XSquare, Trash2, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

interface Session {
  id: string;
  status: string;
  scheduled_at: string;
  checked_in_at?: string;
  pt?: { name: string };
  client?: { name: string };
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showReschedule, setShowReschedule] = useState(false);
  const [shiftDays, setShiftDays] = useState(1);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/admin/sessions');
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data);
    } catch {
      toast.error('Lỗi khi tải danh sách buổi tập');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllScheduled = () => {
    const scheduled = filtered.filter(s => s.status === 'scheduled').map(s => s.id);
    setSelected(new Set(scheduled));
  };

  const handleBulkCancel = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Huỷ ${selected.size} buổi tập đã chọn?`)) return;

    try {
      const res = await fetch('/api/admin/sessions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Đã huỷ ${selected.size} buổi tập`);
      setSelected(new Set());
      loadSessions();
    } catch {
      toast.error('Lỗi khi huỷ');
    }
  };

  const handleBulkReschedule = async () => {
    if (selected.size === 0 || !shiftDays) return;
    if (!confirm(`Dời ${selected.size} buổi tập thêm ${shiftDays} ngày?`)) return;

    try {
      const res = await fetch('/api/admin/sessions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reschedule', ids: Array.from(selected), shiftDays }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Đã dời ${selected.size} buổi tập`);
      setSelected(new Set());
      setShowReschedule(false);
      loadSessions();
    } catch {
      toast.error('Lỗi khi dời lịch');
    }
  };

  const filtered = sessions.filter(s => {
    if (filterStatus && s.status !== filterStatus) return false;
    if (filterDate) {
      const sessionDate = s.scheduled_at?.split('T')[0];
      if (sessionDate !== filterDate) return false;
    }
    return true;
  });

  const statusColor: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabel: Record<string, string> = {
    scheduled: 'Đã xếp',
    done: 'Hoàn thành',
    cancelled: 'Đã huỷ',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <CalendarDays className="text-blue-500" /> Quản Lý Buổi Tập
          </h1>
          <p className="text-sm text-gray-500 mt-1">Xem và quản lý tất cả buổi tập</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="w-40"
        />
        <div className="flex gap-2">
          {['', 'scheduled', 'done', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                filterStatus === status ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              {status ? statusLabel[status] : 'Tất cả'}
            </button>
          ))}
        </div>
        {filterDate && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setFilterDate('')}>
            Xoá filter
          </Button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-bold text-indigo-700">
            <CheckSquare size={14} className="inline mr-1" /> {selected.size} buổi đã chọn
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={() => setShowReschedule(true)}
            >
              <Clock size={12} className="mr-1" /> Dời lịch
            </Button>
            <Button
              size="sm"
              className="text-xs h-8 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleBulkCancel}
            >
              <XSquare size={12} className="mr-1" /> Huỷ buổi
            </Button>
            <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => setSelected(new Set())}>
              Bỏ chọn
            </Button>
          </div>
        </div>
      )}

      {/* Reschedule Dialog */}
      {showReschedule && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm animate-in zoom-in-95 duration-300">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-black text-gray-900">Dời lịch hàng loạt</h3>
              <p className="text-sm text-gray-500">Dời {selected.size} buổi tập đã chọn</p>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-gray-500">Số ngày dời</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={shiftDays}
                    onChange={e => setShiftDays(parseInt(e.target.value) || 0)}
                    className="w-20 text-center font-bold"
                  />
                  <span className="text-sm text-gray-500">ngày (số dương = lùi, số âm = tiến)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleBulkReschedule} className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold">
                  <ArrowRight size={14} className="mr-1" /> Dời lịch
                </Button>
                <Button variant="outline" onClick={() => setShowReschedule(false)} className="flex-1">
                  Huỷ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Select All */}
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" className="text-xs text-gray-400" onClick={selectAllScheduled}>
          Chọn tất cả buổi chưa dạy
        </Button>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center text-gray-400">
            <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="font-medium">Không có buổi tập nào</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y">
            {filtered.map(s => (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-gray-50/60 transition-colors ${selected.has(s.id) ? 'bg-indigo-50/40' : ''}`}
              >
                {/* Checkbox */}
                {s.status === 'scheduled' && (
                  <button onClick={() => toggleSelect(s.id)} className="shrink-0">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selected.has(s.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                    }`}>
                      {selected.has(s.id) && <CheckSquare size={12} className="text-white" />}
                    </div>
                  </button>
                )}
                {s.status !== 'scheduled' && <div className="w-5 shrink-0" />}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{(s.client as any)?.name || 'N/A'}</span>
                    <span className="text-gray-300">→</span>
                    <span className="text-sm text-gray-600 font-medium">{(s.pt as any)?.name || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.scheduled_at ? format(new Date(s.scheduled_at), 'dd/MM/yyyy HH:mm') : '—'}
                  </p>
                </div>

                {/* Status */}
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${statusColor[s.status] || 'bg-gray-100 text-gray-500'}`}>
                  {statusLabel[s.status] || s.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
