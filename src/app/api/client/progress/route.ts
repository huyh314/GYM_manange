import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = payload.id;
    const supabase = createSupabaseAdminClient();

    // 1. Sessions đã hoàn thành có logbook
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, checked_in_at, logbook')
      .eq('client_id', clientId)
      .in('status', ['done', 'completed'])
      .not('logbook', 'is', null)
      .order('checked_in_at', { ascending: true });

    // 2. Weight logs
    const { data: weightLogs } = await supabase
      .from('weight_logs')
      .select('id, weight_kg, body_fat_pct, muscle_mass_pct, recorded_at')
      .eq('client_id', clientId)
      .order('recorded_at', { ascending: true });

    // 3. User info
    const { data: user } = await supabase
      .from('users')
      .select('id, name, height_cm, target_weight')
      .eq('id', clientId)
      .single();

    // 4. Trích xuất Strength Data
    const exerciseMap = new Map<string, any[]>();

    for (const session of (sessions || [])) {
      const logbook = session.logbook;
      if (!Array.isArray(logbook)) continue;

      const sessionDate = session.checked_in_at?.split('T')[0] || '';

      for (const entry of logbook) {
        const exerciseName = entry.exercise?.trim();
        if (!exerciseName) continue;

        if (!exerciseMap.has(exerciseName)) {
          exerciseMap.set(exerciseName, []);
        }

        let maxKg = 0;
        let bestSet = { reps: 0, kg: 0 };
        const sets = Array.isArray(entry.sets) ? entry.sets : [];
        for (const set of sets) {
          const kg = parseFloat(set.kg) || 0;
          const reps = parseInt(set.reps) || 0;
          if (kg > maxKg) {
            maxKg = kg;
            bestSet = { reps, kg };
          }
        }

        if (maxKg > 0) {
          exerciseMap.get(exerciseName)!.push({
            date: sessionDate,
            maxWeight: maxKg,
            bestSet,
          });
        }
      }
    }

    const strengthData: Record<string, any[]> = {};
    exerciseMap.forEach((points, exercise) => {
      strengthData[exercise] = points;
    });

    const exerciseNames = Object.keys(strengthData);

    // Personal Records
    const personalRecords: Record<string, { maxWeight: number; date: string }> = {};
    for (const [exercise, points] of Object.entries(strengthData)) {
      let maxPoint = points[0];
      for (const p of points) {
        if (p.maxWeight > maxPoint.maxWeight) maxPoint = p;
      }
      personalRecords[exercise] = { maxWeight: maxPoint.maxWeight, date: maxPoint.date };
    }

    return NextResponse.json({
      user,
      strengthData,
      exerciseNames,
      personalRecords,
      weightLogs: weightLogs || [],
      totalSessions: sessions?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
