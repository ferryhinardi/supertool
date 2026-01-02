# Manual Donation Flow Testing Guide

## 🎯 Objective

Test the complete end-to-end donation flow to verify:
1. ✅ Donation form works correctly
2. ✅ Polar checkout processes payment
3. ✅ Webhook receives payment notification
4. ✅ Order is saved to database
5. ✅ Thank you email is sent
6. ✅ Recent Supporters section updates

---

## 📋 Prerequisites

### 1. Dev Server Running
```bash
# Check if running on port 3000
lsof -ti:3000

# If not running, start it:
pnpm dev
```

### 2. Environment Variables Configured
Required in `.env.local`:
```bash
NEXT_PUBLIC_POLAR_CLIENT_ID=your_client_id
NEXT_PUBLIC_POLAR_PRODUCT_ID=your_product_id
POLAR_WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 3. Polar Test Mode Enabled
- Ensure you're using test/sandbox mode in Polar dashboard
- Test credit card: `4242 4242 4242 4242`
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC (e.g., 123)

---

## 🧪 Step-by-Step Testing Process

### Step 1: Access Support Page

1. Open browser to: **http://localhost:3000/support**
2. **Verify page loads correctly**:
   - ✅ Hero section displays
   - ✅ Donation tiers render (Small Coffee, Big Lunch, Generous Support)
   - ✅ Custom amount input works
   - ✅ "Recent Supporters" section displays (may be empty)

**Expected Result**: Page loads with all sections visible

---

### Step 2: Select Donation Tier

**Option A: Use Preset Tier**
1. Click on "Small Coffee - $5" card
2. **Verify**: Card highlights/becomes active
3. **Verify**: Selected tier shows visual feedback

**Option B: Use Custom Amount**
1. Scroll to "Other Amount" section
2. Enter custom amount (e.g., `15`)
3. **Verify**: Input accepts numbers only
4. **Verify**: Display shows formatted amount ($15.00)

**Expected Result**: Selected tier is highlighted or custom amount is entered

---

### Step 3: Enter Donor Information

1. **Name field**: Enter your name (e.g., "Test Donor")
2. **Email field**: Enter your email (e.g., "hinardi93@gmail.com")
3. **Verify**: Both fields accept input correctly
4. **Verify**: Email validation works (try invalid email first)

**Expected Result**: Form fields accept valid input, show validation errors for invalid input

---

### Step 4: Submit Donation

1. Click **"Proceed to Payment"** button
2. **Monitor**: Button should show loading state
3. **Watch**: Console for any errors (open DevTools with F12)

**What Happens Behind the Scenes**:
```
User clicks button
  ↓
Frontend calls: POST /api/checkout
  ↓
API creates Polar checkout session
  ↓
API returns checkout URL
  ↓
Browser redirects to Polar checkout
```

**Expected Result**: Browser redirects to Polar checkout page (polar.sh domain)

---

### Step 5: Complete Polar Checkout

On Polar checkout page:

1. **Verify donation details**:
   - ✅ Amount is correct
   - ✅ Product name: "Support SuperTool"
   - ✅ Your name is pre-filled

2. **Enter test payment information**:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry Date: 12/34 (any future date)
   CVC: 123 (any 3 digits)
   Billing Address: Any valid address
   ```

3. **Click "Pay Now"** or similar button

4. **Wait for processing** (usually 2-5 seconds)

**Expected Result**: Payment succeeds, shows success message

---

### Step 6: Return to SuperTool

After successful payment:

1. **Automatic redirect**: Should return to http://localhost:3000/support
2. **Look for success message**: May show "Thank you for your support!" notification
3. **Refresh page**: Manually refresh if needed

**Expected Result**: Redirected back to SuperTool support page

---

### Step 7: Verify Webhook Processing

**Check Dev Server Console** (Terminal where `pnpm dev` is running):

Look for these log messages:
```
[Polar Webhook] Received webhook event: checkout.completed
[Polar Webhook] Processing checkout event
[Order Service] Creating new order: [order_id]
[Order Service] Order created successfully
[Email Service] Sending thank you email to: your-email@example.com
✓ Email sent successfully: [email_id]
[Polar Webhook] Checkout processed successfully
```

