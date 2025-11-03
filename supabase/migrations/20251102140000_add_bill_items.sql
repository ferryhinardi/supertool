-- =====================================================
-- Split Bill Items - Per-Item Splitting Feature
-- =====================================================
-- This migration adds support for itemized bills where
-- each item can be assigned to specific participants

-- Create the split_bill_items table
CREATE TABLE IF NOT EXISTS split_bill_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES split_bills(id) ON DELETE CASCADE NOT NULL,
  
  -- Item details
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  
  -- Item metadata
  category TEXT, -- e.g., "Food", "Drink", "Service"
  notes TEXT,
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the split_bill_item_assignments table (many-to-many)
-- This tracks which participants are assigned to which items
CREATE TABLE IF NOT EXISTS split_bill_item_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES split_bill_items(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES split_bill_participants(id) ON DELETE CASCADE NOT NULL,
  
  -- How much this participant owes for this item
  -- This is calculated as: (item.price * item.quantity) / number_of_assigned_participants
  assigned_amount NUMERIC(12, 2) NOT NULL CHECK (assigned_amount >= 0),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a participant can only be assigned to an item once
  UNIQUE(item_id, participant_id)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_split_bill_items_bill_id ON split_bill_items(bill_id);
CREATE INDEX idx_split_bill_items_display_order ON split_bill_items(bill_id, display_order);
CREATE INDEX idx_split_bill_item_assignments_item_id ON split_bill_item_assignments(item_id);
CREATE INDEX idx_split_bill_item_assignments_participant_id ON split_bill_item_assignments(participant_id);

-- =====================================================
-- Triggers for Updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_split_bill_items_updated_at
  BEFORE UPDATE ON split_bill_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_split_bill_item_assignments_updated_at
  BEFORE UPDATE ON split_bill_item_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS Policies (Open access for demo mode)
-- =====================================================

ALTER TABLE split_bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_bill_item_assignments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (demo mode)
CREATE POLICY "Allow public read access to bill items"
  ON split_bill_items FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to bill items"
  ON split_bill_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to bill items"
  ON split_bill_items FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to bill items"
  ON split_bill_items FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to item assignments"
  ON split_bill_item_assignments FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to item assignments"
  ON split_bill_item_assignments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to item assignments"
  ON split_bill_item_assignments FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to item assignments"
  ON split_bill_item_assignments FOR DELETE
  USING (true);

-- =====================================================
-- Helper Function: Calculate Item Assignment Amounts
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_item_assignment_amount(
  p_item_id UUID,
  p_participant_id UUID
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
-- Helper Function: Recalculate All Assignments for an Item
-- =====================================================

CREATE OR REPLACE FUNCTION recalculate_item_assignments(p_item_id UUID)
RETURNS VOID AS $$
DECLARE
  v_item_total NUMERIC;
  v_assigned_count INTEGER;
  v_amount_per_person NUMERIC;
BEGIN
  -- Get the total cost of the item
  SELECT (price * quantity) INTO v_item_total
  FROM split_bill_items
  WHERE id = p_item_id;
  
  -- Count assignments
  SELECT COUNT(*) INTO v_assigned_count
  FROM split_bill_item_assignments
  WHERE item_id = p_item_id;
  
  -- Only recalculate if there are assignments
  IF v_assigned_count > 0 THEN
    v_amount_per_person := ROUND(v_item_total / v_assigned_count, 2);
    
    -- Update all assignments for this item
    UPDATE split_bill_item_assignments
    SET assigned_amount = v_amount_per_person
    WHERE item_id = p_item_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Trigger: Auto-recalculate when item price/quantity changes
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_item_assignments()
RETURNS TRIGGER AS $$
BEGIN
  -- If price or quantity changed, recalculate all assignments
  IF (OLD.price != NEW.price) OR (OLD.quantity != NEW.quantity) THEN
    PERFORM recalculate_item_assignments(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_on_item_update
  AFTER UPDATE ON split_bill_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_item_assignments();

-- =====================================================
-- Trigger: Auto-recalculate when assignments change
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_on_assignment_change()
RETURNS TRIGGER AS $$
DECLARE
  v_item_id UUID;
BEGIN
  -- Get the item_id from the affected row
  IF TG_OP = 'DELETE' THEN
    v_item_id := OLD.item_id;
  ELSE
    v_item_id := NEW.item_id;
  END IF;
  
  -- Recalculate all assignments for this item
  PERFORM recalculate_item_assignments(v_item_id);
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_on_assignment_insert
  AFTER INSERT ON split_bill_item_assignments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_on_assignment_change();

CREATE TRIGGER recalculate_on_assignment_delete
  AFTER DELETE ON split_bill_item_assignments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_on_assignment_change();

-- =====================================================
-- View: Bill Items with Assignment Summary
-- =====================================================

CREATE OR REPLACE VIEW split_bill_items_summary AS
SELECT 
  i.id,
  i.bill_id,
  i.name,
  i.description,
  i.price,
  i.quantity,
  (i.price * i.quantity) AS total_price,
  i.category,
  i.notes,
  i.display_order,
  COUNT(a.id) AS assigned_count,
  COALESCE(ARRAY_AGG(p.name) FILTER (WHERE p.name IS NOT NULL), ARRAY[]::TEXT[]) AS assigned_to,
  i.created_at,
  i.updated_at
FROM split_bill_items i
LEFT JOIN split_bill_item_assignments a ON i.id = a.item_id
LEFT JOIN split_bill_participants p ON a.participant_id = p.id
GROUP BY i.id, i.bill_id, i.name, i.description, i.price, i.quantity, i.category, i.notes, i.display_order, i.created_at, i.updated_at;

-- =====================================================
-- View: Participant's Item Summary
-- =====================================================

CREATE OR REPLACE VIEW participant_items_summary AS
SELECT 
  p.id AS participant_id,
  p.bill_id,
  p.name AS participant_name,
  COUNT(a.id) AS item_count,
  COALESCE(SUM(a.assigned_amount), 0) AS total_from_items,
  p.share_amount AS original_share_amount,
  p.payment_status,
  p.paid_at,
  p.confirmed_at
FROM split_bill_participants p
LEFT JOIN split_bill_item_assignments a ON p.id = a.participant_id
GROUP BY p.id, p.bill_id, p.name, p.share_amount, p.payment_status, p.paid_at, p.confirmed_at;
