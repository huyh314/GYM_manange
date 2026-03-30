'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, XCircle, Info, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NotificationLog {
  id: string;
  channel: 'push' | 'zalo' | 'inapp';
  type: string;
  title?: string;
  body: string;
  status: 'sent' | 'delivered' | 'failed';
  error_msg?: string;
  sent_at: string;
  users?: { name: string };
}

export default function NotificationLogsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle2 className="text-green-500" size={18} />;
      case 'failed':
        return <XCircle className="text-red-500" size={18} />;
      default:
        return <Info className="text-blue-500" size={18} />;
    }
  };

  const getChannelBadge = (channel: string) => {
    const colors: Record<string, string> = {
      push: 'bg-orange-100 text-orange-700 border-orange-200',
      zalo: 'bg-blue-100 text-blue-700 border-blue-200',
      inapp: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[channel] || 'bg-gray-100'}`}>
        {channel.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-primary" />
            Nhật ký Thông báo
          </h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi trạng thái gửi tin nhắn Push và Zalo.</p>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Thời gian</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Kênh</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Người nhận</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Tiêu đề / Nội dung</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Đang tải dữ liệu...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Chưa có bản ghi nào.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(log.sent_at), 'HH:mm dd/MM/yy', { locale: vi })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getChannelBadge(log.channel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{log.users?.name || 'Hệ thống'}</div>
                      <div className="text-xs text-gray-400">{log.type}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {log.title || 'Nội dung'}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {log.body}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(log.status)}
                        <span className={`text-sm font-medium ${log.status === 'failed' ? 'text-red-700' : 'text-green-700'}`}>
                          {log.status === 'sent' ? 'Đã gửi' : log.status === 'delivered' ? 'Đã nhận' : 'Lỗi'}
                        </span>
                      </div>
                      {log.error_msg && (
                        <div className="text-[10px] text-red-400 mt-1 max-w-[150px] truncate" title={log.error_msg}>
                          {log.error_msg}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
