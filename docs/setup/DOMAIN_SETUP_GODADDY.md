# GoDaddy DNS Setup Guide for Vercel

## Step-by-Step Instructions to Configure supertool.id

### Current Issue
Your domain `supertool.id` is currently pointing to the wrong IP addresses:
- Current IPs: `13.248.243.5` and `76.223.105.230` (likely AWS or old service)
- Required IP: `76.76.21.21` (Vercel)

---

## Step 1: Access GoDaddy DNS Management

1. **Go to GoDaddy Domain Management**
   - Visit: https://account.godaddy.com/
   - Or: https://dcc.godaddy.com/
   
2. **Sign in** with your GoDaddy account

3. **Navigate to your domain**
   - Click on "My Products" or "Domains"
   - Find `supertool.id` in your domain list
   - Click on the domain name or click "DNS" button next to it

4. **Open DNS Management**
   - You should see a button labeled "DNS" or "Manage DNS"
   - Click it to access the DNS records page

---

## Step 2: Identify Current DNS Records

You should see a list of DNS records. Look for these:

### Current Records (TO BE CHANGED):
```
Type    Name    Value                   TTL
A       @       13.248.243.5           600
A       @       76.223.105.230         600
CNAME   www     supertool.id           1 Hour
```

---

## Step 3: Update the Root Domain (@) A Records

### Option A: If you see "Edit" buttons:
1. **Find the A record with Name "@" or blank**
   - Click the **pencil/edit icon** next to it
   
2. **Update the Value field**
   - Change from: `13.248.243.5` or `76.223.105.230`
   - Change to: `76.76.21.21`
   - Set TTL to: `600` seconds (or 10 minutes)
   
3. **Click "Save"**

4. **If there are multiple A records for @:**
   - Edit the first one to `76.76.21.21`
   - **Delete** the second one (click trash/delete icon)
   - Keep only ONE A record for @ pointing to `76.76.21.21`

### Option B: If you need to delete and recreate:
1. **Delete existing A records**
   - Find all A records with Name "@" or blank
   - Click the **trash icon** next to each one
   - Confirm deletion

2. **Add new A record**
   - Click "Add" or "Add Record" button
   - Select Type: **A**
   - Name: `@` (or leave blank - represents root domain)
   - Value/Points to: `76.76.21.21`
   - TTL: `600` seconds
   - Click "Save"

---

## Step 4: Update the WWW Subdomain

### If you have a CNAME record for "www":
1. **Find the CNAME record**
   - Name: `www`
   - Type: `CNAME`
   - Points to: `supertool.id` or similar

2. **Delete this CNAME record**
   - Click the **trash/delete icon**
   - Confirm deletion

### Add A Record for www:
1. **Click "Add" or "Add Record"**
   
2. **Fill in the details:**
   - Type: **A**
   - Name: `www`
   - Value/Points to: `76.76.21.21`
   - TTL: `600` seconds
   
3. **Click "Save"**

---

## Step 5: Final DNS Records (What You Should Have)

After all changes, your DNS records should look like this:

```
Type    Name    Value           TTL
A       @       76.76.21.21    600 seconds
A       www     76.76.21.21    600 seconds
```

### Other records you might see (KEEP THESE):
```
Type    Name    Value                           TTL
NS      @       ns43.domaincontrol.com         1 hour
NS      @       ns44.domaincontrol.com         1 hour
SOA     @       (GoDaddy's SOA record)         1 hour
```

**Note:** Do NOT delete NS (nameserver) or SOA records!

---

## Step 6: Save and Wait for Propagation

1. **Save all changes** in GoDaddy

2. **DNS Propagation Time:**
   - Minimum: 5-30 minutes
   - Maximum: 24-48 hours
   - Usually: Within 1 hour

3. **Check propagation status:**
   - Use: https://www.whatsmydns.net/
   - Enter: `supertool.id`
   - Type: `A`
   - Should show: `76.76.21.21` globally

---

## Step 7: Verify Configuration

### From your terminal:

```bash
# Check root domain
dig supertool.id A +short
# Expected output: 76.76.21.21

# Check www subdomain
dig www.supertool.id A +short
# Expected output: 76.76.21.21

# Alternative check using nslookup
nslookup supertool.id
# Should show: 76.76.21.21
```

### Check Vercel Dashboard:

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/ferryhinardis-projects/supertool
   - Click "Settings" → "Domains"

2. **Wait for verification**
   - "Invalid Configuration" warning should disappear
   - Status should change to "Valid" with a green checkmark
   - SSL certificate will be automatically provisioned

---

## Step 8: Test Your Website

Once DNS has propagated and Vercel shows "Valid":

1. **Visit your domain:**
   - https://supertool.id
   - https://www.supertool.id

2. **Both should:**
   - Load your SuperTool website
   - Show a secure SSL certificate (padlock icon)
   - Redirect to HTTPS automatically

---

## Common Issues & Troubleshooting

### Issue 1: "Invalid Configuration" still showing after 1 hour
**Solution:**
- Run `dig supertool.id A +short` to verify DNS
- If still showing old IPs, clear your DNS cache:
  - Mac: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
  - Windows: `ipconfig /flushdns`
- Check GoDaddy again to ensure changes were saved

### Issue 2: DNS records showing multiple old IPs
**Current situation:** Your domain shows two incorrect IPs:
- `13.248.243.5` (old service)
- `76.223.105.230` (old service)

