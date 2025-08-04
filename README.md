# Todo App - Full Stack Next.js Application

A comprehensive todo application built with Next.js 14, featuring authentication, real-time notifications, and role-based access control.

## 🚀 Features

### Core Features
- **Authentication System**
  - Email/password authentication with NextAuth.js
  - Admin approval required before access
  - Role-based access: admin and user roles
  - Secure password hashing with bcryptjs

- **Database (PostgreSQL + Drizzle ORM)**
  - Users table: id, email, password, role, approved, created_at
  - Todos table: id, title, description, completed, user_id, created_at, updated_at

- **Todo Management (User Side)**
  - CRUD operations for todos (users can only manage their own todos)
  - Filter by complete/incomplete status
  - Real-time updates and notifications

- **Admin Dashboard**
  - View and approve/reject user registrations
  - Monitor all todos across users (read-only)
  - Statistics: total users, pending users, todo count, completion percentage

### UI/UX Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: Built-in theme switching
- **Modern UI**: Built with shadcn/ui components
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: Comprehensive error boundaries and user feedback

### Technical Features
- **Real-time Notifications**: Pusher integration for instant updates
- **Form Validation**: Zod schema validation with react-hook-form
- **Server Actions**: Next.js 14 server actions for data mutations
- **Type Safety**: Full TypeScript support (optional)
- **Performance**: Optimized with Next.js 14 App Router

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Real-time**: Pusher
- **Form Handling**: react-hook-form + Zod
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/todo_app"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Pusher (for real-time notifications)
   PUSHER_APP_ID="your-pusher-app-id"
   PUSHER_KEY="your-pusher-key"
   PUSHER_SECRET="your-pusher-secret"
   PUSHER_CLUSTER="your-pusher-cluster"
   ```

4. **Set up the database**
   ```bash
   # Generate and run migrations
   npx drizzle-kit generate
   npx drizzle-kit push
   ```

5. **Create an admin user**
   ```bash
   # You'll need to manually create an admin user in the database
   # or modify the signup process to create the first user as admin
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### PostgreSQL Setup
1. Install PostgreSQL on your system
2. Create a new database:
   ```sql
   CREATE DATABASE todo_app;
   ```
3. Update the `DATABASE_URL` in your `.env.local` file

### Database Schema
The application uses two main tables:

**Users Table:**
```sql
- id (serial, primary key)
- email (text, unique)
- password (text, hashed)
- role (text, default: 'user')
- approved (boolean, default: false)
- created_at (timestamp)
```

**Todos Table:**
```sql
- id (serial, primary key)
- title (text)
- description (text, optional)
- completed (boolean, default: false)
- user_id (integer, foreign key)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🔐 Authentication Flow

1. **User Registration**
   - User signs up with email/password
   - Account is created with `approved: false`
   - User cannot sign in until approved

2. **Admin Approval**
   - Admin can view pending users in dashboard
   - Admin can approve or reject users
   - Approved users can sign in

3. **Role-based Access**
   - Users can only manage their own todos
   - Admins can view all todos and manage users

## 📱 Usage

### For Users
1. Sign up for an account
2. Wait for admin approval
3. Sign in and start creating todos
4. Mark todos as complete/incomplete
5. Filter todos by status

### For Admins
1. Sign in with admin credentials
2. View pending user approvals
3. Approve or reject new users
4. Monitor all todo activity
5. View statistics and completion rates

## 🔄 Real-time Features

- **Task Completion Notifications**: Admins receive real-time notifications when users complete tasks
- **Live Updates**: Todo lists update in real-time across all connected clients
- **Pusher Integration**: WebSocket-like functionality for instant updates

## 🎨 UI Components

The application uses shadcn/ui components for a consistent and modern design:

- **Cards**: For displaying content sections
- **Buttons**: Various styles and sizes
- **Inputs**: Form inputs with validation
- **Switches**: Toggle components
- **Toasts**: Notification system
- **Responsive Design**: Mobile-first approach

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Migrations
```bash
npx drizzle-kit generate  # Generate migration files
npx drizzle-kit push      # Push migrations to database
npx drizzle-kit studio    # Open Drizzle Studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

## 🎯 Roadmap

### Planned Features
- [ ] Due dates for todos
- [ ] Todo categories/tags
- [ ] Bulk operations
- [ ] Export functionality (CSV/JSON)
- [ ] Full-text search
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] API documentation
- [ ] Unit and integration tests

### Performance Improvements
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Database query optimization
- [ ] Bundle size optimization

---

**Built with ❤️ using Next.js 14, Drizzle ORM, and shadcn/ui** 