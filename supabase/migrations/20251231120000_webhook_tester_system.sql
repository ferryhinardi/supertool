-- Webhook Tester System
-- This migration creates tables for the Webhook Tester tool

-- Table: webhook_endpoints
-- Stores webhook endpoints created by users
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  response_status_code INTEGER DEFAULT 200,
  response_body JSONB DEFAULT '{}'::jsonb,
  response_headers JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  request_count INTEGER DEFAULT 0
);

-- Table: webhook_requests
-- Logs all incoming webhook requests
CREATE TABLE IF NOT EXISTS webhook_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  headers JSONB NOT NULL DEFAULT '{}'::jsonb,
  query_params JSONB DEFAULT '{}'::jsonb,
  body TEXT,
  body_size INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  response_time_ms INTEGER
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_user_id ON webhook_endpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_created_at ON webhook_endpoints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_is_active ON webhook_endpoints(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_requests_endpoint_id ON webhook_requests(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_requests_received_at ON webhook_requests(received_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_requests ENABLE ROW LEVEL SECURITY;

-- webhook_endpoints policies
-- Users can view their own endpoints
CREATE POLICY "Users can view own webhook endpoints"
  ON webhook_endpoints
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own endpoints
CREATE POLICY "Users can create own webhook endpoints"
  ON webhook_endpoints
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own endpoints
CREATE POLICY "Users can update own webhook endpoints"
  ON webhook_endpoints
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own endpoints
CREATE POLICY "Users can delete own webhook endpoints"
  ON webhook_endpoints
  FOR DELETE
  USING (auth.uid() = user_id);

-- webhook_requests policies
-- Users can view requests for their own endpoints
CREATE POLICY "Users can view requests for own endpoints"
  ON webhook_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM webhook_endpoints
      WHERE webhook_endpoints.id = webhook_requests.endpoint_id
      AND webhook_endpoints.user_id = auth.uid()
    )
  );

-- Allow public inserts for webhook requests (webhooks can be called by anyone)
CREATE POLICY "Anyone can create webhook requests"
  ON webhook_requests
  FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_webhook_endpoint_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_webhook_endpoint_updated_at
  BEFORE UPDATE ON webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_endpoint_updated_at();

-- Function to increment request count
CREATE OR REPLACE FUNCTION increment_webhook_request_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE webhook_endpoints
  SET request_count = request_count + 1
  WHERE id = NEW.endpoint_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment request count on new webhook request
CREATE TRIGGER increment_webhook_request_count
  AFTER INSERT ON webhook_requests
  FOR EACH ROW
  EXECUTE FUNCTION increment_webhook_request_count();

-- Function to clean up expired endpoints (can be called by cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_webhook_endpoints()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM webhook_endpoints
  WHERE expires_at < now()
  AND is_active = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE webhook_endpoints IS 'Stores webhook endpoints created by users';
COMMENT ON TABLE webhook_requests IS 'Logs all incoming webhook requests';
COMMENT ON COLUMN webhook_endpoints.response_status_code IS 'HTTP status code to return (default 200)';
COMMENT ON COLUMN webhook_endpoints.response_body IS 'Custom JSON response body';
COMMENT ON COLUMN webhook_endpoints.response_headers IS 'Custom response headers';
COMMENT ON COLUMN webhook_endpoints.expires_at IS 'Endpoint expiration date (default 7 days)';
COMMENT ON COLUMN webhook_endpoints.request_count IS 'Total number of requests received';
COMMENT ON COLUMN webhook_requests.body_size IS 'Size of request body in bytes';
COMMENT ON COLUMN webhook_requests.response_time_ms IS 'Response time in milliseconds';