**Expected Result**: All log messages appear without errors

**If No Logs Appear**:
- Webhook might not be triggered (local development limitation)
- Polar webhook URL might not be configured
- **Solution**: Manually trigger webhook (see Step 8)

---

### Step 8: Manually Trigger Webhook (If Needed)

If webhook doesn't fire automatically in local development:

1. **Get checkout session ID** from Polar dashboard:
   - Go to: https://polar.sh/dashboard/ferryhinardi
   - Navigate to: Sales → Orders
   - Find your test order
   - Copy the checkout session ID

2. **Trigger webhook manually**:
   ```bash
   # This simulates Polar calling your webhook
   curl -X POST http://localhost:3000/api/webhooks/polar \
     -H "Content-Type: application/json" \
     -H "polar-webhook-signature: test-signature" \
     -d '{
       "type": "checkout.completed",
       "data": {
         "id": "checkout_session_id_from_polar",
         "status": "succeeded",
         "customer_email": "hinardi93@gmail.com",
         "customer_name": "Test Donor",
         "amount": 1500,
         "currency": "USD",
         "product_id": "your_product_id"
       }
     }'
   ```

**Note**: For local testing, webhook signature validation might fail. This is expected.

**Expected Result**: Logs appear in console showing order creation and email sending

---

### Step 9: Verify Database Entry

Check if order was saved to Supabase:

1. **Option A: Check via SQL**
   ```bash
   # If you have Supabase CLI installed
   supabase db sql "SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;"
   ```

2. **Option B: Check via Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Navigate to your project
   - Go to: Table Editor → orders
   - Look for latest entry with your email

**Expected Fields**:
```
id: [uuid]
checkout_session_id: [from Polar]
customer_email: hinardi93@gmail.com
customer_name: Test Donor
amount: 1500 (cents)
currency: USD
status: succeeded
created_at: [timestamp]
```

**Expected Result**: New row exists with correct data

---

### Step 10: Verify Email Delivery

1. **Check your email inbox**: hinardi93@gmail.com
2. **If not in inbox, check spam folder** (likely location on free tier)
3. **Look for email with subject**: "Thank you for supporting SuperTool! 💙"

**Expected Email Content**:
- ✅ Personalized greeting: "Hi Test Donor,"
- ✅ Donation amount: "$15.00" (or your amount)
- ✅ Beautiful HTML template with gradient header
- ✅ Thank you message
- ✅ "Explore SuperTool" button
- ✅ Footer with receipt notice

**Check Email Details**:
- From: SuperTool <onboarding@resend.dev>
- To: hinardi93@gmail.com
- Subject: Thank you for supporting SuperTool! 💙

**Expected Result**: Email received (in inbox or spam)

---

### Step 11: Verify Recent Supporters Section

1. **Return to support page**: http://localhost:3000/support
2. **Refresh page**: Press F5 or Cmd+R
3. **Scroll to "Recent Supporters" section**

**Verify Entry Appears**:
- ✅ Your donation shows up in the list
- ✅ Name is anonymized: "Test D." (not full name)
- ✅ Amount displays correctly: "$15.00"
- ✅ Relative time shows: "Just now" or "1 minute ago"
- ✅ Avatar displays (first letter of name)

**Expected Result**: Your donation appears at the top of the list with anonymized name

---

## ✅ Complete Success Checklist

After completing all steps, verify:

- [ ] Support page loads correctly
- [ ] Donation form accepts input
- [ ] Polar checkout processes payment
- [ ] Payment succeeds with test card
- [ ] Redirects back to SuperTool
- [ ] Webhook logs appear in console
- [ ] Order saved to database
- [ ] Email sent successfully
- [ ] Email received (inbox or spam)
- [ ] Recent Supporters section updates
- [ ] Name is anonymized properly
- [ ] No errors in browser console
- [ ] No errors in server console

**If all checked**: ✅ System is working perfectly!

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "Proceed to Payment" Button Does Nothing

