-- Attendance Logs for QR Check-in
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    check_in_at TIMESTAMPTZ DEFAULT now(),
    type TEXT DEFAULT 'arrival', -- 'arrival', 'departure', etc.
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all logs
CREATE POLICY "Admins can read all attendance logs"
ON public.attendance_logs FOR SELECT
TO authenticated
USING ( (auth.jwt() ->> 'app_role')::text = 'admin' );

-- Admins can insert logs
CREATE POLICY "Admins can insert attendance logs"
ON public.attendance_logs FOR INSERT
TO authenticated
WITH CHECK ( (auth.jwt() ->> 'app_role')::text = 'admin' );

-- Users can view their own logs
CREATE POLICY "Users can view their own attendance logs"
ON public.attendance_logs FOR SELECT
TO authenticated
USING ( auth.uid() = user_id );

-- Grant access
GRANT ALL ON public.attendance_logs TO postgres;
GRANT ALL ON public.attendance_logs TO service_role;
GRANT SELECT, INSERT ON public.attendance_logs TO authenticated;
