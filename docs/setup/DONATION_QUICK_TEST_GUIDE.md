# 🚀 Quick Test Guide - Donation Flow

## ⚡ 5-Minute Quick Test

### Step 1: Open Support Page
```
http://localhost:3000/support
```

### Step 2: Make Test Donation
- **Select**: Any tier (e.g., "Small Coffee - $5")
- **Name**: Test Donor
- **Email**: hinardi93@gmail.com
- **Click**: "Proceed to Payment"

### Step 3: Complete Payment on Polar
```
Test Card: 4242 4242 4242 4242
Expiry:    12/34
CVC:       123
```
Click "Pay Now"

### Step 4: Verify Success
1. ✅ Redirected back to SuperTool
2. ✅ Check terminal logs:
   ```
   [Polar Webhook] Checkout processed successfully
   ✓ Email sent successfully: [id]
   ```
3. ✅ Check spam folder for email
4. ✅ Refresh page → See your name in "Recent Supporters"

---

## 🎯 Expected Results

| Check | Expected | Location |
|-------|----------|----------|
| Payment | Succeeds | Polar page |
| Redirect | Back to /support | Browser |
| Webhook | Logs appear | Terminal |
| Database | Order saved | Supabase |
| Email | Received | Spam folder |
| UI | Name appears | Recent Supporters |

---

## 🐛 Quick Troubleshooting

**No redirect to Polar?**
→ Check browser console for errors

**No webhook logs?**
→ Normal for localhost (webhook can't reach local)
→ Check database anyway or manually trigger

**No email?**
→ Check spam folder (90% of cases)
→ Check terminal for email ID

**Not in Recent Supporters?**
→ Refresh page (F5)
→ Check database order status = 'succeeded'

---

## 📊 Console Output to Look For

**Success Pattern**:
```
✓ Checkout session created
[Polar Webhook] Processing checkout event
[Order Service] Order created successfully
✓ Email sent successfully: em_abc123
[Polar Webhook] Checkout processed successfully
```

**Any errors?** See `MANUAL_DONATION_FLOW_TEST.md` for detailed troubleshooting.

---

## ✅ Quick Verification Checklist

- [ ] Support page loads
- [ ] Donation form works
- [ ] Polar checkout opens
- [ ] Payment succeeds
- [ ] Webhook processes (check logs)
- [ ] Email arrives (check spam)
- [ ] Recent Supporters updates

**All checked?** ✨ System working perfectly!

---

Full guide: `docs/setup/MANUAL_DONATION_FLOW_TEST.md`
