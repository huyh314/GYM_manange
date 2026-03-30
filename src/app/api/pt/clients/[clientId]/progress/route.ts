import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifyToken } from '@/lib/auth';

interface StrengthPoint {
  date: string;
  maxWeight: number;
  bestSet: { reps: number; kg: number };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await context.params;

    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !['admin', 'pt'].includes(payload.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    // Kiểm tra quyền PT
    if (payload.role === 'pt') {
      const { data: check } = await supabase
        .from('user_packages')
        .select('id')
        .eq('client_id', clientId)
        .eq('pt_id', payload.id);
      if (!check || check.length === 0) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // 1. Lấy tất cả sessions đã hoàn thành có logbook
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, checked_in_at, logbook')
      .eq('client_id', clientId)
      .in('status', ['done', 'completed'])
      .not('logbook', 'is', null)
      .order('checked_in_at', { ascending: true });

    // 2. Lấy weight logs
    const { data: weightLogs } = await supabase
      .from('weight_logs')
      .select('id, weight_kg, body_fat_pct, muscle_mass_pct, recorded_at')
      .eq('client_id', clientId)
      .order('recorded_at', { ascending: true });

    // 3. Lấy thông tin user (chiều cao, mục tiêu)
    const { data: user } = await supabase
      .from('users')
      .select('id, name, height_cm, target_weight')
      .eq('id', clientId)
      .single();

    // 4. Trích xuất Strength Data từ logbook
    const exerciseMap = new Map<string, StrengthPoint[]>();

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

        // Tìm set có trọng lượng cao nhất
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

    // Chuyển Map thành object
    const strengthData: Record<string, StrengthPoint[]> = {};
    exerciseMap.forEach((points, exercise) => {
      strengthData[exercise] = points;
    });

    // 5. Tính thống kê tổng quan
    const exerciseNames = Object.keys(strengthData);
    const totalExercises = exerciseNames.length;

    // Tính Personal Records (PR)
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
      totalExercises,
      personalRecords,
      weightLogs: weightLogs || [],
      totalSessions: sessions?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
