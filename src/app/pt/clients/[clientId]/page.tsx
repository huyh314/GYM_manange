'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, Dumbbell, TrendingUp, TrendingDown, Target, Award, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function PTClientDetailPage() {
  const { clientId } = useParams() as { clientId: string };
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  useEffect(() => {
    fetch(`/api/pt/clients/${clientId}/progress`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        if (d.exerciseNames?.length > 0) {
          setSelectedExercise(d.exerciseNames[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="max-w-lg mx-auto p-4 text-center py-20">
        <p className="text-gray-500 font-bold">Không thể tải dữ liệu học viên</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  const { user, strengthData, exerciseNames, personalRecords, weightLogs, totalSessions } = data;

  // Dữ liệu biểu đồ cân nặng
  const weightChartData = (weightLogs || []).map((w: any) => ({
    date: format(parseISO(w.recorded_at), 'dd/MM'),
    fullDate: format(parseISO(w.recorded_at), 'dd/MM/yyyy'),
    weight: w.weight_kg,
    bodyFat: w.body_fat_pct,
    muscle: w.muscle_mass_pct,
  }));

  // Dữ liệu biểu đồ sức mạnh cho bài tập được chọn
  const strengthChartData = selectedExercise && strengthData[selectedExercise]
    ? strengthData[selectedExercise].map((p: any) => ({
        date: format(parseISO(p.date), 'dd/MM'),
        fullDate: format(parseISO(p.date), 'dd/MM/yyyy'),
        maxWeight: p.maxWeight,
        reps: p.bestSet.reps,
      }))
    : [];

  // Tính BMI nếu có chiều cao
  const latestWeight = weightLogs?.length > 0 ? weightLogs[weightLogs.length - 1].weight_kg : null;
  const bmi = user?.height_cm && latestWeight
    ? (latestWeight / ((user.height_cm / 100) ** 2)).toFixed(1)
    : null;

  // Tính thay đổi cân nặng
  const weightChange = weightLogs?.length >= 2
    ? (weightLogs[weightLogs.length - 1].weight_kg - weightLogs[0].weight_kg).toFixed(1)
    : null;

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 sticky top-0 bg-gray-50 z-10 pt-2 pb-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{user?.name || 'Học viên'}</h2>
          <p className="text-xs text-gray-500 font-medium">{totalSessions} buổi tập hoàn thành</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white border-0 shadow-sm border-t-2 border-indigo-500">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-black text-gray-800">{totalSessions}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Tổng buổi</div>
          </CardContent>
        </Card>
        {latestWeight && (
          <Card className="bg-white border-0 shadow-sm border-t-2 border-pink-500">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-black text-gray-800">{latestWeight}<span className="text-sm font-semibold text-gray-400">kg</span></div>
              <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Cân nặng</div>
            </CardContent>
          </Card>
        )}
        {bmi && (
          <Card className="bg-white border-0 shadow-sm border-t-2 border-amber-500">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-black text-gray-800">{bmi}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">BMI</div>
            </CardContent>
          </Card>
        )}
        {!latestWeight && !bmi && (
          <>
            <Card className="bg-white border-0 shadow-sm border-t-2 border-pink-500">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-black text-gray-400">--</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Cân nặng</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm border-t-2 border-amber-500">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-black text-gray-400">--</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">BMI</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Weight Change Card */}
      {weightChange && (
        <Card className={`border-0 shadow-sm ${parseFloat(weightChange) <= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {parseFloat(weightChange) <= 0
                ? <TrendingDown className="w-6 h-6 text-emerald-600" />
                : <TrendingUp className="w-6 h-6 text-rose-600" />
              }
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Biến đổi cân nặng</p>
                <p className={`text-xl font-black ${parseFloat(weightChange) <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} kg
                </p>
              </div>
            </div>
            {user?.target_weight && (
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Mục tiêu</p>
                <p className="text-lg font-black text-gray-700 flex items-center gap-1">
                  <Target size={16} className="text-indigo-500" />
                  {user.target_weight}kg
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weight Chart */}
      {weightChartData.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
            <Activity size={16} className="text-pink-500" /> Biểu đồ cân nặng
          </h3>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} domain={['dataMin - 3', 'dataMax + 3']} />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload?.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-gray-900 text-white rounded-lg shadow-xl p-3 text-sm">
                            <p className="font-bold text-lg">{d.weight} kg</p>
                            {d.bodyFat && <p className="text-gray-400 text-xs">Mỡ: {d.bodyFat}%</p>}
                            {d.muscle && <p className="text-gray-400 text-xs">Cơ: {d.muscle}%</p>}
                            <p className="text-gray-500 text-xs mt-1">{d.fullDate}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#EC4899" strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: '#EC4899' }}
                    activeDot={{ r: 6, fill: '#EC4899', stroke: 'white', strokeWidth: 2 }}
                  />
                  {weightChartData.some((d: any) => d.bodyFat) && (
                    <Line type="monotone" dataKey="bodyFat" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5"
                      dot={{ r: 3, fill: '#F59E0B', stroke: 'white', strokeWidth: 1 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strength Progress */}
      {exerciseNames.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
            <Dumbbell size={16} className="text-indigo-500" /> Tiến bộ sức mạnh
          </h3>

          {/* Exercise Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {exerciseNames.map((name: string) => (
              <button
                key={name}
                onClick={() => setSelectedExercise(name)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 ${
                  selectedExercise === name
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Strength Chart */}
          {strengthChartData.length > 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strengthChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload?.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-gray-900 text-white rounded-lg shadow-xl p-3 text-sm">
                              <p className="font-bold text-lg">{d.maxWeight} kg</p>
                              <p className="text-gray-400 text-xs">{d.reps} reps</p>
                              <p className="text-gray-500 text-xs mt-1">{d.fullDate}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="maxWeight" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed text-gray-400 text-sm font-medium">
              Chưa có dữ liệu cho bài tập này
            </div>
          )}
        </div>
      )}

      {/* Personal Records */}
      {Object.keys(personalRecords || {}).length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
            <Award size={16} className="text-amber-500" /> Kỷ lục cá nhân (PR)
          </h3>
          <div className="space-y-2">
            {Object.entries(personalRecords).map(([exercise, pr]: [string, any]) => (
              <Card key={exercise} className="bg-white border-0 shadow-sm overflow-hidden">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Award size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{exercise}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{pr.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600">{pr.maxWeight}<span className="text-xs font-semibold text-gray-400 ml-0.5">kg</span></p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {exerciseNames.length === 0 && weightChartData.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-600">Chưa có dữ liệu phân tích</p>
          <p className="text-sm text-gray-400 mt-1">Dữ liệu sẽ tự động tích lũy sau mỗi buổi tập</p>
        </div>
      )}
    </div>
  );
}