**Symptoms**: Button click doesn't redirect to Polar

**Debugging**:
1. Open browser DevTools (F12) → Console tab
2. Click button again
3. Look for error messages

**Common Causes**:
- `NEXT_PUBLIC_POLAR_CLIENT_ID` not set
- `NEXT_PUBLIC_POLAR_PRODUCT_ID` not set
- Invalid Polar credentials
- Network error (check Network tab)

**Solution**:
```bash
# Verify environment variables
cat .env.local | grep POLAR

# Restart dev server after changing .env.local
pkill -f "next dev"
pnpm dev
```

---

### Issue 2: Payment Fails on Polar Checkout

**Symptoms**: "Payment failed" message on Polar page

**Common Causes**:
- Using wrong test card number
- Using expired date
- Polar product not in test mode
- Polar account issue

**Solution**:
1. Use exact test card: `4242 4242 4242 4242`
2. Use future date: `12/34`
3. Verify Polar dashboard is in test mode
4. Check Polar account has no restrictions

---

### Issue 3: Webhook Not Firing

**Symptoms**: No logs in console after payment

**Why This Happens**:
- Local development: Polar can't reach localhost
- Webhook URL not configured in Polar
- This is NORMAL for local testing

**Solutions**:

**Option A: Use Polar Webhook Simulator** (Recommended)
1. Go to: https://polar.sh/dashboard/ferryhinardi
2. Navigate to: Developers → Webhooks
3. Click "Send Test Event"
4. Select: `checkout.completed`
5. Click "Send"

**Option B: Deploy to Vercel** (For production testing)
1. Deploy your app to Vercel
2. Get production URL: `https://supertool.id`
3. Configure webhook URL in Polar: `https://supertool.id/api/webhooks/polar`
4. Test with real checkout

**Option C: Use ngrok** (For local webhook testing)
1. Install ngrok: `brew install ngrok` (macOS)
2. Start ngrok: `ngrok http 3000`
3. Copy ngrok URL (e.g., `https://abc123.ngrok.io`)
4. Configure in Polar: `https://abc123.ngrok.io/api/webhooks/polar`
5. Test checkout again

---

### Issue 4: Email Not Received

**Symptoms**: No email in inbox or spam

**Debugging**:
1. Check server console logs for email sending
2. Look for: `✓ Email sent successfully: [email_id]`
3. If email ID exists, check Resend dashboard

**Solutions**:
1. **Check Resend dashboard**: https://resend.com/emails
   - Find email by ID from logs
   - Check delivery status
   
2. **Check spam folder thoroughly**
   - Gmail: Check "Spam" and "Promotions" tabs
   - Outlook: Check "Junk Email" folder
   
3. **Verify Resend API key**:
   ```bash
   # Check if set
   cat .env.local | grep RESEND_API_KEY
   
   # Verify at: https://resend.com/api-keys
   ```

4. **Test email endpoint again**:
   ```bash
   curl "http://localhost:3000/api/test/email?to=hinardi93@gmail.com&amount=1500"
   ```

---

### Issue 5: Recent Supporters Not Updating

**Symptoms**: New donation doesn't appear in list

**Debugging**:
1. Check if order was saved to database (Step 9)
2. Verify database query is working
3. Check browser console for errors

**Solutions**:

1. **Refresh page**: Press F5 or Cmd+R
   - Component is server-side rendered
   - Needs page reload to fetch new data

2. **Check database query**:
   ```sql
   -- In Supabase dashboard
   SELECT customer_name, amount, created_at, status 
   FROM orders 
   WHERE status = 'succeeded' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

3. **Verify order status is 'succeeded'**:
   - Only successful orders appear
   - Failed/pending orders are filtered out

4. **Check component**:
   ```bash
   # Restart dev server
   pkill -f "next dev"
   pnpm dev
   ```

---

### Issue 6: Name Not Anonymized

**Symptoms**: Full name shows instead of "First L."

**Expected Behavior**:
- Input: "John Doe"
- Display: "John D."

**Debugging**:
1. Check `lib/utils/privacy.ts` exists
2. Verify `anonymizeName()` function is correct
3. Check import in `RecentSupporters.tsx`

**Solution**:
```bash
# Check anonymization function
cat lib/utils/privacy.ts

