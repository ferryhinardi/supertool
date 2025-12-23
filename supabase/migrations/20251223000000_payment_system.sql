-- Payment System Tables for Polar Integration
-- This migration creates tables for managing subscriptions, orders, and usage-based billing

-- =============================================================================
-- SUBSCRIPTIONS TABLE
-- =============================================================================
-- Stores user subscription data synced from Polar
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polar IDs
  polar_subscription_id TEXT UNIQUE NOT NULL,
  polar_customer_id TEXT NOT NULL,
  polar_product_id TEXT NOT NULL,
  polar_price_id TEXT NOT NULL,
  
  -- User reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  
  -- Subscription details
  status TEXT NOT NULL CHECK (status IN ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Pricing
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  interval_count INTEGER NOT NULL DEFAULT 1,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_customer_id ON subscriptions(polar_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- =============================================================================
-- ORDERS TABLE
-- =============================================================================
-- Stores one-time payment orders from Polar
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polar IDs
  polar_order_id TEXT UNIQUE NOT NULL,
  polar_customer_id TEXT NOT NULL,
  polar_product_id TEXT NOT NULL,
  
  -- User reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  
  -- Order details
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  
  -- Payment details
  payment_processor TEXT,
  payment_processor_order_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_polar_customer_id ON orders(polar_customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- =============================================================================
-- USAGE RECORDS TABLE
-- =============================================================================
-- Tracks usage-based billing metrics for metered subscriptions
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Usage details
  metric_name TEXT NOT NULL, -- e.g., 'api_calls', 'storage_gb', 'compute_hours'
  quantity DECIMAL(10, 2) NOT NULL,
  
  -- Billing period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Status
  reported_to_polar BOOLEAN DEFAULT FALSE,
  polar_usage_event_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_records_subscription_id ON usage_records(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_metric_name ON usage_records(metric_name);
CREATE INDEX IF NOT EXISTS idx_usage_records_period_start ON usage_records(period_start);
CREATE INDEX IF NOT EXISTS idx_usage_records_reported ON usage_records(reported_to_polar);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================
-- Auto-update updated_at timestamp on row modification

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_records_updated_at BEFORE UPDATE ON usage_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all orders"
  ON orders FOR ALL
  USING (auth.role() = 'service_role');

-- Usage records policies
CREATE POLICY "Users can view their own usage records"
  ON usage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all usage records"
  ON usage_records FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- HELPER VIEWS
-- =============================================================================
-- View for active subscriptions
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  s.*,
  u.email as user_email
FROM subscriptions s
LEFT JOIN auth.users u ON s.user_id = u.id
WHERE s.status IN ('active', 'trialing')
  AND s.current_period_end > NOW();

-- View for subscription revenue (last 30 days)
CREATE OR REPLACE VIEW subscription_revenue_30d AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_subscriptions,
  SUM(amount) as revenue_cents,
  SUM(amount) / 100.0 as revenue_usd
FROM subscriptions
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND status IN ('active', 'trialing')
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View for order revenue (last 30 days)
CREATE OR REPLACE VIEW order_revenue_30d AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(amount) as revenue_cents,
  SUM(amount) / 100.0 as revenue_usd
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND status = 'succeeded'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE subscriptions IS 'Stores user subscription data synced from Polar webhooks';
COMMENT ON TABLE orders IS 'Stores one-time payment orders from Polar';
COMMENT ON TABLE usage_records IS 'Tracks usage-based billing metrics for metered subscriptions';
COMMENT ON VIEW active_subscriptions IS 'Shows all currently active subscriptions';
COMMENT ON VIEW subscription_revenue_30d IS 'Daily subscription revenue for the last 30 days';
COMMENT ON VIEW order_revenue_30d IS 'Daily order revenue for the last 30 days';
