import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await req.json();
    const { name, description, created_by, logbook } = body;

    if (!name || !logbook || !Array.isArray(logbook)) {
      return NextResponse.json({ error: 'Missing name or logbook data' }, { status: 400 });
    }

    // 1. Create the routine
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .insert([{ name, description, created_by }])
      .select()
      .single();

    if (routineError) throw routineError;

    const routineId = routine.id;

    // 2. Process each exercise in logbook
    for (let i = 0; i < logbook.length; i++) {
      const entry = logbook[i];
      const exerciseName = entry.exercise;
      
      if (!exerciseName) continue;

      // Find or create exercise
      let { data: exercise, error: findError } = await supabase
        .from('exercises')
        .select('id')
        .eq('name', exerciseName)
        .maybeSingle();

      if (findError) throw findError;

      let exerciseId;
      if (!exercise) {
        // Create custom exercise if not found
        const { data: newExercise, error: createError } = await supabase
          .from('exercises')
          .insert([{ 
            name: exerciseName, 
            muscle_group: 'core', // Default to core or something, can be changed by admin later
            description: 'Tự động tạo từ logbook'
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        exerciseId = newExercise.id;
      } else {
        exerciseId = exercise.id;
      }

      // Determine sets and reps for the template
      const setsCount = entry.sets?.length || 3;
      const defaultReps = entry.sets?.[0]?.reps || '12';

      // 3. Insert routine exercise
      const { error: itemError } = await supabase
        .from('routine_exercises')
        .insert([{
          routine_id: routineId,
          exercise_id: exerciseId,
          sets: setsCount,
          reps: defaultReps,
          order_index: i
        }]);

      if (itemError) throw itemError;
    }

    return NextResponse.json({ success: true, routineId });
  } catch (err: any) {
    console.error('Save routine error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
