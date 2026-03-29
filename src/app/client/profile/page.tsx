'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, FileText, Activity, Save } from 'lucide-react';
import { WeightChart } from './WeightChart';

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [weights, setWeights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) {
        router.push('/login');
        return;
      }

      // Fetch Profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('id, name, phone, notes, avatar_url')
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
      const { data, error } = await supabase
        .from('weight_logs')
        .insert([{
          client_id: profile.id,
          weight_kg: parseFloat(newWeight),
          recorded_at: newDate,
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setWeights(prev => [data, ...prev].sort((a,b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()));
        setNewWeight('');
        alert('Đã cập nhật cân nặng thành công!');
      }
    } catch (err: any) {
      alert('Lỗi khi cập nhật cân nặng: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
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
      
      {/* Header Profile Info */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border flex items-center space-x-5">
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
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Theo dõi cân nặng</h2>
        </div>
        
        <WeightChart data={weights} />

        <Card className="mt-4 border-dashed shadow-none bg-gray-50 hover:bg-white transition-colors">
          <CardContent className="pt-4">
            <form onSubmit={handleAddWeight} className="flex space-x-2 items-end">
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="weight" className="text-xs text-gray-500 font-bold">Cân nặng (kg)</Label>
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
              <div className="space-y-1.5 w-32 shrink-0">
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
              <Button type="submit" size="icon" disabled={isSubmitting || !newWeight} className="shrink-0 mb-0.5 bg-green-500 hover:bg-green-600 text-white">
                <Save size={18} />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
