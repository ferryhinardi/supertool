# Split Bill Calculator - LINE-Style Upgrade

## Overview

This document outlines the comprehensive upgrade of the Split Bill Calculator to a full-featured LINE-style split bill system with persistent storage, real-time updates, and bank transfer payment tracking.

## What's New

### 1. Database-Backed Persistent Storage
- Bills are saved to Supabase PostgreSQL database
- Shareable bill links that persist across sessions
- Full bill history and analytics
- Support for multiple concurrent bills

### 2. Bank Transfer Payment Integration
- Organizer can provide bank account details (e.g., "BCA 1234567890")
- Participants can view payment instructions
- Manual payment confirmation workflow
- Optional payment proof upload

### 3. Advanced Split Options
- **Equal Split**: Divide amount equally among all participants
- **Custom Split**: Each person pays a different amount
- **Percentage Split**: Split by custom percentages

### 4. Real-time Updates
- Live payment status updates using Supabase Realtime
- Instant notification when participants mark payments as paid
- Auto-completion when all participants have paid

### 5. Enhanced Features
- Bill history view
- Payment tracking dashboard
- Transaction proof upload
- Organizer payment verification
- Export bill summary

## Architecture

### Database Schema

```
split_bill_users
├── id (UUID)
├── name
├── email
├── bank_account
└── bank_name

split_bills
├── id (UUID)
├── title
├── total_amount
├── currency
├── organizer_name
├── organizer_bank_account
├── organizer_bank_name
├── split_type (equal | custom | percentage)
├── status (active | completed | cancelled)
└── receipt_image_url

split_bill_participants
├── id (UUID)
├── bill_id
├── name
├── share_amount
├── payment_status (pending | paid | confirmed)
├── paid_at
└── confirmed_at

split_bill_transactions (optional)
├── id (UUID)
├── bill_id
├── participant_id
├── amount
├── proof_image_url
└── status (unverified | verified | rejected)
```

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + PandaCSS + Arc UI
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Storage**: Supabase Storage (for receipt/proof images)
- **State Management**: React hooks + Supabase queries

## Implementation Steps

### Step 1: Database Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
# File: supabase-split-bill-setup.sql
```

This creates:
- 5 main tables (users, groups, bills, participants, transactions)
- Indexes for performance
- RLS policies for security
- Triggers for auto-updates
- Views for bill summaries

### Step 2: API Integration

Use the provided service functions:

```typescript
// File: lib/split-bill-service.ts
import { createBill, getBillById, updateParticipantPaymentStatus } from '@/lib/split-bill-service'

