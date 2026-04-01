'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, UserCog, User, ShieldCheck, QrCode, Phone, FileText, Activity, Save, Ruler, Target } from 'lucide-react';
import { format } from 'date-fns';
import { WeightChart } from './WeightChart';
import { DigitalMemberCard, MembershipTier } from '@/components/DigitalMemberCard';
import { WebAuthnRegister } from '@/components/WebAuthnRegister';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const fetchProfileData = async () => {
  const meRes = await fetch('/api/auth/me');
  if (!meRes.ok) throw new Error("Unauthorized");
  
  const me = await meRes.json();
  const userId = me.id;

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, name, phone, notes, avatar_url, height_cm, target_weight, role, tier')
    .eq('id', userId)
    .single();
    
  if (profileError) throw profileError;

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const { data: weightLogs, error: weightsError } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('client_id', userId)
    .gte('recorded_at', ninetyDaysAgo.toISOString().split('T')[0])
    .order('recorded_at', { ascending: false });

  if (weightsError) throw weightsError;

  return { profile: userProfile, weights: weightLogs || [] };
};

export default function ClientProfilePage() {
  const router = useRouter();
  const { data, isLoading: loading, mutate } = useSWR('client-profile', fetchProfileData, {
    onError: () => router.push('/login'),
    revalidateOnFocus: true
  });

  const profile = data?.profile;
  const weights = data?.weights || [];
  
  // Form state
  const [newWeight, setNewWeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');
  const [newMuscleMass, setNewMuscleMass] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);


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
        mutate({ 
          profile, 
          weights: [data, ...weights].sort((a,b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()) 
        }, false);
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
    if (bmiVal < 18.5) return { label: 'Thiếu cân', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
    if (bmiVal < 25) return { label: 'Bình thường', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (bmiVal < 30) return { label: 'Thừa cân', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Béo phì', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-10">
        <div className="animate-pulse space-y-4 w-full px-4">
          <div className="h-24 bg-[#2a2b2e] rounded-xl w-full"></div>
          <div className="h-64 bg-[#2a2b2e] rounded-xl w-full"></div>
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
            tier={profile.tier || 'normal'}
          />
        )}
      </div>

      {/* Header Profile Info */}
      <div className="bg-[#1e1e1e] rounded-3xl p-6 shadow-sm border border-[#2a2b2e] flex items-center space-x-5 mt-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8c7442] flex items-center justify-center shadow-inner relative overflow-hidden shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-black text-zinc-900">{profile?.name?.charAt(0) || 'U'}</span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-black text-zinc-100 leading-tight">{profile?.name}</h1>
          <div className="flex items-center text-sm text-zinc-500 mt-1 space-x-1">
            <Phone size={14} />
            <span>{profile?.phone}</span>
          </div>
        </div>
      </div>

      {/* BMI & Body Stats */}
      {(bmi || profile?.target_weight) && (
        <div className="grid grid-cols-2 gap-3">
          {bmi && (
            <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2b2e] p-4 text-center">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Chỉ số BMI</p>
              <p className="text-3xl font-black text-zinc-100">{bmi}</p>
              <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBmiLabel(parseFloat(bmi)).color}`}>
                {getBmiLabel(parseFloat(bmi)).label}
              </span>
            </div>
          )}
          {profile?.target_weight && (
            <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2b2e] p-4 text-center">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Mục tiêu</p>
              <p className="text-3xl font-black text-[#d4af37] flex items-center justify-center gap-1">
                <Target size={20} className="text-[#d4af37]/60" />
                {profile.target_weight}
              </p>
              <span className="text-[10px] font-bold text-zinc-500 uppercase">kg</span>
            </div>
          )}
        </div>
      )}

      {/* PT Notes */}
      {profile?.notes && (
        <div className="bg-[#d4af37]/5 rounded-2xl border border-[#d4af37]/20 p-4">
          <div className="flex items-center space-x-2 text-sm text-[#d4af37] border-b border-[#d4af37]/10 pb-2 mb-3">
            <FileText size={16} className="text-[#d4af37]/70" />
            <span className="uppercase tracking-wider font-bold text-xs">Ghi chú của HLV</span>
          </div>
          <p className="text-zinc-300 text-sm italic font-medium">"{profile.notes}"</p>
        </div>
      )}

      {/* WebAuthn Settings */}
      <WebAuthnRegister />

      {/* Weight Tracking */}
      <div>
        <div className="flex items-center space-x-2 mb-3 px-1">
          <Activity size={18} className="text-[#d4af37]" />
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Theo dõi chỉ số cơ thể</h2>
        </div>
        
        <WeightChart data={weights} />

        {/* Latest Body Composition */}
        {weights.length > 0 && (weights[0].body_fat_pct || weights[0].muscle_mass_pct) && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {weights[0].body_fat_pct && (
              <div className="bg-amber-500/10 rounded-2xl border border-amber-500/20 p-3 text-center">
                <p className="text-[10px] font-bold text-amber-400 uppercase">Tỉ lệ mỡ</p>
                <p className="text-2xl font-black text-amber-300">{weights[0].body_fat_pct}<span className="text-sm">%</span></p>
              </div>
            )}
            {weights[0].muscle_mass_pct && (
              <div className="bg-sky-500/10 rounded-2xl border border-sky-500/20 p-3 text-center">
                <p className="text-[10px] font-bold text-sky-400 uppercase">Tỉ lệ cơ</p>
                <p className="text-2xl font-black text-sky-300">{weights[0].muscle_mass_pct}<span className="text-sm">%</span></p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 bg-[#1e1e1e] rounded-2xl border border-dashed border-[#2a2b2e] hover:border-[#d4af37]/30 transition-colors p-4">
          <form onSubmit={handleAddWeight} className="space-y-3">
            <div className="flex space-x-2 items-end">
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="weight" className="text-xs text-zinc-500 font-bold">Cân nặng (kg) *</Label>
                <Input 
                  id="weight"
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  placeholder="VD: 65.5"
                  required
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  className="bg-[#121212] border-[#2a2b2e] text-zinc-100 placeholder:text-zinc-600 focus:border-[#d4af37]"
                />
              </div>
              <div className="space-y-1.5 w-28 shrink-0">
                <Label htmlFor="date" className="text-xs text-zinc-500 font-bold">Ngày</Label>
                <Input 
                  id="date"
                  type="date"
                  required
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="bg-[#121212] border-[#2a2b2e] text-zinc-100 focus:border-[#d4af37]"
                />
              </div>
            </div>
            <div className="flex space-x-2 items-end">
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="bodyFat" className="text-xs text-zinc-500 font-bold">% Mỡ</Label>
                <Input 
                  id="bodyFat"
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  placeholder="VD: 18.5"
                  value={newBodyFat}
                  onChange={e => setNewBodyFat(e.target.value)}
                  className="bg-[#121212] border-[#2a2b2e] text-zinc-100 placeholder:text-zinc-600 focus:border-[#d4af37]"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="muscleMass" className="text-xs text-zinc-500 font-bold">% Cơ</Label>
                <Input 
                  id="muscleMass"
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  placeholder="VD: 35.2"
                  value={newMuscleMass}
                  onChange={e => setNewMuscleMass(e.target.value)}
                  className="bg-[#121212] border-[#2a2b2e] text-zinc-100 placeholder:text-zinc-600 focus:border-[#d4af37]"
                />
              </div>
              <Button type="submit" size="icon" disabled={isSubmitting || !newWeight} className="shrink-0 mb-0.5 bg-[#d4af37] hover:bg-[#e5c56c] text-zinc-900">
                <Save size={18} />
              </Button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
