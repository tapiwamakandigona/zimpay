# 🚨 CRITICAL SECURITY HOTFIX INSTRUCTIONS

**Date:** 2026-01-13  
**Severity:** CRITICAL  
**Status:** READY TO APPLY

---

## Overview

This hotfix addresses **2 critical vulnerabilities** discovered during the Deep Vertical Improvement audit:

1. **Public data exposure**: All user profiles (emails, names, phone numbers) were publicly readable
2. **Unauthorized transaction injection**: Anyone could insert fake transaction records

---

## Step 1: Apply Supabase RLS Policy Fixes

### Option A: Via Supabase Dashboard (Recommended)

1. Log into [Supabase Dashboard](https://supabase.com/dashboard/project/ilhwoebtxxkudihfgmub)
2. Navigate to **Database** → **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of [`supabase/migrations/001_fix_rls_policies.sql`](file:///C:/Users/Tapiwa/Desktop/Coding%20Projects/zimpay/supabase/migrations/001_fix_rls_policies.sql)
5. Paste into the SQL editor
6. Click **Run** (bottom right)
7. Verify success message: "Success. No rows returned"

### Option B: Via Supabase CLI

```bash
cd C:\Users\Tapiwa\Desktop\Coding Projects\zimpay
supabase db push
```

---

## Step 2: Verify RLS Policies Are Active

### Test from Supabase Dashboard

1. Go to **Database** → **Policies**
2. Verify the following policies exist:

**Profiles Table:**
- ✅ "Users can view own profile" (SELECT)
- ✅ "Users can update own profile" (UPDATE)
- ✅ "Users can insert own profile" (INSERT)

**Transactions Table:**
- ✅ "Authenticated users can create own transactions" (INSERT)
- ✅ "Users can view their transactions" (SELECT)

**ZimBet Matches:**
- ✅ "Users can create own matches" (INSERT)
- ✅ "Users can view matches they're in" (SELECT)
- ✅ "Users can update matches they're in" (UPDATE)

### Test from Application

1. Open ZimPay in an **incognito window** (logged out)
2. Open browser DevTools → Console
3. Try to fetch profiles:
   ```javascript
   fetch('https://ilhwoebtxxkudihfgmub.supabase.co/rest/v1/profiles', {
     headers: {
       'apikey': 'YOUR_ANON_KEY',
       'Authorization': 'Bearer YOUR_ANON_KEY'
     }
   }).then(r => r.json()).then(console.log)
   ```
4. **Expected Result:** Empty array `[]` or authorization error (no user data returned)
5. **FAIL Condition:** If you see user emails/names, RLS policies didn't apply correctly

---

## Step 3: Monitor for Breaking Changes

### Expected Behavior Changes

After applying this hotfix:

✅ **What Still Works:**
- Users can sign up and create profiles
- Users can view their own profile
- Users can send transactions from their own account
- Users can view transactions they sent or received
- ZimBet leaderboard still shows public scores

⚠️ **What Breaks (Intended):**
- Admin dashboards that list all users (you'll need to create an admin role)
- Any frontend code that fetches all profiles without authentication
- External scripts trying to read transaction data

### Check Your Frontend Code

Search for these patterns that might break:

```bash
# From zimpay directory
grep -r "from('profiles').select()" src/
grep -r "from('transactions').insert()" src/
```

If found, verify those queries:
1. **Are wrapped in authenticated contexts** (`useAuth()` hook)
2. **Include user ID filters** (`.eq('id', user.id)`)

---

## Step 4: Document the Change

Add this to your project README:

```markdown
## Security Requirements

- All database access requires authentication
- Users can only access their own profile and transactions
- Row Level Security (RLS) is enabled on all tables
```

---

## Rollback Plan (If Issues Arise)

If this migration causes critical breakage:

1. Navigate to **Database** → **SQL Editor**
2. Run this rollback script:

```sql
-- EMERGENCY ROLLBACK: Re-enable public access (temporary)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create own transactions" ON transactions;
CREATE POLICY "Enable insert for public" ON transactions FOR INSERT WITH CHECK (true);
```

3. **CRITICAL:** Only use rollback temporarily. You MUST re-apply proper RLS policies ASAP.

---

## Next Steps After Applying

Once RLS policies are confirmed working:

1. ✅ Delete old insecure policies from Supabase dashboard
2. ✅ Test ZimPay signup/login/transaction flow on mobile
3. ✅ Proceed to **Hotfix #2: Environment Variables** (see next section)

---

## Questions?

If you encounter issues:
- Check Supabase logs: **Database** → **Logs** → **Postgres Logs**
- Look for `policy violation` errors
- Verify your frontend code is passing `auth.uid()` correctly
