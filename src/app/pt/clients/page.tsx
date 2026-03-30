'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Users, ChevronRight, Package, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ClientInfo {
  id: string;
  name: string;
  phone: string;
  avatar_url?: string;
  packages: {
    id: string;
    status: string;
    total_sessions: number;
    remaining_sessions: number;
    package_name: string;
  }[];
  totalRemaining: number;
  totalSessions: number;
  lastSessionAt?: string;
}

export default function PTClientsPage() {
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/pt/clients')
      .then(res => res.json())
      .then(data => {
        setClients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="space-y-4 max-w-lg mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <Users className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Học viên của tôi</h1>
        <span className="ml-auto text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{clients.length}</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm học viên..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-white border-gray-200 h-11 rounded-xl font-medium"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-600">
            {search ? 'Không tìm thấy học viên nào' : 'Chưa có học viên'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {search ? 'Thử từ khóa khác' : 'Khi Admin gán gói tập cho bạn, học viên sẽ xuất hiện ở đây'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(client => {
            const hasActive = client.packages.some(p => p.status === 'active');
            const activePackage = client.packages.find(p => p.status === 'active');
            
            return (
              <Link key={client.id} href={`/pt/clients/${client.id}`} className="block group">
                <Card className={`overflow-hidden border shadow-sm hover:shadow-md transition-all rounded-2xl ${hasActive ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <div className={`w-1.5 shrink-0 ${hasActive ? 'bg-indigo-500 group-hover:bg-indigo-400' : 'bg-gray-300'} transition-colors`} />
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0 ${hasActive ? 'bg-gradient-to-br from-indigo-500 to-purple-500' : 'bg-gray-400'}`}>
                              {client.avatar_url ? (
                                <img src={client.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                client.name?.charAt(0)?.toUpperCase() || '?'
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 leading-tight">{client.name}</h3>
                              <p className="text-xs text-gray-500 font-medium">{client.phone}</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          {activePackage && (
                            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                              <Package size={10} className="mr-1" />
                              {activePackage.package_name}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                            client.totalRemaining > 0
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                              : 'text-red-700 bg-red-50 border border-red-100'
                          }`}>
                            Còn {client.totalRemaining} buổi
                          </span>
                          {client.lastSessionAt && (
                            <span className="text-[10px] font-medium text-gray-400 flex items-center ml-auto">
                              <Clock size={10} className="mr-1" />
                              {formatDistanceToNow(new Date(client.lastSessionAt), { addSuffix: true, locale: vi })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
