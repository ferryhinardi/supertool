-- =====================================================
-- URL Shortener - Supabase Database Setup
-- =====================================================
-- Run this entire script in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Create Tables
-- =====================================================

-- Create the shortened_urls table
CREATE TABLE IF NOT EXISTS shortened_urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code VARCHAR(50) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  custom_alias BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,

  -- Constraint for short_code length
  CONSTRAINT short_code_length CHECK (length(short_code) >= 3 AND length(short_code) <= 50)
);

-- Create the url_analytics table for click tracking
CREATE TABLE IF NOT EXISTS url_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code VARCHAR(50) REFERENCES shortened_urls(short_code) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- User Agent Information
  user_agent TEXT,
  device_type VARCHAR(50), -- mobile, tablet, desktop
  browser VARCHAR(100),
  operating_system VARCHAR(100),

  -- Geographic Information
  ip_address VARCHAR(45), -- supports IPv6
  country VARCHAR(2),
  country_name VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),

  -- Referrer Information
  referrer TEXT,
  referrer_domain VARCHAR(255),

  -- Additional Metadata
  language VARCHAR(10),
  is_bot BOOLEAN DEFAULT false
);

-- =====================================================
-- STEP 2: Create Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_url_analytics_short_code ON url_analytics(short_code);
CREATE INDEX IF NOT EXISTS idx_url_analytics_clicked_at ON url_analytics(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_shortened_urls_short_code ON shortened_urls(short_code);
CREATE INDEX IF NOT EXISTS idx_shortened_urls_created_at ON shortened_urls(created_at DESC);

-- =====================================================
-- STEP 3: Create Triggers
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to shortened_urls table
DROP TRIGGER IF EXISTS update_shortened_urls_updated_at ON shortened_urls;
CREATE TRIGGER update_shortened_urls_updated_at
  BEFORE UPDATE ON shortened_urls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 4: Create Views
-- =====================================================

-- Create a view for URL statistics
CREATE OR REPLACE VIEW url_statistics AS
SELECT
  su.short_code,
  su.original_url,
  su.created_at,
  su.is_active,
  COUNT(ua.id) as total_clicks,
  COUNT(DISTINCT ua.ip_address) as unique_visitors,
  MAX(ua.clicked_at) as last_clicked,
  COUNT(DISTINCT ua.country) as countries_reached,
  COUNT(CASE WHEN ua.device_type = 'mobile' THEN 1 END) as mobile_clicks,
  COUNT(CASE WHEN ua.device_type = 'desktop' THEN 1 END) as desktop_clicks,
  COUNT(CASE WHEN ua.device_type = 'tablet' THEN 1 END) as tablet_clicks
FROM shortened_urls su
LEFT JOIN url_analytics ua ON su.short_code = ua.short_code
GROUP BY su.short_code, su.original_url, su.created_at, su.is_active;

-- =====================================================
-- STEP 5: Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE shortened_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: Create RLS Policies for shortened_urls
-- =====================================================

-- Policy: Anyone can create shortened URLs (for anonymous/demo mode)
DROP POLICY IF EXISTS "Anyone can create shortened URLs" ON shortened_urls;
CREATE POLICY "Anyone can create shortened URLs"
  ON shortened_urls
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own URLs (if authenticated) OR public URLs (created_by is NULL)
DROP POLICY IF EXISTS "Users can view their own URLs" ON shortened_urls;
CREATE POLICY "Users can view their own URLs"
  ON shortened_urls
  FOR SELECT
  USING (auth.uid() = created_by OR created_by IS NULL);

-- Policy: Users can update their own URLs
DROP POLICY IF EXISTS "Users can update their own URLs" ON shortened_urls;
CREATE POLICY "Users can update their own URLs"
  ON shortened_urls
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Policy: Users can delete their own URLs
DROP POLICY IF EXISTS "Users can delete their own URLs" ON shortened_urls;
CREATE POLICY "Users can delete their own URLs"
  ON shortened_urls
  FOR DELETE
  USING (auth.uid() = created_by);

-- =====================================================
-- STEP 7: Create RLS Policies for url_analytics
-- =====================================================

-- Policy: Anyone can read analytics (for public URLs)
DROP POLICY IF EXISTS "Anyone can read analytics" ON url_analytics;
CREATE POLICY "Anyone can read analytics"
  ON url_analytics
  FOR SELECT
  USING (true);

-- Policy: System can insert analytics (anyone can track clicks)
DROP POLICY IF EXISTS "System can insert analytics" ON url_analytics;
CREATE POLICY "System can insert analytics"
  ON url_analytics
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to verify setup:
-- 
-- SELECT * FROM shortened_urls;
-- SELECT * FROM url_analytics;
-- SELECT * FROM url_statistics;
-- =====================================================
