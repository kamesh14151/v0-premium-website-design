# 🔧 Fix Email Confirmation Redirect

## Problem
Email confirmation links are redirecting to `localhost` instead of your production domain.

## Solution

### Step 1: Update Supabase Redirect URLs

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard/project/hqfgblqxcqowiudrfioi

2. Navigate to **Authentication** → **URL Configuration**

3. Add the following URLs:

   **Site URL:**
   ```
   https://v0-developer-portal-design-azure.vercel.app
   ```

   **Redirect URLs (add all of these):**
   ```
   https://v0-developer-portal-design-azure.vercel.app/api/auth/callback
   https://v0-developer-portal-design-azure.vercel.app/dashboard
   https://v0-developer-portal-design-azure.vercel.app/auth/callback
   http://localhost:3000/api/auth/callback
   http://localhost:3000/dashboard
   ```

4. Click **Save**

### Step 2: Update Email Templates

1. In Supabase Dashboard → **Authentication** → **Email Templates**

2. For **Confirm signup** template, update the confirmation link:

   Replace:
   ```
   {{ .ConfirmationURL }}
   ```

   With:
   ```
   https://v0-developer-portal-design-azure.vercel.app/api/auth/callback?token_hash={{ .TokenHash }}&type=signup&next=/dashboard
   ```

3. For **Magic Link** template:
   ```
   https://v0-developer-portal-design-azure.vercel.app/api/auth/callback?token_hash={{ .TokenHash }}&type=magiclink&next=/dashboard
   ```

4. For **Password Recovery** template:
   ```
   https://v0-developer-portal-design-azure.vercel.app/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/dashboard
   ```

5. Click **Save** for each template

### Step 3: Redeploy Application

The auth callback route has already been created and pushed to GitHub. Vercel will auto-deploy.

Or manually redeploy:
```powershell
vercel --prod
```

---

## ✅ What Was Fixed

1. ✅ Created `/api/auth/callback` route to handle email confirmations
2. ✅ Created `/auth/error` page for failed confirmations
3. ✅ Added `NEXT_PUBLIC_SITE_URL` environment variable
4. ✅ Configured proper redirect handling

---

## 🧪 Test Email Confirmation

1. Register a new user
2. Check email inbox
3. Click confirmation link
4. Should redirect to: `https://v0-developer-portal-design-azure.vercel.app/dashboard`
5. User should be logged in automatically

---

## 🔍 Troubleshooting

### Still Redirecting to Localhost?

1. **Clear browser cache and cookies**
2. **Check Supabase redirect URLs** are saved correctly
3. **Wait 1-2 minutes** for Supabase config to propagate
4. **Try in incognito/private window**

### Email Link Expired?

- Links expire after 1 hour by default
- Register again to get a new confirmation email

### Getting Error Page?

- Check Supabase logs: Dashboard → Logs → Auth Logs
- Verify token_hash is present in URL
- Check that email template uses correct URL format

---

## 📧 Custom Domain Email Links (Optional)

If you add a custom domain like `ai.ajstudioz.com`:

1. Update **Site URL** in Supabase to your custom domain
2. Update all email templates with custom domain
3. Add custom domain to **Redirect URLs** list
4. Redeploy application

---

## ✅ Current Configuration

**Production URL**: https://v0-developer-portal-design-azure.vercel.app

**Auth Callback Route**: `/api/auth/callback`

**Redirect After Confirmation**: `/dashboard`

**Error Page**: `/auth/error`

---

**After making these changes in Supabase Dashboard, email confirmations will work correctly!** 🎉
