'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface WeightData {
  id: string;
  weight_kg: number;
  recorded_at: string;
}

export function WeightChart({ data }: { data: WeightData[] }) {
  const chartData = useMemo(() => {
    if (!data) return [];
    
    // Reverse the data so it's chronological for the chart
    const sorted = [...data].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
    
    return sorted.map(log => ({
      date: format(parseISO(log.recorded_at), 'dd/MM', { locale: vi }),
      weight: log.weight_kg,
      fullDate: format(parseISO(log.recorded_at), 'dd/MM/yyyy', { locale: vi }),
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-gray-400 font-medium">Chưa có dữ liệu cân nặng.</p>
      </div>
    );
  }

  // Calculate min/max for better Y-axis scaling
  const minWeight = Math.min(...chartData.map(d => d.weight));
  const maxWeight = Math.max(...chartData.map(d => d.weight));
  const domainMin = Math.max(0, Math.floor(minWeight - 2));
  const domainMax = Math.ceil(maxWeight + 2);

  return (
    <div className="h-64 w-full bg-white rounded-xl shadow-sm border p-4 pt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            dy={10}
          />
          <YAxis 
            domain={[domainMin, domainMax]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            dx={-10}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-gray-900 border-0 text-white rounded-lg shadow-xl p-3">
                    <p className="font-bold text-lg mb-1">{payload[0].value} kg</p>
                    <p className="text-xs text-gray-400">{payload[0].payload.fullDate}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#4F46E5" // indigo-600
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: '#4F46E5' }}
            activeDot={{ r: 6, fill: '#4F46E5', stroke: 'white', strokeWidth: 2 }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