// Create a new bill
const result = await createBill({
  title: 'Dinner at Sushi Hiro',
  total_amount: 300000,
  currency: 'IDR',
  organizer_name: 'Ferry Hinardi',
  organizer_bank_account: 'BCA 1234567890',
  organizer_bank_name: 'BCA',
  split_type: 'equal',
  participants: [
    { name: 'Person 1', share_amount: 100000 },
    { name: 'Person 2', share_amount: 100000 },
    { name: 'Person 3', share_amount: 100000 }
  ]
})
```

### Step 3: Frontend Implementation

Key UI components to implement:

#### A. Bill Creation Form
```typescript
interface BillCreationForm {
  title: string
  amount: number
  organizerName: string
  bankAccount?: string
  bankName?: string
  splitType: 'equal' | 'custom'
  participants: { name: string; share?: number }[]
}
```

#### B. Bill Summary Card
Display:
- Title and total amount
- Organizer bank account info (copyable)
- List of participants with status indicators
- Progress bar (paid vs unpaid)

#### C. Payment Action Buttons
- **Participant View**: "Mark as Paid" button
- **Organizer View**: "Confirm Payment" button
- Upload payment proof (optional)

#### D. Real-time Status Updates
```typescript
useEffect(() => {
  const unsubscribe = subscribeToBillUpdates(billId, (payload) => {
    // Update UI when participants mark as paid
    refreshBillData()
  })
  
  return () => unsubscribe()
}, [billId])
```

## User Flows

### Flow 1: Create and Share Bill

1. **Organizer** creates bill:
   - Enter title (e.g., "Team Lunch")
   - Enter total amount (e.g., Rp 300,000)
   - Add bank account (e.g., "BCA 1234567890")
   - Add participants
   - Choose split type (equal/custom)

2. **System** generates:
   - Unique bill ID
   - Shareable link: `supertool.io/s/bill-abc123`
   - Per-person amounts calculated

3. **Organizer** shares:
   - Copy link to WhatsApp/Telegram
   - Share payment instructions

### Flow 2: Participant Payment

1. **Participant** opens link
2. **Views**:
   - Bill details
   - Their share amount
   - Organizer's bank account
3. **Makes transfer** via mobile banking
4. **Marks as paid** in the tool
5. **Organizer** receives notification
6. **Organizer** confirms payment

### Flow 3: Bill Completion

1. All participants mark as paid
2. Organizer confirms all payments
3. Bill status → "Completed"
4. Summary available for export

## Key Features Implementation

### 1. Equal Split
```typescript
const shareAmount = calculateEqualSplit(totalAmount, participants.length)
// Each person pays: Rp 100,000
```

### 2. Custom Split
```typescript
participants = [
  { name: 'Person 1', share: 150000 }, // Pays more
  { name: 'Person 2', share: 100000 },
  { name: 'Person 3', share: 50000 },  // Pays less
]

// Validation
const { isValid, difference } = validateCustomSplit(300000, [150000, 100000, 50000])
```

### 3. Bank Account Display
```typescript
<div className="bank-info">
  <p>Transfer to:</p>
  <p className="bank-account">{bill.organizer_bank_name} {bill.organizer_bank_account}</p>
  <p className="organizer-name">{bill.organizer_name}</p>
  <button onClick={copyBankAccount}>Copy Account</button>