# Restart dev server
pnpm dev
```

---

## 📊 Expected Console Output (Full Flow)

**Browser Console** (DevTools → Console):
```
[Checkout API] Creating checkout for amount: 1500
[Checkout API] Checkout session created: cs_test_abc123
[Checkout API] Redirecting to Polar...
```

**Server Console** (Terminal):
```
Starting checkout for product: prod_abc123
✓ Checkout session created: cs_test_abc123
POST /api/checkout 200 in 1234ms

[Polar Webhook] Received webhook event: checkout.completed
[Polar Webhook] Validating webhook signature...
[Polar Webhook] Processing checkout event
[Order Service] Creating new order: ord_abc123
[Order Service] Saving to database...
[Order Service] Order created successfully: ord_abc123
[Email Service] Sending thank you email to: hinardi93@gmail.com
✓ Email sent successfully: em_abc123
[Polar Webhook] Checkout processed successfully
POST /api/webhooks/polar 200 in 2345ms
```

**No Errors**: If you see these messages without errors, everything is working!

---

## 🎯 Testing Scenarios

### Scenario 1: Small Donation ($5)
- Select: "Small Coffee" tier
- Amount: $5.00
- Test: Minimum donation tier works

### Scenario 2: Medium Donation ($20)
- Select: "Big Lunch" tier
- Amount: $20.00
- Test: Medium tier works

### Scenario 3: Large Donation ($50)
- Select: "Generous Support" tier
- Amount: $50.00
- Test: Large tier works

### Scenario 4: Custom Amount
- Select: "Other Amount"
- Enter: $15 (or any amount)
- Test: Custom amount input works

### Scenario 5: Multiple Donations
- Complete 2-3 test donations
- Test: Recent Supporters shows multiple entries
- Verify: Ordered by most recent first

---

## 📸 Screenshot Checklist

Take screenshots for documentation:

1. **Support page** - Full page view
2. **Donation form** - With tier selected
3. **Polar checkout** - Payment page
4. **Success redirect** - Back to SuperTool
5. **Email received** - In inbox/spam
6. **Email content** - Beautiful HTML template
7. **Recent Supporters** - With your donation listed
8. **Server logs** - Console output showing success

---

## 🚀 After Successful Testing

Once all tests pass:

1. **Document any issues** found during testing
2. **Commit any fixes** made during testing
3. **Update test results** in `TESTING_RESULTS_DONATION_SYSTEM.md`
4. **Prepare for production deployment**:
   - Configure custom domain in Resend
   - Update environment variables
   - Delete test endpoint
   - Deploy to Vercel

---

## 💡 Tips for Smooth Testing

1. **Keep DevTools open**: Monitor console for errors
2. **Check both consoles**: Browser AND server
3. **Test multiple times**: Ensure consistency
4. **Use different amounts**: Test various donation tiers
5. **Document everything**: Take notes of any issues
6. **Test on different browsers**: Chrome, Firefox, Safari
7. **Test on mobile**: Responsive design verification
8. **Clear cache if needed**: Hard refresh with Cmd+Shift+R

---

## ✅ Final Verification

Before marking testing complete:

```bash
# Run type check
pnpm exec tsc --noEmit

# Run linter
pnpm lint

# Check for any uncommitted changes
git status

# Review recent commits
git log --oneline -5
```

All should pass without errors!

---

## 📞 Need Help?

If you encounter issues:

1. **Check logs carefully**: Most issues show up in logs
2. **Review error messages**: They usually indicate the problem
3. **Consult documentation**: 
   - `docs/EMAIL_DELIVERABILITY_GUIDE.md`
   - `docs/TESTING_RESULTS_DONATION_SYSTEM.md`
4. **Check Polar dashboard**: Verify orders are appearing
5. **Check Resend dashboard**: Verify emails are sending

**Testing should take approximately 10-15 minutes for complete flow.**

Good luck! 🍀
