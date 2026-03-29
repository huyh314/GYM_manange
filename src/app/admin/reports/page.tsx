'use client';

import { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MonthPicker from './MonthPicker';
import SummaryCards from './SummaryCards';
import PTReportTable from './PTReportTable';
import PackagesSoldTable from './PackagesSoldTable';
import { toast } from 'sonner';

export default function AdminReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString());
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/reports?month=${encodeURIComponent(selectedMonth)}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.error) throw new Error(resData.error);
        setData(resData);
      })
      .catch(err => {
        console.error("Failed to load reports", err);
        toast.error('Lỗi khi tải dữ liệu báo cáo');
      })
      .finally(() => setIsLoading(false));
  }, [selectedMonth]);

  const handleExport = () => {
    toast.info('Tính năng đang phát triển (Phase 3)', {
      description: 'Chức năng xuất báo cáo Excel/PDF sẽ có trong bản cập nhật tới.',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Báo Cáo Tổng Hợp</h1>
          <p className="text-sm text-gray-500 mt-1">
            Xem số liệu doanh thu và hiệu suất HLV
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          
          <div className="flex items-center gap-2">
            <Button onClick={handleExport} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2">
              <Download size={16} /> <span>Excel</span>
            </Button>
            <Button onClick={handleExport} variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 gap-2">
              <FileText size={16} /> <span>PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards data={data?.summary || {}} isLoading={isLoading} />

      {/* PT Report Table */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Hiệu suất HLV trong tháng</h2>
        <PTReportTable data={data?.ptReport || []} isLoading={isLoading} />
      </div>

      {/* Packages Sold Table */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Danh sách gói đã bán</h2>
        <PackagesSoldTable data={data?.packagesList || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
