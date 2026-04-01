'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Award, TrendingUp, BarChart3, Flame, Target } from 'lucide-react';
import dynamic from 'next/dynamic';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

// Dynamically import Recharts to reduce initial bundle size and improve tab switching speed
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });

export default function ClientProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  useEffect(() => {
    fetch('/api/client/progress')
      .then(res => res.json())
      .then(d => {
        setData(d);
        if (d.exerciseNames?.length > 0) {
          setSelectedExercise(d.exerciseNames[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const strengthChartData = useMemo(() => {
    if (!data || !selectedExercise || !data.strengthData || !data.strengthData[selectedExercise]) return [];
    return data.strengthData[selectedExercise].map((p: any) => ({
      date: format(parseISO(p.date), 'dd/MM'),
      fullDate: format(parseISO(p.date), 'dd/MM/yyyy'),
      maxWeight: p.maxWeight,
      reps: p.bestSet?.reps || 0,
    }));
  }, [selectedExercise, data]);

  const strengthTrend = useMemo(() => {
    if (strengthChartData.length < 2) return null;
    const first = strengthChartData[0].maxWeight;
    const last = strengthChartData[strengthChartData.length - 1].maxWeight;
    return last - first;
  }, [strengthChartData]);

  const bmi = useMemo(() => {
    if (!data || !data.user || !data.weightLogs) return null;
    const { user, weightLogs } = data;
    const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_kg : null;
    return user.height_cm && latestWeight
      ? (latestWeight / ((user.height_cm / 100) ** 2)).toFixed(1)
      : null;
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-[#2a2b2e] rounded w-1/3" />
        <div className="h-48 bg-[#2a2b2e] rounded-2xl" />
        <div className="h-64 bg-[#2a2b2e] rounded-2xl" />
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="font-bold text-zinc-400">Không thể tải dữ liệu</p>
      </div>
    );
  }

  const { strengthData, exerciseNames, personalRecords, weightLogs, totalSessions, user } = data;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 pb-10">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-[#d4af37]" />
        <h1 className="text-2xl font-black text-zinc-100 tracking-tight">Tiến độ của tôi</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1e1e1e] border border-[#2a2b2e] rounded-2xl border-t-2 border-t-[#d4af37] p-3 text-center">
          <Flame className="w-5 h-5 text-[#d4af37] mx-auto mb-1" />
          <div className="text-2xl font-black text-zinc-100">{totalSessions}</div>
          <div className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">buổi tập</div>
        </div>
        <div className="bg-[#1e1e1e] border border-[#2a2b2e] rounded-2xl border-t-2 border-t-amber-500 p-3 text-center">
          <Dumbbell className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-zinc-100">{exerciseNames.length}</div>
          <div className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">bài tập</div>
        </div>
        <div className="bg-[#1e1e1e] border border-[#2a2b2e] rounded-2xl border-t-2 border-t-emerald-500 p-3 text-center">
          <Award className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-zinc-100">{Object.keys(personalRecords || {}).length}</div>
          <div className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">Kỷ lục</div>
        </div>
      </div>

      {/* Strength Progress */}
      {exerciseNames.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
            <Dumbbell size={16} className="text-[#d4af37]" /> Biểu đồ sức mạnh
          </h3>

          {/* Exercise Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
            {exerciseNames.map((name: string) => (
              <button
                key={name}
                onClick={() => setSelectedExercise(name)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 ${
                  selectedExercise === name
                    ? 'bg-[#d4af37] text-zinc-900 border-[#d4af37] shadow-md shadow-[#d4af37]/20'
                    : 'bg-[#1e1e1e] text-zinc-400 border-[#2a2b2e] hover:border-[#d4af37]/40 hover:text-zinc-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Trend Indicator */}
          {strengthTrend !== null && (
            <div className={`mb-3 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border ${
              strengthTrend > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : strengthTrend < 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[#1e1e1e] text-zinc-500 border-[#2a2b2e]'
            }`}>
              {strengthTrend > 0 ? <TrendingUp size={14} /> : strengthTrend < 0 ? <TrendingUp size={14} className="rotate-180" /> : null}
              {strengthTrend > 0 ? `+${strengthTrend}kg từ lần đầu` : strengthTrend < 0 ? `${strengthTrend}kg từ lần đầu` : 'Ổn định'}
            </div>
          )}

          {/* Chart */}
          {strengthChartData.length > 0 ? (
            <div className="bg-[#1e1e1e] border border-[#2a2b2e] rounded-2xl overflow-hidden p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strengthChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2b2e" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload?.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#2a2b2e] border border-[#d4af37]/30 text-white rounded-lg shadow-xl p-3 text-sm">
                            <p className="font-bold text-lg text-[#d4af37]">{d.maxWeight} kg</p>
                            <p className="text-zinc-400 text-xs">{d.reps} reps</p>
                            <p className="text-zinc-500 text-xs mt-1">{d.fullDate}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="maxWeight" fill="#d4af37" radius={[6, 6, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 bg-[#1e1e1e] rounded-2xl border border-dashed border-[#2a2b2e] text-zinc-500 text-sm font-medium">
              Chưa có dữ liệu cho bài tập này
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#1e1e1e] rounded-2xl border border-dashed border-[#2a2b2e]">
          <BarChart3 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="font-bold text-zinc-400">Chưa có dữ liệu phân tích sức mạnh</p>
          <p className="text-sm text-zinc-500 mt-1">Hoàn thành buổi tập đầu tiên với HLV để bắt đầu theo dõi</p>
        </div>
      )}

      {/* Personal Records */}
      {Object.keys(personalRecords || {}).length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
            <Award size={16} className="text-amber-400" /> Kỷ lục cá nhân
          </h3>
          <div className="space-y-2">
            {Object.entries(personalRecords).map(([exercise, pr]: [string, any]) => (
              <div key={exercise} className="bg-[#1e1e1e] border border-[#2a2b2e] rounded-2xl p-3 flex items-center justify-between hover:border-[#d4af37]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                    <Award size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-200 text-sm">{exercise}</p>
                    <p className="text-[10px] text-zinc-500 font-medium">{pr.date}</p>
                  </div>
                </div>
                <p className="text-xl font-black text-[#d4af37]">{pr.maxWeight}<span className="text-xs font-semibold text-zinc-500 ml-0.5">kg</span></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
