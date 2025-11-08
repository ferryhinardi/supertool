-- =====================================================
-- Tool Ratings System - Supabase Database Setup
-- =====================================================
-- Purpose: Enable user ratings for tools with aggregate statistics
-- for SEO (Rich Snippets with star ratings in Google search)

-- =====================================================
-- STEP 1: Create Tables
-- =====================================================

-- Create the tool_ratings table
CREATE TABLE IF NOT EXISTS tool_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id TEXT NOT NULL, -- Tool identifier (e.g., '/tools/json-beautify')
  
  -- Rating information
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Optional user identification (for preventing duplicate votes)
  user_fingerprint TEXT, -- Browser fingerprint or session ID
  user_ip TEXT, -- IP address (hashed for privacy)
  
  -- Optional feedback
  comment TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the tool_rating_stats table for aggregated data
CREATE TABLE IF NOT EXISTS tool_rating_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id TEXT NOT NULL UNIQUE, -- Tool identifier
  
  -- Aggregate statistics
  total_ratings INTEGER DEFAULT 0,
  average_rating NUMERIC(3, 2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  
  -- Rating distribution
  rating_1_count INTEGER DEFAULT 0,
  rating_2_count INTEGER DEFAULT 0,
  rating_3_count INTEGER DEFAULT 0,
  rating_4_count INTEGER DEFAULT 0,
  rating_5_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Create Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tool_ratings_tool_id ON tool_ratings(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_ratings_user_fingerprint ON tool_ratings(user_fingerprint);
CREATE INDEX IF NOT EXISTS idx_tool_ratings_created_at ON tool_ratings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_rating_stats_tool_id ON tool_rating_stats(tool_id);

-- =====================================================
-- STEP 3: Create Triggers
-- =====================================================

-- Apply updated_at trigger to tool_ratings
DROP TRIGGER IF EXISTS update_tool_ratings_updated_at ON tool_ratings;
CREATE TRIGGER update_tool_ratings_updated_at
  BEFORE UPDATE ON tool_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to tool_rating_stats
DROP TRIGGER IF EXISTS update_tool_rating_stats_updated_at ON tool_rating_stats;
CREATE TRIGGER update_tool_rating_stats_updated_at
  BEFORE UPDATE ON tool_rating_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 4: Create Functions
-- =====================================================

-- Function to update rating statistics when a new rating is added
CREATE OR REPLACE FUNCTION update_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the stats record
  INSERT INTO tool_rating_stats (
    tool_id,
    total_ratings,
    average_rating,
    rating_1_count,
    rating_2_count,
    rating_3_count,
    rating_4_count,
    rating_5_count
  )
  VALUES (
    NEW.tool_id,
    1,
    NEW.rating,
    CASE WHEN NEW.rating = 1 THEN 1 ELSE 0 END,
    CASE WHEN NEW.rating = 2 THEN 1 ELSE 0 END,
    CASE WHEN NEW.rating = 3 THEN 1 ELSE 0 END,
    CASE WHEN NEW.rating = 4 THEN 1 ELSE 0 END,
    CASE WHEN NEW.rating = 5 THEN 1 ELSE 0 END
  )
  ON CONFLICT (tool_id) DO UPDATE SET
    total_ratings = tool_rating_stats.total_ratings + 1,
    rating_1_count = tool_rating_stats.rating_1_count + CASE WHEN NEW.rating = 1 THEN 1 ELSE 0 END,
    rating_2_count = tool_rating_stats.rating_2_count + CASE WHEN NEW.rating = 2 THEN 1 ELSE 0 END,
    rating_3_count = tool_rating_stats.rating_3_count + CASE WHEN NEW.rating = 3 THEN 1 ELSE 0 END,
    rating_4_count = tool_rating_stats.rating_4_count + CASE WHEN NEW.rating = 4 THEN 1 ELSE 0 END,
    rating_5_count = tool_rating_stats.rating_5_count + CASE WHEN NEW.rating = 5 THEN 1 ELSE 0 END,
    average_rating = (
      (tool_rating_stats.rating_1_count + CASE WHEN NEW.rating = 1 THEN 1 ELSE 0 END) * 1 +
      (tool_rating_stats.rating_2_count + CASE WHEN NEW.rating = 2 THEN 1 ELSE 0 END) * 2 +
      (tool_rating_stats.rating_3_count + CASE WHEN NEW.rating = 3 THEN 1 ELSE 0 END) * 3 +
      (tool_rating_stats.rating_4_count + CASE WHEN NEW.rating = 4 THEN 1 ELSE 0 END) * 4 +
      (tool_rating_stats.rating_5_count + CASE WHEN NEW.rating = 5 THEN 1 ELSE 0 END) * 5
    )::NUMERIC / (tool_rating_stats.total_ratings + 1);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tool_ratings table
DROP TRIGGER IF EXISTS trigger_update_rating_stats ON tool_ratings;
CREATE TRIGGER trigger_update_rating_stats
  AFTER INSERT ON tool_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_stats();

-- =====================================================
-- STEP 5: Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE tool_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_rating_stats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: Create RLS Policies
-- =====================================================

-- Policy: Anyone can view ratings
DROP POLICY IF EXISTS "Anyone can view ratings" ON tool_ratings;
CREATE POLICY "Anyone can view ratings"
  ON tool_ratings
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert ratings (for demo mode)
DROP POLICY IF EXISTS "Anyone can insert ratings" ON tool_ratings;
CREATE POLICY "Anyone can insert ratings"
  ON tool_ratings
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can view rating stats
DROP POLICY IF EXISTS "Anyone can view rating stats" ON tool_rating_stats;
CREATE POLICY "Anyone can view rating stats"
  ON tool_rating_stats
  FOR SELECT
  USING (true);

-- Policy: System can update rating stats (via triggers)
DROP POLICY IF EXISTS "System can update rating stats" ON tool_rating_stats;
CREATE POLICY "System can update rating stats"
  ON tool_rating_stats
  FOR ALL
  USING (true)
  WITH CHECK (true);
