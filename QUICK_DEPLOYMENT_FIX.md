# 🚀 Quick Deployment Fix

## ❌ Problem
You're getting this error in deployment:
```
relation "users" does not exist
```

## ✅ Immediate Solution

### Step 1: Deploy the Fix
```bash
git add .
git commit -m "Fix database deployment with force setup"
git push origin main
```

The build process will now automatically create the database tables.

### Step 2: If Tables Still Don't Exist

**Option A: Call the Setup API**
After deployment, visit this URL in your browser:
```
https://your-app.vercel.app/api/setup-database
```

**Option B: Run Force Setup Script**
```bash
npm run force-setup
```

**Option C: Manual SQL**
Connect to your database and run:
```sql
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

## 🔧 Environment Variables

Make sure these are set in Vercel:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_URL` - Your app's URL
- `NEXTAUTH_SECRET` - A random secret string

## 🧪 Test the Fix

After setup, test with:
```bash
npm run test-db
```

Or try creating a user through the signup form.

## 🎯 Expected Result

After the fix:
- ✅ User registration works
- ✅ Admin login works (admin@example.com / admin123)
- ✅ No more "relation does not exist" errors

## 📞 If Still Having Issues

1. Check Vercel deployment logs
2. Verify DATABASE_URL is correct
3. Test database connectivity
4. Run `npm run force-setup` locally with your DATABASE_URL

The solution includes multiple fallback options to ensure your database is properly set up. 