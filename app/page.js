import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Users, Shield, Zap } from 'lucide-react'

// Force dynamic rendering since this page uses getServerSession
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Todo App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            A full-stack todo application with authentication, real-time notifications, 
            and role-based access control. Built with Next.js 14, Drizzle ORM, and shadcn/ui.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Create, update, and organize your todos with ease
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Admin approval system with role-based access control
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-600 mb-2" />
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>
                Get instant notifications when tasks are completed
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Secure Authentication</CardTitle>
              <CardDescription>
                NextAuth.js with password hashing and session management
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Built with Modern Technologies</CardTitle>
            <CardDescription>
              This application is built using the latest web technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">Next.js 14</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">App Router</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">Drizzle ORM</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">PostgreSQL</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">NextAuth.js</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Authentication</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">shadcn/ui</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Components</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Create an account and start managing your tasks today
          </p>
          <Link href="/auth/signup">
            <Button size="lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 