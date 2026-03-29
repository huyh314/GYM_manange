'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RevenueData {
  week_start: string;
  revenue: number;
  packages_sold: number;
}

export default function RevenueChart({ data }: { data: RevenueData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        Không đủ dữ liệu hiển thị
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map(item => {
    try {
      const date = parseISO(item.week_start);
      return {
        ...item,
        label: format(date, 'd/M'), // e.g. "14/1"
        revenueValue: item.revenue || 0,
      };
    } catch (e) {
      return { ...item, label: item.week_start, revenueValue: 0 };
    }
  });

  const formatCurrencyAbbrev = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border shadow-lg rounded-xl text-sm">
          <p className="font-bold text-gray-800 mb-1">Tuần từ {label}</p>
          <div className="flex flex-col gap-1">
            <span className="text-[#534AB7] font-semibold">
              Doanh thu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.revenue)}
            </span>
            <span className="text-gray-600">
              Gói đã bán: <span className="font-bold">{data.packages_sold}</span> gói
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <XAxis 
            dataKey="label" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            dy={10}
          />
          <YAxis 
            tickFormatter={formatCurrencyAbbrev}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(83, 74, 183, 0.05)' }} />
          <Bar dataKey="revenueValue" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#534AB7" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
