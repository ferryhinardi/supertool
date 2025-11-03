# Split Bill Database Installation Guide

## Prerequisites
- Supabase CLI installed ✅
- Supabase project created ✅
- Environment variables configured ✅

## Installation Methods

### Method 1: Supabase Dashboard (Recommended - Easiest)

1. **Open Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Navigate to SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Run First Migration:**
   - Open file: `supabase/migrations/20251102125852_split_bill_system.sql`
   - Copy the entire content
   - Paste into SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for "Success" message

4. **Run Second Migration:**
   - Click "+ New query" again
   - Open file: `supabase/migrations/20251102140000_add_bill_items.sql`
   - Copy the entire content
   - Paste into SQL Editor
   - Click "Run"
   - Wait for "Success" message

5. **Verify Tables Created:**
   - Click "Table Editor" in the left sidebar
   - You should see these tables:
     ```
     ✓ split_bill_users
     ✓ split_bill_groups
     ✓ split_bill_group_members
     ✓ split_bills
     ✓ split_bill_participants
     ✓ split_bill_transactions
     ✓ split_bill_items
     ✓ split_bill_item_assignments
     ```

### Method 2: Using Supabase CLI

#### Step 1: Link Your Project

First, get your project ref from the Supabase dashboard (it's in your project URL: `https://supabase.com/dashboard/project/YOUR-PROJECT-REF`)

```bash
supabase link --project-ref YOUR-PROJECT-REF
```

When prompted for password, enter your database password.

#### Step 2: Push Migrations

```bash
supabase db push
```

This will apply all migrations in the `supabase/migrations` folder to your remote database.

#### Step 3: Verify

```bash
supabase db remote commit
```

### Method 3: Using psql Directly

If you have PostgreSQL client installed:

```bash
# Get connection string from Supabase Dashboard > Project Settings > Database
psql "your-connection-string" -f supabase/migrations/20251102125852_split_bill_system.sql
psql "your-connection-string" -f supabase/migrations/20251102140000_add_bill_items.sql
```

## Verification Queries

Run these in SQL Editor to verify everything is set up correctly:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'split_bill%'
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'split_bill%';

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'split_bill%'
ORDER BY tablename, policyname;

-- Check views exist
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name LIKE 'split_bill%';
```

Expected results:
- **8 tables** created
- **RLS enabled** on all tables
- **Multiple policies** for each table
- **3 views** created: `split_bill_summary`, `split_bill_items_summary`, `participant_items_summary`

## Test the Database

Create a test bill to ensure everything works:

```sql
-- Test: Create a simple bill
INSERT INTO split_bills (
  title, 
  total_amount, 
  currency, 
  organizer_name, 
  organizer_bank_account, 
  organizer_bank_name
) VALUES (
  'Test Dinner',
  150000,
  'IDR',
  'Test User',
  'BCA 1234567890',
  'BCA'
) RETURNING *;

-- Copy the returned ID, then test participants
-- Replace {bill_id} with the actual ID from above
INSERT INTO split_bill_participants (
  bill_id,
  name,
  share_amount
) VALUES
  ('{bill_id}', 'Person 1', 50000),
  ('{bill_id}', 'Person 2', 50000),
  ('{bill_id}', 'Person 3', 50000)
RETURNING *;

-- Check the bill summary
SELECT * FROM split_bill_summary WHERE id = '{bill_id}';

-- Clean up test data
DELETE FROM split_bills WHERE title = 'Test Dinner';
```

## Troubleshooting

### Issue: "relation already exists"
- This means tables are already created
- Safe to ignore if you're re-running migrations
- The migrations use `CREATE TABLE IF NOT EXISTS`

### Issue: "permission denied"
- Make sure you're using the correct database credentials
- Check that your Supabase project is active

### Issue: "function already exists"
- This is normal for re-runs
- The migrations use `CREATE OR REPLACE FUNCTION`

### Issue: Docker not running (for local development)
- Start Docker Desktop or Colima:
  ```bash
  colima start
  ```
- Then run:
  ```bash
  supabase start
  ```

## Next Steps

After successful installation:

1. ✅ Database schema is ready
2. ✅ RLS policies are configured
3. ✅ Triggers and functions are set up

Now you can:
- Test the API endpoints in `lib/split-bill-service.ts`
- Start building the frontend UI
- Create your first split bill!

## Quick Start Frontend Test

After database is set up, test it from your Next.js app:

```typescript
import { createBill } from '@/lib/split-bill-service'

// Create a test bill
const result = await createBill({
  title: 'Team Lunch',
  total_amount: 300000,
  currency: 'IDR',
  organizer_name: 'Ferry',
  organizer_bank_account: 'BCA 1234567890',
  organizer_bank_name: 'BCA',
  split_type: 'equal',
  participants: [
    { name: 'Alice', share_amount: 100000 },
    { name: 'Bob', share_amount: 100000 },
    { name: 'Charlie', share_amount: 100000 }
  ]
})

console.log('Bill created:', result)
```

---

**Need Help?**
- Check Supabase logs in Dashboard > Logs
- Review `docs/SPLIT_BILL_V2_UPGRADE.md` for architecture details
- Test queries in SQL Editor before implementing in code
