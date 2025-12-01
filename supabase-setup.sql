-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create class_lists table
CREATE TABLE IF NOT EXISTS class_lists (
  id BIGSERIAL PRIMARY KEY,
  grade VARCHAR(10) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  className VARCHAR(50),
  schoolName VARCHAR(200),
  teacherName VARCHAR(100),
  academicYear VARCHAR(20),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table  
CREATE TABLE IF NOT EXISTS achievements (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  grade VARCHAR(10) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  source VARCHAR(20) DEFAULT 'custom', -- 'meb' or 'custom'
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
  id BIGSERIAL PRIMARY KEY,
  grade VARCHAR(10) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  scenarioNumber VARCHAR(10) NOT NULL,
  title VARCHAR(200),
  pdfUrl TEXT,
  achievements JSONB DEFAULT '[]'::jsonb, -- Array of achievement codes
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(grade, subject, scenarioNumber)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_class_lists_grade ON class_lists(grade);
CREATE INDEX IF NOT EXISTS idx_class_lists_subject ON class_lists(subject);
CREATE INDEX IF NOT EXISTS idx_achievements_grade_subject ON achievements(grade, subject);
CREATE INDEX IF NOT EXISTS idx_achievements_code ON achievements(code);
CREATE INDEX IF NOT EXISTS idx_scenarios_grade_subject ON scenarios(grade, subject);

-- Enable Row Level Security (RLS)
ALTER TABLE class_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
-- For development, we'll allow all operations. In production, you should restrict these.

-- Class Lists Policies
CREATE POLICY "Enable read access for all users" ON class_lists
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON class_lists
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON class_lists
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON class_lists
  FOR DELETE USING (true);

-- Achievements Policies
CREATE POLICY "Enable read access for all users" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON achievements
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON achievements
  FOR DELETE USING (true);

-- Scenarios Policies
CREATE POLICY "Enable read access for all users" ON scenarios
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON scenarios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON scenarios
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON scenarios
  FOR DELETE USING (true);

-- Insert some sample data for testing
INSERT INTO achievements (code, description, grade, subject, source) VALUES
  ('E5.1.S1', 'Can introduce themselves and others', '5', 'İngilizce', 'meb'),
  ('E5.1.S2', 'Can ask and answer simple questions about personal information', '5', 'İngilizce', 'meb'),
  ('E5.2.S1', 'Can identify and describe family members', '5', 'İngilizce', 'meb'),
  ('M5.1.1', 'Doğal sayıları okur, yazar ve çözümler', '5', 'Matematik', 'meb'),
  ('M5.1.2', 'Doğal sayıları karşılaştırır ve sıralar', '5', 'Matematik', 'meb')
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE class_lists IS 'Stores class information for exam analysis';
COMMENT ON TABLE achievements IS 'Stores learning outcomes/achievements (kazanımlar) from MEB curriculum';
COMMENT ON TABLE scenarios IS 'Stores exam scenarios with associated achievements';
