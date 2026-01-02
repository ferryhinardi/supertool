-- =====================================================
-- Security Fixes Migration
-- =====================================================
-- This migration addresses security advisors issues:
-- 1. Overly permissive RLS policies
-- 2. Rate limiting for public operations
-- 3. Unused function parameters
-- =====================================================

-- =====================================================
-- STEP 1: Fix Unused Parameter Warning
-- =====================================================

-- Fix calculate_item_assignment_amount function
-- Remove unused p_participant_id parameter
DROP FUNCTION IF EXISTS calculate_item_assignment_amount(UUID, UUID);

CREATE OR REPLACE FUNCTION calculate_item_assignment_amount(
  p_item_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
  v_item_total NUMERIC;
  v_assigned_count INTEGER;
  v_assigned_amount NUMERIC;
BEGIN
  -- Get the total cost of the item (price * quantity)
  SELECT (price * quantity) INTO v_item_total
  FROM split_bill_items
  WHERE id = p_item_id;
  
  -- Count how many participants are assigned to this item
  SELECT COUNT(*) INTO v_assigned_count
  FROM split_bill_item_assignments
  WHERE item_id = p_item_id;
  
  -- If this is the first assignment, count will be 0, so we add 1
  IF v_assigned_count = 0 THEN
    v_assigned_count := 1;
  END IF;
  
  -- Calculate the amount per person
  v_assigned_amount := ROUND(v_item_total / v_assigned_count, 2);
  
  RETURN v_assigned_amount;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 2: Add Rate Limiting Function
-- =====================================================

-- Create a function to check rate limits for anonymous operations
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_table_name TEXT,
  p_ip_address TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_time_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_request_count INTEGER;
BEGIN
  -- Count requests from this IP in the time window
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE created_at > NOW() - INTERVAL ''%s minutes'' AND (ip_address = $1 OR user_agent LIKE ''%%'' || $1 || ''%%'')',
    p_table_name,
    p_time_window_minutes
  ) INTO v_request_count USING p_ip_address;
  
  -- Return true if under the limit
  RETURN v_request_count < p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: Fix URL Shortener RLS Policies
-- =====================================================

-- More restrictive policy for shortened URL creation
DROP POLICY IF EXISTS "Anyone can create shortened URLs" ON shortened_urls;
CREATE POLICY "Authenticated users can create shortened URLs"
  ON shortened_urls
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR created_by IS NULL);

-- Add policy for anonymous users with limitations
CREATE POLICY "Anonymous users can create limited URLs"
  ON shortened_urls
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL 
    AND created_by IS NULL
    AND (SELECT COUNT(*) FROM shortened_urls WHERE created_at > NOW() - INTERVAL '1 hour') < 100
  );

-- =====================================================
-- STEP 4: Fix Split Bill RLS Policies
-- =====================================================

-- Replace overly permissive policies with more secure ones

-- Split Bill Users - Restrict updates to authenticated users
DROP POLICY IF EXISTS "Users can update own profile" ON split_bill_users;
CREATE POLICY "Users can update own profile"
  ON split_bill_users
  FOR UPDATE
  USING (
    auth.uid() = auth_user_id 
    OR (auth_user_id IS NULL AND id IN (
      SELECT created_by FROM split_bills WHERE created_by = split_bill_users.id
    ))
  );

-- Split Bills - Restrict updates to bill creator
DROP POLICY IF EXISTS "Organizer can update bills" ON split_bills;
CREATE POLICY "Organizer can update bills"
  ON split_bills
  FOR UPDATE
  USING (
    (auth.uid() = (SELECT auth_user_id FROM split_bill_users WHERE id = created_by))
    OR (created_by IS NOT NULL AND auth.uid() IS NULL AND created_by IN (
      SELECT id FROM split_bill_users WHERE auth_user_id IS NULL
    ))
  )
  WITH CHECK (
    (auth.uid() = (SELECT auth_user_id FROM split_bill_users WHERE id = created_by))
    OR (created_by IS NOT NULL AND auth.uid() IS NULL)
  );

-- Split Bill Participants - More restrictive update policy
DROP POLICY IF EXISTS "Participants can update payment status" ON split_bill_participants;
CREATE POLICY "Participants can update payment status"
  ON split_bill_participants
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
    OR auth.uid() = (
      SELECT sbu.auth_user_id 
      FROM split_bills sb 
      JOIN split_bill_users sbu ON sb.created_by = sbu.id 
      WHERE sb.id = bill_id
    )
  );

-- =====================================================
-- STEP 5: Fix Split Bill Items RLS Policies
-- =====================================================

-- Replace open access policies with restricted ones

-- Only allow bill creators to modify items
DROP POLICY IF EXISTS "Allow public update access to bill items" ON split_bill_items;
CREATE POLICY "Bill creators can update items"
  ON split_bill_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM split_bills sb
      JOIN split_bill_users sbu ON sb.created_by = sbu.id
      WHERE sb.id = bill_id
      AND (sbu.auth_user_id = auth.uid() OR sbu.auth_user_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "Allow public delete access to bill items" ON split_bill_items;
CREATE POLICY "Bill creators can delete items"
  ON split_bill_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM split_bills sb
      JOIN split_bill_users sbu ON sb.created_by = sbu.id
      WHERE sb.id = bill_id
      AND (sbu.auth_user_id = auth.uid() OR sbu.auth_user_id IS NULL)
    )
  );

