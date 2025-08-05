'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { signInSchema } from '@/lib/validations'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(e.target)
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    }

    try {
      const validatedData = signInSchema.parse(data)
      
      const result = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      })

      if (result?.error) {
        console.error('❌ Signin error:', result.error)
        if (result.error.includes('Account not approved yet')) {
          toast({
            title: 'Account Pending Approval',
            description: 'Your account is pending approval. Please contact an administrator.',
            variant: 'destructive',
          })
        } else if (result.error.includes('rejected')) {
          toast({
            title: 'Account Rejected',
            description: 'Your account has been rejected. Please contact an administrator.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Authentication Failed',
            description: 'Invalid email or password.',
            variant: 'destructive',
          })
        }
      } else {
        console.log('✅ Signin successful, redirecting to dashboard')
        toast({
          title: 'Success',
          description: 'Signed in successfully!',
        })
        
        // Force a hard redirect to ensure session is set
        window.location.href = '/dashboard'
      }
    } catch (error) {
      if (error.errors) {
        const fieldErrors = {}
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Theme Toggle - Desktop Position (Top Right) */}
      <div className="absolute top-4 right-4 hidden sm:block">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-mobile-xl">Sign In</CardTitle>
            <CardDescription className="text-mobile">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="form-mobile">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email..."
                    required
                    disabled={isLoading}
                    className={`input-mobile ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password..."
                    required
                    disabled={isLoading}
                    className={`input-mobile ${errors.password ? 'border-red-500' : ''}`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-mobile"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Theme Toggle - Mobile Position (Centered Below Card) */}
        <div className="mt-6 text-center sm:hidden">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
} 