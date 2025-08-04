# 🌱 Database Seed Guide

## 📋 What the Seed Script Creates

### 🔑 Admin User
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** admin
- **Status:** approved

### 👥 Regular Users (5 users)
- **john@example.com** - password123
- **jane@example.com** - password123
- **mike@example.com** - password123
- **sarah@example.com** - password123
- **david@example.com** - password123

All users are created with:
- **Role:** user
- **Status:** approved
- **Password:** password123 (hashed)

## 🚀 How to Run the Seed

### Command Line
```bash
npm run seed
```

This will:
- ✅ Create admin user
- ✅ Create 5 regular users
- ✅ Approve all users
- ✅ Show you all credentials
- ✅ Verify the setup

## 🎯 Expected Results

After running the seed:
- ✅ 1 admin user in database
- ✅ 5 regular users in database
- ✅ All users are approved
- ✅ All users can login immediately
- ✅ Total of 6 users ready to use

## 📋 Complete User List

After seeding, you'll have:

### Admin
- **admin@example.com** - admin123

### Regular Users
- **john@example.com** - password123
- **jane@example.com** - password123
- **mike@example.com** - password123
- **sarah@example.com** - password123
- **david@example.com** - password123

## 🔧 What the Script Does

1. **Connects to database** using DATABASE_URL
2. **Creates admin user** with admin role
3. **Creates 5 regular users** with user role
4. **Approves all users** immediately
5. **Verifies all users** exist in database
6. **Shows credentials** for easy access

## 📞 If Seed Fails

1. **Check DATABASE_URL** - Ensure it's set correctly
2. **Run database setup first** - `npm run force-setup`
3. **Check database connection** - Verify tables exist
4. **Check logs** - Look for specific error messages

## 🎯 Quick Test

1. **Run seed:** `npm run seed`
2. **Visit app:** Go to your deployed app
3. **Test admin login:** admin@example.com / admin123
4. **Test user login:** john@example.com / password123
5. **Verify:** All users should login successfully

The seed script creates a complete set of test users for development and testing purposes. 