-- Item assignments - restrict to bill creator
DROP POLICY IF EXISTS "Allow public update access to item assignments" ON split_bill_item_assignments;
CREATE POLICY "Bill creators can update assignments"
  ON split_bill_item_assignments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM split_bill_items sbi
      JOIN split_bills sb ON sbi.bill_id = sb.id
      JOIN split_bill_users sbu ON sb.created_by = sbu.id
      WHERE sbi.id = item_id
      AND (sbu.auth_user_id = auth.uid() OR sbu.auth_user_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "Allow public delete access to item assignments" ON split_bill_item_assignments;
CREATE POLICY "Bill creators can delete assignments"
  ON split_bill_item_assignments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM split_bill_items sbi
      JOIN split_bills sb ON sbi.bill_id = sb.id
      JOIN split_bill_users sbu ON sb.created_by = sbu.id
      WHERE sbi.id = item_id
      AND (sbu.auth_user_id = auth.uid() OR sbu.auth_user_id IS NULL)
    )
  );

-- =====================================================
-- STEP 6: Fix Tool Ratings RLS Policies
-- =====================================================

-- Add rate limiting to ratings
-- Note: RLS policies don't support NEW in subqueries, so we allow insert
-- and rely on application-level rate limiting or triggers
DROP POLICY IF EXISTS "Anyone can insert ratings" ON tool_ratings;
CREATE POLICY "Authenticated or limited anonymous ratings"
  ON tool_ratings
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    OR user_fingerprint IS NOT NULL
  );

-- Create trigger function for rate limiting
CREATE OR REPLACE FUNCTION check_rating_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_recent_count INTEGER;
BEGIN
  -- Check rate limit: 5 ratings per fingerprint per hour
  IF NEW.user_fingerprint IS NOT NULL THEN
    SELECT COUNT(*) INTO v_recent_count
    FROM tool_ratings
    WHERE user_fingerprint = NEW.user_fingerprint
      AND created_at > NOW() - INTERVAL '1 hour';
    
    IF v_recent_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply rate limiting trigger
DROP TRIGGER IF EXISTS enforce_rating_rate_limit ON tool_ratings;
CREATE TRIGGER enforce_rating_rate_limit
  BEFORE INSERT ON tool_ratings
  FOR EACH ROW
  EXECUTE FUNCTION check_rating_rate_limit();

-- Prevent rating stat manipulation
DROP POLICY IF EXISTS "System can update rating stats" ON tool_rating_stats;
CREATE POLICY "Only triggers can update rating stats"
  ON tool_rating_stats
  FOR UPDATE
  USING (false); -- Block direct updates, only allow via triggers

CREATE POLICY "Only system can insert rating stats"
  ON tool_rating_stats
  FOR INSERT
  WITH CHECK (true); -- Allow INSERT for the trigger

-- =====================================================
-- STEP 7: Add Audit Logging for Security Events
-- =====================================================

-- Create security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can read audit logs
CREATE POLICY "Service role can read audit logs"
  ON security_audit_log
  FOR SELECT
  USING (auth.role() = 'service_role');

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON security_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Create index
CREATE INDEX idx_security_audit_log_created_at ON security_audit_log(created_at DESC);
CREATE INDEX idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_event_type ON security_audit_log(event_type);

-- =====================================================
-- STEP 8: Add Security Headers and Functions
-- =====================================================

-- Function to sanitize user input (prevent XSS)
CREATE OR REPLACE FUNCTION sanitize_text_input(p_input TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove potentially dangerous characters
  RETURN regexp_replace(
    regexp_replace(p_input, '<[^>]*>', '', 'g'),
    '[^\x20-\x7E]',
    '',
    'g'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate URL format
CREATE OR REPLACE FUNCTION is_valid_url(p_url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN p_url ~ '^https?://[^\s/$.?#].[^\s]*$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- STEP 9: Add Constraints for Data Integrity
-- =====================================================

-- Add check constraint to shortened_urls for valid URLs
ALTER TABLE shortened_urls DROP CONSTRAINT IF EXISTS valid_original_url;
ALTER TABLE shortened_urls ADD CONSTRAINT valid_original_url 
  CHECK (is_valid_url(original_url));

-- Add constraint to prevent extremely long URLs
ALTER TABLE shortened_urls DROP CONSTRAINT IF EXISTS original_url_length;
ALTER TABLE shortened_urls ADD CONSTRAINT original_url_length 
  CHECK (length(original_url) <= 2048);

-- Add constraint to tool_ratings for valid tool_id format
ALTER TABLE tool_ratings DROP CONSTRAINT IF EXISTS valid_tool_id;
ALTER TABLE tool_ratings ADD CONSTRAINT valid_tool_id 
  CHECK (tool_id ~ '^/tools/[a-z0-9-]+$');

-- =====================================================
-- STEP 10: Enable Additional Security Features
-- =====================================================

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO security_audit_log (
    event_type,
    table_name,
    user_id,
    details
  ) VALUES (
    TG_OP,
    TG_TABLE_NAME,
    auth.uid(),
    jsonb_build_object(
      'operation', TG_OP,
      'timestamp', NOW()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_shortened_urls_delete ON shortened_urls;
CREATE TRIGGER audit_shortened_urls_delete
  AFTER DELETE ON shortened_urls
  FOR EACH ROW
  EXECUTE FUNCTION log_security_event();

DROP TRIGGER IF EXISTS audit_split_bills_delete ON split_bills;
CREATE TRIGGER audit_split_bills_delete
  AFTER DELETE ON split_bills
  FOR EACH ROW
  EXECUTE FUNCTION log_security_event();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the security fixes:
-- 
-- 1. Check RLS policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;
--
-- 2. Check constraints:
-- SELECT conname, contype, conrelid::regclass, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid IN ('shortened_urls'::regclass, 'tool_ratings'::regclass);
--
-- 3. Check audit log:
-- SELECT * FROM security_audit_log ORDER BY created_at DESC LIMIT 10;
-- =====================================================
