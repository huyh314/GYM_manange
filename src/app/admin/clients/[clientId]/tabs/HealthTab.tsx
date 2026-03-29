'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Dot } from 'recharts';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Plus, Activity, TrendingDown, TrendingUp } from 'lucide-react';

interface WeightLog {
  id: string;
  weight_kg: number;
  log_date: string;
  notes?: string;
}

export default function HealthTab({ clientId, initialWeights }: { clientId: string, initialWeights: WeightLog[] }) {
  const [weights, setWeights] = useState<WeightLog[]>(initialWeights || []);

  const handleAddWeight = () => {
    // Phase 3 or a simple alert for now
    alert('Tính năng cập nhật cân nặng sẽ mở modal. Đang phát triển (Phase 3).');
  };

  if (!weights || weights.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden mt-6">
        <CardContent className="p-0 h-[300px] flex flex-col items-center justify-center text-gray-400">
          <Activity className="w-8 h-8 opacity-20 mb-2" />
          <p className="text-sm font-medium mb-4">Chưa có dữ liệu theo dõi cân nặng</p>
          <Button onClick={handleAddWeight} variant="outline" className="text-sm font-bold text-violet-700 bg-violet-50 border-violet-200 hover:bg-violet-100">
            <Plus size={16} className="mr-1" /> Cập nhật ngay
          </Button>
        </CardContent>
      </Card>
    );
  }

  const chartData = [...weights].sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()).map(w => ({
    ...w,
    label: format(parseISO(w.log_date), 'dd/MM')
  }));

  const initialWeight = chartData[0]?.weight_kg || 0;
  const currentWeight = chartData[chartData.length - 1]?.weight_kg || 0;
  const diff = currentWeight - initialWeight;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border shadow-lg rounded-xl text-sm">
          <p className="font-bold text-gray-800 mb-1">{format(parseISO(data.log_date), 'dd/MM/yyyy')}</p>
          <span className="text-rose-600 font-black text-lg">
            {data.weight_kg} kg
          </span>
          {data.notes && <p className="text-gray-500 text-xs italic mt-1">{data.notes}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Activity size={20} className="text-rose-500" /> Biểu đồ cân nặng
        </h3>
        <Button onClick={handleAddWeight} size="sm" className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full">
          <Plus size={16} className="mr-1" /> Cập nhật
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm rounded-2xl md:col-span-2">
          <CardContent className="p-6 h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  dy={10} 
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="weight_kg" 
                  stroke="#f43f5e" 
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: "#f43f5e", stroke: "#fff", strokeWidth: 2 }}
                  dot={<Dot r={4} fill="#f43f5e" stroke="#fff" strokeWidth={2} />}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-gray-50 border rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ban đầu</p>
            <p className="text-2xl font-black text-gray-900">{initialWeight} <span className="text-sm font-semibold text-gray-500">kg</span></p>
          </div>
          <div className="bg-gray-50 border rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hiện tại</p>
            <p className="text-2xl font-black text-gray-900">{currentWeight} <span className="text-sm font-semibold text-gray-500">kg</span></p>
          </div>
          <div className={`border rounded-2xl p-5 shadow-sm ${diff <= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
             <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${diff <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                Thay đổi
             </p>
             <p className={`text-2xl font-black flex items-center gap-1 ${diff <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {diff === 0 ? '' : diff < 0 ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
                {Math.abs(diff).toFixed(1)} <span className="text-sm font-semibold">kg</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