</div>
```

### 4. Payment Status Indicators
```typescript
const statusConfig = {
  pending: { color: 'gray', icon: '⏳', label: 'Pending' },
  paid: { color: 'blue', icon: '💳', label: 'Paid' },
  confirmed: { color: 'green', icon: '✅', label: 'Confirmed' }
}
```

### 5. Real-time Updates
```typescript
// Auto-refresh when any participant updates
const channel = supabase
  .channel(`bill-${billId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'split_bill_participants',
    filter: `bill_id=eq.${billId}`
  }, (payload) => {
    toast.success(`${payload.new.name} marked as paid!`)
    refreshParticipants()
  })
  .subscribe()
```

## Payment Workflow

### Status Flow

```
pending → paid → confirmed
   ↓       ↓       ↓
  ⏳      💳      ✅
```

1. **Pending**: Default state, waiting for transfer
2. **Paid**: Participant marks themselves as paid
3. **Confirmed**: Organizer verifies payment received

### Organizer Dashboard

Shows:
- Total amount: Rp 300,000
- Collected: Rp 200,000 (2/3 confirmed)
- Pending: Rp 100,000 (1 person)

Actions:
- Confirm payments
- Send reminders
- View transaction proofs

## UI/UX Improvements

### Visual Design

1. **Status Badges**
   - Pending: Gray outline
   - Paid: Blue solid
   - Confirmed: Green solid with checkmark

2. **Progress Indicator**
   ```
   [████████░░] 80% Complete
   8 of 10 people paid
   ```

3. **Bank Account Card**
   - Large, copyable text
   - QR code for payment apps (future)
   - "Tap to copy" interaction

4. **Participant List**
   - Avatar placeholders
   - Name + amount
   - Status badge
   - Timestamp when paid

### Mobile Optimization

- Large touch targets for "Mark as Paid"
- Quick copy bank account
- Native share sheet
- Bottom sheet for details

## Analytics Events

Track user behavior:

```typescript
trackToolEvent('split_bill_create', {
  split_type: 'equal',
  participant_count: 5,
  total_amount: 300000,
  currency: 'IDR'
})

trackToolEvent('split_bill_mark_paid', {
  bill_id: 'abc123',
  amount: 60000
})

trackToolEvent('split_bill_confirm_payment', {
  bill_id: 'abc123',
  participant_id: 'xyz789'
})
```

## Security Considerations

1. **RLS Policies**
   - Anyone can create bills (demo mode)
   - Only organizer can confirm payments
   - Participants can only update their own status

2. **Data Privacy**
   - Bank account visible only to participants
   - No sensitive data in URLs
   - Optional authentication for history

3. **Validation**
   - Amount must be positive
   - Shares must sum to total
   - Status transitions must be valid

## Future Enhancements

### Phase 2
- [ ] Group management (recurring split groups)
- [ ] Payment gateway integration (Xendit, Midtrans)
- [ ] Automatic payment verification via bank API
- [ ] QR code for payment apps
- [ ] Split by items (itemized receipts)
- [ ] Multi-currency support in single bill
- [ ] Email/SMS notifications

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Recurring bills (monthly expenses)
- [ ] Expense reports
- [ ] Integration with accounting tools
- [ ] Bill templates
- [ ] Split across multiple payment methods

## Testing

### Unit Tests
```typescript
describe('Split Bill Service', () => {
  test('calculates equal split correctly', () => {
    expect(calculateEqualSplit(300000, 3)).toBe(100000)
  })
  
  test('validates custom split', () => {
    const { isValid } = validateCustomSplit(300000, [150000, 100000, 50000])
    expect(isValid).toBe(true)
  })
})
```

### Integration Tests
- Create bill → Save to database
- Update payment status → Trigger real-time update
- Complete bill → Auto-mark as completed

## Deployment

1. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Database Migration**
   - Run `supabase-split-bill-setup.sql`
   - Verify tables created
   - Test RLS policies

3. **Feature Flag** (optional)
   ```typescript
   const SPLIT_BILL_V2_ENABLED = process.env.NEXT_PUBLIC_SPLIT_BILL_V2 === 'true'
   ```

## Migration Strategy

### From V1 to V2

**Option 1: Gradual Rollout**
- Keep existing calculator as-is
- Add "Try New Split Bill" button
- Parallel systems for testing

**Option 2: Full Replacement**
- Migrate existing page
- Add backwards compatibility
- Redirect old links

**Recommended**: Option 1 for lower risk

## Support & Documentation

### User Guide

Create help documentation:
1. How to create a bill
2. How to add participants
3. How to share bill link
4. How to mark payment as paid
5. How to confirm payments (organizer)

### FAQ

**Q: Do I need to sign up?**
A: No, you can create bills anonymously. Bills are saved by link.

**Q: Is my bank account safe?**
A: Bank account is only visible to bill participants via the link.

**Q: What if someone doesn't pay?**
A: Organizer can send reminders or remove unpaid participants.

## Conclusion

This upgrade transforms the Split Bill Calculator from a simple client-side tool into a full-featured collaborative payment tracking system inspired by LINE's split bill feature. Key improvements:

✅ Persistent storage with Supabase
✅ Real-time collaboration
✅ Bank transfer integration
✅ Custom split options
✅ Payment verification workflow
✅ Shareable bill links
✅ Bill history

**Next Steps:**
1. Run database setup SQL
2. Implement UI components
3. Test with real users
4. Collect feedback
5. Iterate and improve

---

**Files Created:**
- `supabase-split-bill-setup.sql` - Database schema
- `lib/split-bill-types.ts` - TypeScript types
- `lib/split-bill-service.ts` - API service functions
- `docs/SPLIT_BILL_V2_UPGRADE.md` - This document

**Ready to implement the frontend UI next!**
