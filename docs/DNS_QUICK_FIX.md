# DNS Quick Fix for supertool.id - Invalid Configuration

## Current Problem
Your domain `supertool.id` shows "Invalid Configuration" in Vercel dashboard.

## Root Cause
DNS records are pointing to **wrong IP addresses**:
- ❌ Current: `13.248.243.5` and `76.223.105.230` (old service)
- ✅ Required: `76.76.21.21` (Vercel)

---

## Quick Fix Steps (5 minutes)

### 1. Login to GoDaddy
- Go to: https://dcc.godaddy.com/
- Navigate to: **My Products** → **Domains** → **supertool.id** → **DNS**

### 2. Delete ALL Old A Records
Look for records that look like this:
```
Type: A    Name: @    Value: 13.248.243.5      [DELETE THIS]
Type: A    Name: @    Value: 76.223.105.230    [DELETE THIS]
```
- Click the **trash/delete icon** on each
- Confirm deletion

### 3. Add New A Record for Root Domain
Click "Add" and fill in:
```
Type:  A
Name:  @
Value: 76.76.21.21
TTL:   600 seconds
```
Click **Save**

### 4. Update WWW Subdomain
If you have:
```
Type: CNAME    Name: www    Value: supertool.id    [DELETE THIS]
```
Delete it, then add:
```
Type:  A
Name:  www
Value: 76.76.21.21
TTL:   600 seconds
```
Click **Save**

---

## Verification (After 10-30 minutes)

### Check DNS from Terminal:
```bash
# Check root domain
dig supertool.id A +short
# Expected: 76.76.21.21

# Check www subdomain
dig www.supertool.id A +short
# Expected: 76.76.21.21
```

### Check Vercel Dashboard:
- Go to: https://vercel.com/ferryhinardis-projects/supertool/settings/domains
- Wait for "Invalid Configuration" warning to disappear
- Status should show green checkmark ✅

### Test in Browser:
```
https://supertool.id      → Should load your site
https://www.supertool.id  → Should load your site
```

---

## What Your DNS Should Look Like After Fix

```
Type    Name    Value           TTL          Status
─────   ─────   ─────────────   ──────────   ──────
A       @       76.76.21.21    600 seconds   ✅
A       www     76.76.21.21    600 seconds   ✅
NS      @       ns43.domaincontrol.com   1h  ✅ (keep)
NS      @       ns44.domaincontrol.com   1h  ✅ (keep)
```

**Note:** NS records are nameservers - do NOT delete these!

---

## Timeline

| Time | What Happens |
|------|--------------|
| 0 min | You save DNS changes in GoDaddy |
| 5-10 min | DNS starts propagating globally |
| 15-30 min | `dig` command shows new IP |
| 30-60 min | Vercel verifies and removes "Invalid" warning |
| 1-2 hours | SSL certificate auto-provisions |
| 2-48 hours | Full global DNS propagation complete |

**Most cases:** Working within 30 minutes ⚡

---

## Still Not Working?

### If DNS shows correct IP but Vercel still shows "Invalid":

1. **Wait 30 more minutes** - Vercel checks periodically
2. **Try removing and re-adding domain:**
   ```bash
   vercel domains rm supertool.id
   vercel domains rm www.supertool.id
   vercel domains add supertool.id supertool
   vercel domains add www.supertool.id supertool
   ```

3. **Check DNSSEC** (in GoDaddy Domain Settings):
   - If enabled, try disabling temporarily
   - Save and wait 30 minutes

### If DNS still shows old IPs after 1 hour:

1. **Clear your local DNS cache:**
   ```bash
   # Mac
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   ```

2. **Verify changes were saved in GoDaddy:**
   - Log back into GoDaddy DNS Management
   - Confirm A records show `76.76.21.21`
   - If not saved, try different browser

3. **Use online checker:**
   - https://www.whatsmydns.net/
   - Enter: `supertool.id`
   - Type: `A`
   - Should show `76.76.21.21` globally

---

## Screenshot Guide

When updating in GoDaddy, you should see something like:

```
┌───────────────────────────────────────────────┐
│ DNS Records for supertool.id                  │
├───────────────────────────────────────────────┤
│                                                │
│  [+ Add] button                                │
│                                                │
│  Type  Name   Value          TTL    Actions   │
│  ───────────────────────────────────────────  │
│  A     @      76.76.21.21   600    [✏️] [🗑️]  │
│  A     www    76.76.21.21   600    [✏️] [🗑️]  │
│  NS    @      ns43.domain..  1h     [✏️]      │
│  NS    @      ns44.domain..  1h     [✏️]      │
│                                                │
└───────────────────────────────────────────────┘
```

**Key Points:**
- Only TWO A records (@ and www)
- Both pointing to `76.76.21.21`
- NO old IPs remaining
- NS records unchanged

---

## Need Help?

**Full documentation:** See `docs/DOMAIN_SETUP_GODADDY.md`

**Support:**
- GoDaddy: https://www.godaddy.com/help (live chat available)
- Vercel: https://vercel.com/support
- DNS Checker: https://www.whatsmydns.net/

---

## After It's Working

Once configured correctly, you'll have:

✅ **https://supertool.id** - Your custom domain  
✅ **https://www.supertool.id** - WWW subdomain  
✅ **Automatic SSL** - Secure HTTPS with padlock  
✅ **Global CDN** - Fast worldwide via Vercel Edge  
✅ **nuqs Integration** - Shareable tool URLs with state  

Example working URL:
```
https://supertool.id/tools/base64?mode=encode&input=Hello
```

🎉 **Your SuperTool will be live!**
