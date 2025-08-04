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
      <div className="container-mobile max-w-7xl mx-auto py-8 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-mobile-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Todo App
          </h1>
          <p className="text-mobile text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            A full-stack todo application with authentication, real-time notifications, 
            and role-based access control. Built with Next.js 14, Drizzle ORM, and shadcn/ui.
          </p>
          <div className="flex-mobile gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="btn-mobile">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg" className="btn-mobile">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid-mobile mb-12 sm:mb-16">
          <Card>
            <CardHeader>
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle className="text-mobile-lg">Task Management</CardTitle>
              <CardDescription className="text-mobile">
                Create, update, and organize your todos with ease
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-mobile-lg">User Management</CardTitle>
              <CardDescription className="text-mobile">
                Admin approval system with role-based access control
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-600 mb-2" />
              <CardTitle className="text-mobile-lg">Real-time Updates</CardTitle>
              <CardDescription className="text-mobile">
                Get instant notifications when tasks are completed
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle className="text-mobile-lg">Secure Authentication</CardTitle>
              <CardDescription className="text-mobile">
                NextAuth.js with password hashing and session management
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card className="mb-12 sm:mb-16">
          <CardHeader>
            <CardTitle className="text-mobile-lg">Built with Modern Technologies</CardTitle>
            <CardDescription className="text-mobile">
              This application is built using the latest web technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid-mobile">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">Next.js 14</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">App Router</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">Drizzle ORM</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type-safe SQL</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">PostgreSQL</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Database</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">shadcn/ui</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Components</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features List */}
        <div className="grid-mobile">
          <Card>
            <CardHeader>
              <CardTitle className="text-mobile-lg">Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Email/password authentication</li>
                <li>• Admin approval system</li>
                <li>• Role-based access control</li>
                <li>• Secure session management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-mobile-lg">Todo Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Create, read, update, delete todos</li>
                <li>• Filter by status and priority</li>
                <li>• Due date tracking</li>
                <li>• Real-time updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-mobile-lg">Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• User management</li>
                <li>• Approval/rejection system</li>
                <li>• Statistics and analytics</li>
                <li>• Todo monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-mobile-lg">Real-time Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Live notifications</li>
                <li>• Instant updates</li>
                <li>• Pusher integration</li>
                <li>• Cross-device sync</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 