'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, FileText, Activity, Save, Ruler, Target } from 'lucide-react';
import { WeightChart } from './WeightChart';
import { DigitalMemberCard } from '@/components/DigitalMemberCard';
import { toast } from 'sonner';

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [weights, setWeights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newWeight, setNewWeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');
  const [newMuscleMass, setNewMuscleMass] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      // Use our custom auth endpoint instead of Supabase auth
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const me = await meRes.json();
      const userId = me.id;

      // Fetch Profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('id, name, phone, notes, avatar_url, height_cm, target_weight, role')
        .eq('id', userId)
        .single();
        
      if (userProfile) setProfile(userProfile);

      // Fetch Weights (last 3 months approx ~ 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { data: weightLogs } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('client_id', userId)
        .gte('recorded_at', ninetyDaysAgo.toISOString().split('T')[0])
        .order('recorded_at', { ascending: false });

      if (weightLogs) setWeights(weightLogs);
      
      setLoading(false);
    }
    loadData();
  }, [router]);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !newWeight) return;

    setIsSubmitting(true);
    try {
      const insertData: any = {
        client_id: profile.id,
        weight_kg: parseFloat(newWeight),
        recorded_at: newDate,
      };
      if (newBodyFat) insertData.body_fat_pct = parseFloat(newBodyFat);
      if (newMuscleMass) insertData.muscle_mass_pct = parseFloat(newMuscleMass);

      const { data, error } = await supabase
        .from('weight_logs')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setWeights(prev => [data, ...prev].sort((a,b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()));
        setNewWeight('');
        setNewBodyFat('');
        setNewMuscleMass('');
        toast.success('Đã cập nhật chỉ số thành công!');
      }
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính BMI
  const latestWeight = weights?.length > 0 ? weights[0].weight_kg : null;
  const bmi = profile?.height_cm && latestWeight
    ? (latestWeight / ((profile.height_cm / 100) ** 2)).toFixed(1)
    : null;

  const getBmiLabel = (bmiVal: number) => {
    if (bmiVal < 18.5) return { label: 'Thiếu cân', color: 'text-blue-600 bg-blue-50' };
    if (bmiVal < 25) return { label: 'Bình thường', color: 'text-emerald-600 bg-emerald-50' };
    if (bmiVal < 30) return { label: 'Thừa cân', color: 'text-amber-600 bg-amber-50' };
    return { label: 'Béo phì', color: 'text-red-600 bg-red-50' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-10">
        <div className="animate-pulse space-y-4 w-full px-4">
          <div className="h-24 bg-gray-200 rounded-xl w-full"></div>
          <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Check-in QR Code - Digital Member Card */}
      <div className="flex justify-center -mb-2 overflow-visible">
        {profile?.id && (
          <DigitalMemberCard 
            user={{
              id: profile.id,
              name: profile.name,
              phone: profile.phone,
              role: profile.role || 'client'
            }} 
            tier="normal" // This could be dynamic based on a 'member_tier' column
          />
        )}
      </div>

      {/* Header Profile Info */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border flex items-center space-x-5 mt-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner relative overflow-hidden shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-black text-white">{profile?.name?.charAt(0) || 'U'}</span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900 leading-tight">{profile?.name}</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1 space-x-1">
            <Phone size={14} />
            <span>{profile?.phone}</span>
          </div>
        </div>
      </div>

      {/* BMI & Body Stats */}
      {(bmi || profile?.target_weight) && (
        <div className="grid grid-cols-2 gap-3">
          {bmi && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chỉ số BMI</p>
                <p className="text-3xl font-black text-gray-800">{bmi}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${getBmiLabel(parseFloat(bmi)).color}`}>
                  {getBmiLabel(parseFloat(bmi)).label}
                </span>
              </CardContent>
            </Card>
          )}
          {profile?.target_weight && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mục tiêu</p>
                <p className="text-3xl font-black text-indigo-600 flex items-center justify-center gap-1">
                  <Target size={20} className="text-indigo-400" />
                  {profile.target_weight}
                </p>
                <span className="text-[10px] font-bold text-gray-400 uppercase">kg</span>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* PT Notes */}
      {profile?.notes && (
        <Card className="border-indigo-100 bg-indigo-50/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2 text-indigo-900 border-b border-indigo-100/50 pb-2">
              <FileText size={16} className="text-indigo-500" />
              <span className="uppercase tracking-wider font-bold">Ghi chú của HLV</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm italic font-medium">"{profile.notes}"</p>
          </CardContent>
        </Card>
      )}

      {/* Weight Tracking */}
      <div>
        <div className="flex items-center space-x-2 mb-3 px-1">
          <Activity size={18} className="text-pink-500" />
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Theo dõi chỉ số cơ thể</h2>
        </div>
        
        <WeightChart data={weights} />

        {/* Latest Body Composition */}
        {weights.length > 0 && (weights[0].body_fat_pct || weights[0].muscle_mass_pct) && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {weights[0].body_fat_pct && (
              <Card className="bg-amber-50 border-amber-100 shadow-none">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] font-bold text-amber-600 uppercase">Tỉ lệ mỡ</p>
                  <p className="text-2xl font-black text-amber-700">{weights[0].body_fat_pct}<span className="text-sm">%</span></p>
                </CardContent>
              </Card>
            )}
            {weights[0].muscle_mass_pct && (
              <Card className="bg-blue-50 border-blue-100 shadow-none">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Tỉ lệ cơ</p>
                  <p className="text-2xl font-black text-blue-700">{weights[0].muscle_mass_pct}<span className="text-sm">%</span></p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card className="mt-4 border-dashed shadow-none bg-gray-50 hover:bg-white transition-colors">
          <CardContent className="pt-4">
            <form onSubmit={handleAddWeight} className="space-y-3">
              <div className="flex space-x-2 items-end">
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="weight" className="text-xs text-gray-500 font-bold">Cân nặng (kg) *</Label>
                  <Input 
                    id="weight"
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="VD: 65.5"
                    required
                    value={newWeight}
                    onChange={e => setNewWeight(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5 w-28 shrink-0">
                  <Label htmlFor="date" className="text-xs text-gray-500 font-bold">Ngày</Label>
                  <Input 
                    id="date"
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="flex space-x-2 items-end">
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="bodyFat" className="text-xs text-gray-500 font-bold">% Mỡ</Label>
                  <Input 
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="VD: 18.5"
                    value={newBodyFat}
                    onChange={e => setNewBodyFat(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="muscleMass" className="text-xs text-gray-500 font-bold">% Cơ</Label>
                  <Input 
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="VD: 35.2"
                    value={newMuscleMass}
                    onChange={e => setNewMuscleMass(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <Button type="submit" size="icon" disabled={isSubmitting || !newWeight} className="shrink-0 mb-0.5 bg-green-500 hover:bg-green-600 text-white">
                  <Save size={18} />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
