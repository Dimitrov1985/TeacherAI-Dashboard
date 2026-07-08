-- ============================================
-- SUPABASE INITIALIZATION SQL
-- Execute this in Supabase SQL Editor
-- https://app.supabase.com/project/lrvwhergfuegklsdvziz/sql/new
-- ============================================

-- 1. CREATE TEACHERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE teachers IS 'Teacher profiles linked to auth.users';

-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- 3. CREATE POLICIES
-- ============================================

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON teachers
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON teachers
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON teachers
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. CREATE TRIGGER FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. CREATE INDEX FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS teachers_email_idx ON teachers(email);

-- ============================================
-- VERIFICATION QUERIES (run after setup)
-- ============================================

-- Check if table was created
-- SELECT * FROM teachers;

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'teachers';

-- Check policies
-- SELECT * FROM pg_policies WHERE tablename = 'teachers';

-- ============================================
-- DONE! Now you can:
-- 1. Add API keys to .env
-- 2. Run: npm run dev
-- 3. Test signup/login
-- ============================================
