import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            There was an error during the authentication process.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Error Details</CardTitle>
            <CardDescription>
              Please try again or contact support if the problem persists.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Common causes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Invalid email or password</li>
                <li>Account not yet approved by admin</li>
                <li>Network connectivity issues</li>
                <li>Session expired</li>
              </ul>
            </div>
            
            <div className="flex gap-4">
              <Link href="/auth/signin" className="flex-1">
                <Button className="w-full">
                  Try Again
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 