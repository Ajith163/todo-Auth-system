# Todo App with Authentication and Admin Dashboard

A full-stack Next.js application with user authentication, admin dashboard, and todo management system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd todo-app

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your database URL and other settings

# Set up database
npm run db:push

# Create admin user
npm run create-admin admin@example.com admin123

# Start development server
npm run dev
```

## 🔧 Fixing Deployment Errors

### Error: "relation 'users' does not exist"

This error occurs when the database tables haven't been created in production. Here's how to fix it:

#### Quick Fix:
```bash
# 1. Set DATABASE_URL in your deployment environment
# 2. Run database setup
npm run fix-deployment

# 3. Or manually run:
npm run db:push
npm run db:init
```

#### Manual SQL Fix:
If the above doesn't work, manually run these SQL commands in your database:

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

## 📋 Environment Variables

Create a `.env.local` file with:

```env
DATABASE_URL=your_postgres_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here
```

## 🗄️ Database Setup

```bash
# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate

# View database in Drizzle Studio
npm run db:studio
```

## 🚀 Deployment

### Vercel Deployment

1. **Set Environment Variables in Vercel:**
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_URL` - Your app's URL (https://your-app.vercel.app)
   - `NEXTAUTH_SECRET` - A random secret string

2. **Deploy and Setup Database:**
   ```bash
   # Deploy to Vercel
   git push origin main
   
   # After deployment, run database setup
   npm run fix-deployment
   ```

3. **Create Admin User:**
   ```bash
   npm run create-admin admin@example.com admin123
   ```

## 🎯 Features

- ✅ User authentication (signup/signin)
- ✅ Admin dashboard with user management
- ✅ Todo CRUD operations
- ✅ User approval system
- ✅ Role-based access control
- ✅ Real-time notifications
- ✅ Responsive design
- ✅ Dark/light theme

## 🔑 Test Credentials

- **Admin:** admin@example.com / admin123
- **Regular User:** Create a new account through signup

## 📖 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Technical Implementation](TECHNICAL_IMPLEMENTATION.md)
- [Requirements Checklist](REQUIREMENTS_CHECKLIST.md)

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio

# User Management
npm run create-admin # Create admin user
npm run approve-user # Approve a user
npm run check-user   # Check user status

# Deployment
npm run deploy       # Full production deployment
npm run fix-deployment # Fix deployment issues
```

## 🔍 Troubleshooting

### Common Issues

1. **"relation 'users' does not exist"**
   - Run: `npm run db:push`
   - Or: `npm run fix-deployment`

2. **"DATABASE_URL is not defined"**
   - Set DATABASE_URL in your environment variables
   - Check your .env.local file

3. **Build errors**
   - Ensure all environment variables are set
   - Check database connectivity

## 📞 Support

If you encounter issues:
1. Check the deployment logs
2. Run `npm run fix-deployment` for diagnostics
3. Verify database connectivity
4. Check environment variables

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md). 