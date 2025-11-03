-- =====================================================
-- Test Split Bill Database Installation
-- =====================================================

-- Check all tables exist
SELECT 'Checking tables...' AS status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'split_bill%'
ORDER BY table_name;

-- Check RLS is enabled
SELECT 'Checking RLS...' AS status;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'split_bill%'
ORDER BY tablename;

-- Check views exist
SELECT 'Checking views...' AS status;
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name LIKE 'split_bill%'
ORDER BY table_name;

-- Check functions exist
SELECT 'Checking functions...' AS status;
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_name LIKE '%split_bill%' OR routine_name LIKE '%item_assignment%')
ORDER BY routine_name;

-- Test: Create a sample bill
SELECT 'Creating test bill...' AS status;
INSERT INTO split_bills (
  title, 
  total_amount, 
  currency, 
  organizer_name, 
  organizer_bank_account, 
  organizer_bank_name,
  split_type
) VALUES (
  'Test Dinner',
  150000,
  'IDR',
  'Test User',
  'BCA 1234567890',
  'BCA',
  'equal'
) RETURNING id, title, total_amount, status;

-- Get the last inserted bill ID
DO $$
DECLARE
  v_bill_id UUID;
BEGIN
  SELECT id INTO v_bill_id FROM split_bills WHERE title = 'Test Dinner' ORDER BY created_at DESC LIMIT 1;
  
  -- Test: Add participants
  INSERT INTO split_bill_participants (bill_id, name, share_amount) VALUES
    (v_bill_id, 'Person 1', 50000),
    (v_bill_id, 'Person 2', 50000),
    (v_bill_id, 'Person 3', 50000);
  
  RAISE NOTICE 'Created bill with ID: %', v_bill_id;
END $$;

-- Check the bill summary
SELECT 'Checking bill summary...' AS status;
SELECT * FROM split_bill_summary WHERE title = 'Test Dinner';

-- Check participants
SELECT 'Checking participants...' AS status;
SELECT p.name, p.share_amount, p.payment_status
FROM split_bill_participants p
JOIN split_bills b ON p.bill_id = b.id
WHERE b.title = 'Test Dinner';

-- Clean up test data
SELECT 'Cleaning up test data...' AS status;
DELETE FROM split_bills WHERE title = 'Test Dinner';

SELECT 'Database test completed successfully!' AS status;
