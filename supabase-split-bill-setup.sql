-- =====================================================
-- Split Bill System - Supabase Database Setup (LINE-Style)
-- =====================================================
-- Run this entire script in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Create Tables
-- =====================================================

-- Create the split_bill_users table (simplified user profiles)
CREATE TABLE IF NOT EXISTS split_bill_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  bank_account TEXT, -- Organizer's bank info (e.g., "BCA 1234567890")
  bank_name TEXT, -- Bank name (e.g., "BCA", "Mandiri")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Optional: Link to auth.users if authentication is needed
  auth_user_id UUID REFERENCES auth.users(id)
);

-- Create the split_bill_groups table (for group-based splitting)
CREATE TABLE IF NOT EXISTS split_bill_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES split_bill_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the split_bill_group_members table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS split_bill_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES split_bill_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES split_bill_users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

-- Create the split_bills table
CREATE TABLE IF NOT EXISTS split_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  currency VARCHAR(3) DEFAULT 'IDR',
  
  -- Receipt/Photo
  receipt_image_url TEXT,
  
  -- Group or manual participants
  group_id UUID REFERENCES split_bill_groups(id) ON DELETE SET NULL,
  
  -- Organizer info
  created_by UUID REFERENCES split_bill_users(id) ON DELETE SET NULL,
  organizer_name TEXT NOT NULL, -- Cached name for display
  organizer_bank_account TEXT, -- Bank account for receiving payments
  organizer_bank_name TEXT, -- Bank name (e.g., "BCA", "Mandiri")
  
  -- Split configuration
  split_type VARCHAR(20) DEFAULT 'equal' CHECK (split_type IN ('equal', 'custom', 'percentage')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create the split_bill_participants table
CREATE TABLE IF NOT EXISTS split_bill_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES split_bills(id) ON DELETE CASCADE,
  
  -- Participant info (can be linked user or manual entry)
  user_id UUID REFERENCES split_bill_users(id) ON DELETE SET NULL,
  name TEXT NOT NULL, -- Cached or manual name
  email TEXT,
  
  -- Share calculation
  share_amount NUMERIC(12, 2) NOT NULL CHECK (share_amount >= 0),
  share_percentage NUMERIC(5, 2), -- For percentage-based splits
  
  -- Payment status
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'confirmed')),
  paid_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional fields
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(bill_id, user_id)
);

