# 🚀 Production Deployment Guide

## ❌ Current Error: "relation 'users' does not exist"

This error occurs because the database tables haven't been created in your production database. Here's how to fix it:

## 🔧 Quick Fix (Recommended)

### Step 1: Set up Environment Variables in Vercel

1. Go to your Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```
DATABASE_URL=your_production_postgres_connection_string
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your_secret_key_here
```

### Step 2: Run Database Setup

After setting environment variables, run these commands:

```bash
# Option 1: Use the fix script (recommended)
npm run fix-deployment

# Option 2: Manual database setup
npm run db:push
npm run db:init
```

### Step 3: Create Admin User

```bash
npm run create-admin admin@example.com admin123
```

## 🗄️ Database Setup Options

### Option A: Using Drizzle Push (Recommended)

```bash
npm run db:push
```

This will create all tables based on your schema.

### Option B: Using Migrations

```bash
npm run db:migrate
```

This will run the migration files in order.

### Option C: Manual SQL

If the above options don't work, manually run these SQL commands in your database:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "password" text NOT NULL,
  "role" text DEFAULT 'user' NOT NULL,
  "approved" boolean DEFAULT false NOT NULL,
  "rejected" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Create todos table
CREATE TABLE IF NOT EXISTS "todos" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "completed" boolean DEFAULT false NOT NULL,
  "due_date" timestamp,
  "tags" json,
  "priority" text DEFAULT 'medium',
  "user_id" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "todos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);
```

## 🔍 Troubleshooting

### Error: "relation 'users' does not exist"

**Causes:**
- Database tables haven't been created
- Migrations haven't been run
- Database connection issues

**Solutions:**
1. Run `npm run db:push`
2. Check DATABASE_URL is correct
3. Verify database permissions
4. Ensure database is accessible from Vercel

### Error: "DATABASE_URL is not defined"

**Solution:**
1. Set DATABASE_URL in Vercel environment variables
2. Redeploy your application

### Error: "Connection timeout"

**Solutions:**
1. Check if your database allows external connections
2. Verify SSL settings for production
3. Check database connection limits

## 🚀 Deployment Steps

### 1. Prepare Your Code

```bash
git add .
git commit -m "Fix database deployment issues"
git push origin main
```

### 2. Set Environment Variables in Vercel

- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET

### 3. Deploy and Setup Database

```bash
# Deploy to Vercel
git push origin main

# After deployment, run database setup
npm run fix-deployment
```

### 4. Test Your Application

1. Go to your deployed URL
2. Try creating a new user
3. Test admin login
4. Verify all features work

## 📋 Environment Variables Checklist

Make sure these are set in Vercel:

- ✅ `DATABASE_URL` - Your PostgreSQL connection string
- ✅ `NEXTAUTH_URL` - Your app's URL (https://your-app.vercel.app)
- ✅ `NEXTAUTH_SECRET` - A random secret string
- ✅ `NODE_ENV` - Set to "production"

## 🎯 Test Credentials

After setup, you can test with:

- **Admin User:** admin@example.com / admin123
- **Regular User:** Create a new account through signup

## 📞 Support

If you're still having issues:

1. Check the Vercel deployment logs
2. Verify database connectivity
3. Run `npm run fix-deployment` for detailed diagnostics
4. Check the troubleshooting section above

## 🔄 Automatic Database Setup

For future deployments, the database will be automatically initialized. If you need to reset:

```bash
npm run db:init
```

This will ensure all tables are created and migrations are applied. 