-- Week 4 Phase 2 schema modifications

-- Create RLS Policy for PTs to only see assigned clients
DROP POLICY IF EXISTS "PT sees assigned clients" ON users;
CREATE POLICY "PT sees assigned clients" ON users
  FOR SELECT USING (
    role = 'client' AND EXISTS (
      SELECT 1 FROM user_packages
      WHERE client_id = users.id
        AND pt_id = auth.uid()
        AND status = 'active'
    )
  );

-- To apply this policy, enable RLS on users if not already enabled:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
