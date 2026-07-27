-- Reserve premium usage atomically for anonymous and free-tier users

CREATE OR REPLACE FUNCTION reserve_premium_usage(
  p_metric_name TEXT,
  p_free_quota_per_day INTEGER,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ,
  p_user_id UUID DEFAULT NULL,
  p_anonymous_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  allowed BOOLEAN,
  reason TEXT,
  remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_used_quantity NUMERIC := 0;
  v_remaining INTEGER := 0;
BEGIN
  IF p_user_id IS NULL AND (p_anonymous_id IS NULL OR btrim(p_anonymous_id) = '') THEN
    RETURN QUERY SELECT FALSE, 'anonymous-blocked'::TEXT, 0;
    RETURN;
  END IF;

  -- Serialize concurrent reservations for the same identity + metric so the
  -- check-then-insert below cannot double-spend the daily quota.
  PERFORM pg_advisory_xact_lock(
    hashtext(COALESCE(p_user_id::TEXT, p_anonymous_id) || ':' || p_metric_name)
  );

  IF p_user_id IS NOT NULL THEN
    SELECT COALESCE(SUM(quantity), 0)
      INTO v_used_quantity
    FROM usage_records
    WHERE user_id = p_user_id
      AND metric_name = p_metric_name
      AND period_start >= p_period_start;
  ELSE
    SELECT COALESCE(SUM(quantity), 0)
      INTO v_used_quantity
    FROM usage_records
    WHERE user_id IS NULL
      AND metric_name = p_metric_name
      AND period_start >= p_period_start
      AND metadata->>'anonymousId' = p_anonymous_id;
  END IF;

  IF v_used_quantity >= p_free_quota_per_day THEN
    RETURN QUERY
    SELECT FALSE,
      CASE
        WHEN p_user_id IS NULL THEN 'anonymous-blocked'::TEXT
        ELSE 'quota-exceeded'::TEXT
      END,
      0;
    RETURN;
  END IF;

  INSERT INTO usage_records (
    subscription_id,
    user_id,
    metric_name,
    quantity,
    period_start,
    period_end,
    reported_to_polar,
    metadata
  ) VALUES (
    NULL,
    p_user_id,
    p_metric_name,
    1,
    p_period_start,
    p_period_end,
    FALSE,
    CASE
      WHEN p_user_id IS NULL THEN jsonb_build_object('anonymousId', p_anonymous_id)
      ELSE '{}'::jsonb
    END
  );

  v_remaining := GREATEST(0, p_free_quota_per_day - (v_used_quantity + 1)::INTEGER);

  RETURN QUERY SELECT TRUE, 'within-quota'::TEXT, v_remaining;
END;
$$;

-- SECURITY DEFINER: make sure only the server (service_role) can call this,
-- otherwise anon/authenticated PostgREST roles could insert usage records directly.
REVOKE ALL ON FUNCTION reserve_premium_usage(TEXT, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reserve_premium_usage(TEXT, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT) TO service_role;

CREATE INDEX IF NOT EXISTS idx_usage_records_anonymous_metric_period
  ON usage_records ((metadata->>'anonymousId'), metric_name, period_start)
  WHERE user_id IS NULL;
