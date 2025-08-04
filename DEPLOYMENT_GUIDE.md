# Deployment Guide for Vercel

## Environment Variables Setup

To deploy this application to Vercel, you need to configure the following environment variables in your Vercel dashboard:

### Required Environment Variables

1. **DATABASE_URL**
   - Format: `postgresql://username:password@host:port/database`
   - Example: `postgresql://myuser:mypassword@localhost:5432/todo_app`
   - **Important**: Use a production PostgreSQL database (e.g., Vercel Postgres, Supabase, Railway, etc.)

2. **NEXTAUTH_URL**
   - Format: `https://your-domain.vercel.app`
   - Example: `https://my-todo-app.vercel.app`
   - **Important**: Use your actual Vercel deployment URL

3. **NEXTAUTH_SECRET**
   - Generate a secure random string
   - Example: `your-super-secret-key-here`
   - **Important**: Keep this secret and secure

### Optional Environment Variables

4. **PUSHER_APP_ID** (for real-time notifications)
   - Get from your Pusher dashboard
   - Example: `1234567`

5. **PUSHER_KEY** (for real-time notifications)
   - Get from your Pusher dashboard
   - Example: `abcdef123456`

6. **PUSHER_SECRET** (for real-time notifications)
   - Get from your Pusher dashboard
   - Example: `secret-key-here`

7. **PUSHER_CLUSTER** (for real-time notifications)
   - Get from your Pusher dashboard
   - Example: `us2`

## How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string
   - **Environment**: Production, Preview, Development
5. Repeat for all required variables

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
```

## Database Setup

### Option 1: Vercel Postgres (Recommended)

1. In your Vercel dashboard, go to **Storage**
2. Create a new **Postgres** database
3. Copy the connection string
4. Set it as `DATABASE_URL` environment variable

### Option 2: Supabase

1. Create a Supabase project
2. Go to **Settings** → **Database**
3. Copy the connection string
4. Set it as `DATABASE_URL` environment variable

### Option 3: Railway

1. Create a Railway project
2. Add a PostgreSQL service
3. Copy the connection string
4. Set it as `DATABASE_URL` environment variable

## Database Migration

After setting up your database, you need to run the migrations:

```bash
# Install Drizzle CLI
npm install -g drizzle-kit

# Run migrations
npx drizzle-kit push
```

## Deployment Steps

1. **Push your code to GitHub**
2. **Connect your repository to Vercel**
3. **Set up environment variables** (see above)
4. **Deploy**

## Troubleshooting

### Build Errors

If you see build errors related to `DATABASE_URL`:

1. **Check environment variables**: Ensure all required variables are set in Vercel
2. **Verify database connection**: Test your database connection string
3. **Check database permissions**: Ensure your database user has proper permissions

### Runtime Errors

If you see runtime errors:

1. **Check NEXTAUTH_URL**: Must match your actual deployment URL
2. **Verify NEXTAUTH_SECRET**: Must be a secure random string
3. **Test database connection**: Ensure your database is accessible

### Common Issues

1. **"DATABASE_URL is not defined"**
   - Solution: Add DATABASE_URL to Vercel environment variables

2. **"NEXTAUTH_URL is not defined"**
   - Solution: Add NEXTAUTH_URL to Vercel environment variables

3. **"Database connection failed"**
   - Solution: Check your database connection string and permissions

## Security Notes

- **Never commit environment variables** to your repository
- **Use strong secrets** for NEXTAUTH_SECRET
- **Use production databases** for production deployments
- **Enable SSL** for database connections in production

## Support

If you encounter issues:

1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test your database connection locally
4. Check the application logs for specific error messages 