-- Create the split_bill_transactions table (optional manual proof)
CREATE TABLE IF NOT EXISTS split_bill_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES split_bills(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES split_bill_participants(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount NUMERIC(12, 2) NOT NULL,
  proof_image_url TEXT,
  notes TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified', 'rejected')),
  verified_by UUID REFERENCES split_bill_users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Create Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_split_bill_users_email ON split_bill_users(email);
CREATE INDEX IF NOT EXISTS idx_split_bill_users_auth_user_id ON split_bill_users(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_split_bill_groups_created_by ON split_bill_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_split_bill_group_members_group_id ON split_bill_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_split_bill_group_members_user_id ON split_bill_group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_split_bills_created_by ON split_bills(created_by);
CREATE INDEX IF NOT EXISTS idx_split_bills_group_id ON split_bills(group_id);
CREATE INDEX IF NOT EXISTS idx_split_bills_status ON split_bills(status);
CREATE INDEX IF NOT EXISTS idx_split_bills_created_at ON split_bills(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_split_bill_participants_bill_id ON split_bill_participants(bill_id);
CREATE INDEX IF NOT EXISTS idx_split_bill_participants_user_id ON split_bill_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_split_bill_participants_payment_status ON split_bill_participants(payment_status);

CREATE INDEX IF NOT EXISTS idx_split_bill_transactions_bill_id ON split_bill_transactions(bill_id);
CREATE INDEX IF NOT EXISTS idx_split_bill_transactions_participant_id ON split_bill_transactions(participant_id);
CREATE INDEX IF NOT EXISTS idx_split_bill_transactions_status ON split_bill_transactions(status);

-- =====================================================
-- STEP 3: Create Triggers
-- =====================================================

-- Create updated_at trigger function (if not exists from URL shortener)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_split_bill_users_updated_at ON split_bill_users;
CREATE TRIGGER update_split_bill_users_updated_at
  BEFORE UPDATE ON split_bill_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_split_bill_groups_updated_at ON split_bill_groups;
CREATE TRIGGER update_split_bill_groups_updated_at
  BEFORE UPDATE ON split_bill_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_split_bills_updated_at ON split_bills;
CREATE TRIGGER update_split_bills_updated_at
  BEFORE UPDATE ON split_bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_split_bill_participants_updated_at ON split_bill_participants;
CREATE TRIGGER update_split_bill_participants_updated_at
  BEFORE UPDATE ON split_bill_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_split_bill_transactions_updated_at ON split_bill_transactions;
CREATE TRIGGER update_split_bill_transactions_updated_at
  BEFORE UPDATE ON split_bill_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 4: Create Views
-- =====================================================

-- Create a view for bill summary with participant counts
CREATE OR REPLACE VIEW split_bill_summary AS
SELECT
  sb.id,
  sb.title,
  sb.description,
  sb.total_amount,
  sb.currency,
  sb.organizer_name,
  sb.organizer_bank_account,
  sb.organizer_bank_name,
  sb.split_type,
  sb.status,
  sb.created_at,
  sb.completed_at,
  COUNT(sbp.id) as total_participants,
  COUNT(CASE WHEN sbp.payment_status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN sbp.payment_status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN sbp.payment_status = 'confirmed' THEN 1 END) as confirmed_count,
  SUM(CASE WHEN sbp.payment_status IN ('paid', 'confirmed') THEN sbp.share_amount ELSE 0 END) as total_paid_amount,
  SUM(CASE WHEN sbp.payment_status = 'pending' THEN sbp.share_amount ELSE 0 END) as total_pending_amount
FROM split_bills sb
LEFT JOIN split_bill_participants sbp ON sb.id = sbp.bill_id
GROUP BY sb.id, sb.title, sb.description, sb.total_amount, sb.currency, 
         sb.organizer_name, sb.organizer_bank_account, sb.organizer_bank_name,
         sb.split_type, sb.status, sb.created_at, sb.completed_at;

-- =====================================================
-- STEP 5: Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE split_bill_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_bill_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_bill_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_bill_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_bill_transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: Create RLS Policies
-- =====================================================

-- Policy: Anyone can create users (for anonymous/demo mode)
DROP POLICY IF EXISTS "Anyone can create users" ON split_bill_users;
CREATE POLICY "Anyone can create users"
  ON split_bill_users
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view all users (for participant selection)
DROP POLICY IF EXISTS "Anyone can view users" ON split_bill_users;
CREATE POLICY "Anyone can view users"
  ON split_bill_users
  FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON split_bill_users;
CREATE POLICY "Users can update own profile"
  ON split_bill_users
  FOR UPDATE
  USING (auth.uid() = auth_user_id OR auth_user_id IS NULL);

-- Policy: Anyone can create bills (for demo mode)
DROP POLICY IF EXISTS "Anyone can create bills" ON split_bills;
CREATE POLICY "Anyone can create bills"
  ON split_bills
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can view bills (for shareable links)
DROP POLICY IF EXISTS "Anyone can view bills" ON split_bills;
CREATE POLICY "Anyone can view bills"
  ON split_bills
  FOR SELECT
  USING (true);

-- Policy: Organizer can update their bills
DROP POLICY IF EXISTS "Organizer can update bills" ON split_bills;
CREATE POLICY "Organizer can update bills"
  ON split_bills
  FOR UPDATE
  USING (auth.uid() = (SELECT auth_user_id FROM split_bill_users WHERE id = created_by) OR created_by IS NULL);

-- Policy: Anyone can view participants (for bill viewing)
DROP POLICY IF EXISTS "Anyone can view participants" ON split_bill_participants;
CREATE POLICY "Anyone can view participants"
  ON split_bill_participants
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert participants (for bill creation)
DROP POLICY IF EXISTS "Anyone can insert participants" ON split_bill_participants;
CREATE POLICY "Anyone can insert participants"
  ON split_bill_participants
  FOR INSERT
  WITH CHECK (true);

-- Policy: Participants can update their own payment status
DROP POLICY IF EXISTS "Participants can update payment status" ON split_bill_participants;
CREATE POLICY "Participants can update payment status"
  ON split_bill_participants
  FOR UPDATE
  USING (true); -- Allow anyone to update (demo mode)

-- Policy: Anyone can view transactions
DROP POLICY IF EXISTS "Anyone can view transactions" ON split_bill_transactions;
CREATE POLICY "Anyone can view transactions"
  ON split_bill_transactions
  FOR SELECT
  USING (true);

-- Policy: Anyone can create transactions
DROP POLICY IF EXISTS "Anyone can create transactions" ON split_bill_transactions;
CREATE POLICY "Anyone can create transactions"
  ON split_bill_transactions
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- STEP 7: Create Functions
-- =====================================================

-- Function to automatically update bill status when all participants have paid
CREATE OR REPLACE FUNCTION update_bill_status_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  pending_count INTEGER;
BEGIN
  -- Count remaining pending participants
  SELECT COUNT(*)
  INTO pending_count
  FROM split_bill_participants
  WHERE bill_id = NEW.bill_id
    AND payment_status = 'pending';
  
  -- If no pending participants, mark bill as completed
  IF pending_count = 0 THEN
    UPDATE split_bills
    SET status = 'completed',
        completed_at = NOW()
    WHERE id = NEW.bill_id
      AND status != 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to participants table
DROP TRIGGER IF EXISTS trigger_update_bill_status ON split_bill_participants;
CREATE TRIGGER trigger_update_bill_status
  AFTER UPDATE OF payment_status ON split_bill_participants
  FOR EACH ROW
  WHEN (NEW.payment_status IN ('confirmed'))
  EXECUTE FUNCTION update_bill_status_on_payment();

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to verify setup:
-- 
-- SELECT * FROM split_bill_users;
-- SELECT * FROM split_bills;
-- SELECT * FROM split_bill_participants;
-- SELECT * FROM split_bill_summary;
-- =====================================================
