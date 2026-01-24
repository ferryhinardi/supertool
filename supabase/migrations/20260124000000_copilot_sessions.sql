-- =====================================================
-- Copilot Sessions System - Supabase Database Setup
-- =====================================================
-- Purpose: Persist GitHub Copilot chat sessions to fix
-- "Session not found" errors in serverless environment

-- =====================================================
-- STEP 1: Create Tables
-- =====================================================

-- Create the copilot_sessions table
CREATE TABLE IF NOT EXISTS copilot_sessions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'New Session',
  
  -- Session data stored as JSONB
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps (stored as TIMESTAMPTZ, converted from/to JS milliseconds)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- Nullable, for TTL-based expiration
);

-- =====================================================
-- STEP 2: Create Indexes
-- =====================================================

-- Index for primary key lookups (automatic with PRIMARY KEY)
-- Index for expiration-based cleanup queries
CREATE INDEX IF NOT EXISTS idx_copilot_sessions_expires_at 
  ON copilot_sessions(expires_at) 
  WHERE expires_at IS NOT NULL;

-- Index for listing sessions sorted by updated_at
CREATE INDEX IF NOT EXISTS idx_copilot_sessions_updated_at 
  ON copilot_sessions(updated_at DESC);

-- =====================================================
-- STEP 3: Create Triggers
-- =====================================================

-- Apply updated_at trigger to copilot_sessions
DROP TRIGGER IF EXISTS update_copilot_sessions_updated_at ON copilot_sessions;
CREATE TRIGGER update_copilot_sessions_updated_at
  BEFORE UPDATE ON copilot_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 4: Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE copilot_sessions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Create RLS Policies
-- =====================================================

-- Policy: Anyone can view sessions (for demo mode)
DROP POLICY IF EXISTS "Anyone can view copilot sessions" ON copilot_sessions;
CREATE POLICY "Anyone can view copilot sessions"
  ON copilot_sessions
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert sessions (for demo mode)
DROP POLICY IF EXISTS "Anyone can insert copilot sessions" ON copilot_sessions;
CREATE POLICY "Anyone can insert copilot sessions"
  ON copilot_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update sessions (for demo mode)
DROP POLICY IF EXISTS "Anyone can update copilot sessions" ON copilot_sessions;
CREATE POLICY "Anyone can update copilot sessions"
  ON copilot_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Anyone can delete sessions (for demo mode)
DROP POLICY IF EXISTS "Anyone can delete copilot sessions" ON copilot_sessions;
CREATE POLICY "Anyone can delete copilot sessions"
  ON copilot_sessions
  FOR DELETE
  USING (true);

-- =====================================================
-- STEP 6: Create Cleanup Function
-- =====================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_copilot_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM copilot_sessions
  WHERE expires_at IS NOT NULL AND expires_at <= NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 7: Add Comments for Documentation
-- =====================================================

COMMENT ON TABLE copilot_sessions IS 'Stores GitHub Copilot chat sessions with messages and context';
COMMENT ON COLUMN copilot_sessions.id IS 'UUID session identifier';
COMMENT ON COLUMN copilot_sessions.name IS 'User-friendly session name';
COMMENT ON COLUMN copilot_sessions.messages IS 'Array of CopilotMessage objects as JSONB';
COMMENT ON COLUMN copilot_sessions.context IS 'CopilotContext object as JSONB (files, PR info, etc.)';
COMMENT ON COLUMN copilot_sessions.created_at IS 'Session creation timestamp';
COMMENT ON COLUMN copilot_sessions.updated_at IS 'Last update timestamp (auto-updated by trigger)';
COMMENT ON COLUMN copilot_sessions.expires_at IS 'Optional expiration timestamp for TTL-based cleanup';