**Solution:**
1. In GoDaddy DNS Management, look for ALL A records with Name "@"
2. You may see multiple entries - **delete ALL of them**
3. Add ONE new A record: `@` → `76.76.21.21`
4. Save and wait 10-30 minutes
5. Verify with: `dig supertool.id A +short` (should show only one IP)

**Why this happens:**
- GoDaddy allows multiple A records for load balancing
- Vercel only needs ONE A record pointing to their IP
- Old A records must be completely removed

### Issue 3: www subdomain not working
**Solution:**
- Ensure you have an A record (not CNAME) for `www`
- Both @ and www should point to `76.76.21.21`

### Issue 4: SSL certificate error
**Solution:**
- Wait 5-10 minutes after DNS verification
- Vercel provisions SSL automatically
- Try accessing via incognito/private browsing

### Issue 5: Changes not saving in GoDaddy
**Solution:**
- Make sure you clicked "Save" or "Save Changes"
- Try using a different browser
- Clear browser cache
- Contact GoDaddy support if issues persist

### Issue 6: Vercel shows "Domain is not configured correctly"
**Solution:**
1. **Verify DNS is correct first:**
   ```bash
   dig supertool.id A +short
   # Must show: 76.76.21.21 (ONLY this IP)
   ```

2. **If DNS is correct but Vercel still shows error:**
   - Wait 15-30 minutes for Vercel to re-check
   - Try removing and re-adding the domain:
     ```bash
     vercel domains rm supertool.id
     vercel domains add supertool.id supertool
     ```

3. **If domain was recently transferred or updated:**
   - DNS changes can take up to 48 hours
   - Check propagation: https://www.whatsmydns.net/

4. **Check for DNSSEC issues:**
   - In GoDaddy, go to Domain Settings
   - Find "DNSSEC" section
   - If enabled, try disabling it temporarily
   - Wait 30 minutes and check again

---

## Alternative: Using Vercel Nameservers (Optional)

If you prefer Vercel to manage all DNS records:

### Change Nameservers in GoDaddy:

1. **Go to Domain Settings** (not DNS Management)
   - Find "Nameservers" section
   - Click "Change" or "Manage"

2. **Select "Custom Nameservers"**

3. **Enter Vercel's nameservers:**
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

4. **Remove GoDaddy nameservers:**
   - Delete `ns43.domaincontrol.com`
   - Delete `ns44.domaincontrol.com`

5. **Save changes**

**Note:** This method gives Vercel full control of your DNS. The A record method (recommended above) is simpler and lets you keep other DNS records on GoDaddy.

---

## Summary Checklist

- [ ] Logged into GoDaddy account
- [ ] Accessed DNS Management for supertool.id
- [ ] Updated/Added A record for @ → 76.76.21.21
- [ ] Deleted old A records (13.248.243.5, 76.223.105.230)
- [ ] Deleted CNAME record for www (if exists)
- [ ] Added A record for www → 76.76.21.21
- [ ] Saved all changes in GoDaddy
- [ ] Waited 15-30 minutes for propagation
- [ ] Verified DNS using `dig` command
- [ ] Checked Vercel dashboard shows "Valid"
- [ ] Tested https://supertool.id in browser
- [ ] Tested https://www.supertool.id in browser

---

## Visual Reference

### GoDaddy DNS Management Page Layout:

```
┌─────────────────────────────────────────────────────┐
│ DNS Management for supertool.id                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Add] button                                        │
│                                                      │
│  Type    Name    Value            TTL      Actions  │
│  ────    ────    ─────            ───      ───────  │
│  A       @       76.76.21.21      600      [✏️] [🗑️]│
│  A       www     76.76.21.21      600      [✏️] [🗑️]│
│  NS      @       ns43...           1h       [✏️]     │
│  NS      @       ns44...           1h       [✏️]     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### When Adding a New Record:

```
┌─────────────────────────────────────┐
│ Add DNS Record                      │
├─────────────────────────────────────┤
│                                     │
│  Type:     [A ▼]                    │
│  Name:     [@  ]  .supertool.id     │
│  Value:    [76.76.21.21           ] │
│  TTL:      [600 seconds ▼]          │
│                                     │
│         [Cancel]  [Save]            │
└─────────────────────────────────────┘
```

---

## Need More Help?

If you encounter issues:

1. **Check Vercel's domain documentation:**
   - https://vercel.com/docs/concepts/projects/custom-domains

2. **GoDaddy Support:**
   - https://www.godaddy.com/help
   - Live chat available

3. **DNS Propagation Checker:**
   - https://www.whatsmydns.net/
   - https://dnschecker.org/

4. **Vercel Support:**
   - https://vercel.com/support

---

## After Configuration is Complete

Once your domain is working:

✅ **Your site will be accessible at:**
- https://supertool.id (primary domain)
- https://www.supertool.id (www subdomain)
- https://supertool-two.vercel.app (Vercel subdomain - still works)

✅ **Features enabled:**
- Automatic HTTPS/SSL
- Global CDN via Vercel Edge Network
- Automatic deployment on git push
- Zero-downtime deployments

✅ **nuqs Integration live:**
- All 5 tools with URL state management
- Shareable URLs with persistent state
- Base64, JSON Beautify, Text Transformer, Unit Converter, Password Generator

🎉 **Your SuperTool is now live on your custom domain!**
