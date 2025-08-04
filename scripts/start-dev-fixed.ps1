# PowerShell script to start the development server (Fixed Version)
Write-Host "🚀 Starting Todo App Development Server..." -ForegroundColor Green

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local not found. Creating a basic one..." -ForegroundColor Yellow
    @"
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/todo_app"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Pusher (optional for development)
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER=""

# Environment
NODE_ENV="development"
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    
    Write-Host "✅ Created .env.local file. Please update DATABASE_URL with your actual database credentials." -ForegroundColor Green
}

# Start the development server
Write-Host "🔥 Starting development server..." -ForegroundColor Green
npm run dev 