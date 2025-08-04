# 🔑 Default Admin Credentials Setup

## 📋 Default Admin Credentials

**Email:** admin@example.com  
**Password:** admin123  
**Role:** admin  
**Status:** approved

## 🚀 How to Set Up Default Admin

### Option 1: Command Line (Recommended)
```bash
npm run setup-admin
```

This will:
- ✅ Create admin@example.com user
- ✅ Set password to admin123
- ✅ Set role to admin
- ✅ Approve the user
- ✅ Verify the setup

### Option 2: Browser Setup
Visit this URL in your browser:
```
https://your-app.vercel.app/api/setup-admin
```

This will:
- ✅ Create/update admin user
- ✅ Show you the credentials
- ✅ Confirm the setup worked

### Option 3: Manual Database Setup
```bash
npm run force-setup
```

This will:
- ✅ Create database tables
- ✅ Create default admin user
- ✅ Set up all required data

## 🎯 Expected Results

After setup:
- ✅ Admin user exists in database
- ✅ Login works immediately
- ✅ No approval required
- ✅ Full admin access

## 📋 Login Instructions

1. **Go to your app** - https://your-app.vercel.app
2. **Click Sign In**
3. **Enter credentials:**
   - Email: admin@example.com
   - Password: admin123
4. **Click Login** - should work immediately

## 🔧 What Gets Created

The setup creates a user with:
- **Email:** admin@example.com
- **Password:** admin123 (hashed)
- **Role:** admin
- **Approved:** true
- **Created:** current timestamp

## 📞 If Login Doesn't Work

1. **Check if admin exists** - Visit `/api/setup-admin`
2. **Clear browser cache** - Try incognito mode
3. **Deploy the auto-approval fix** - The auth system needs to be updated
4. **Check logs** - Look for any errors

## 🔑 Alternative Admin Setup

If you want different credentials, you can:

1. **Use the API** - POST to `/api/approve-user` with your email
2. **Create manually** - Use the signup form with your preferred email
3. **Update existing** - Use the fix-admin script to approve existing users

## 🎯 Quick Test

1. **Run setup:** `npm run setup-admin`
2. **Visit app:** Go to your deployed app
3. **Login:** Use admin@example.com / admin123
4. **Verify:** Should have admin access immediately

The default admin credentials are simple and secure for development/testing purposes. 