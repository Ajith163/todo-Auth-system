import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserDashboard from '@/components/dashboard/user-dashboard'
import AdminDashboard from '@/components/dashboard/admin-dashboard'

// Force dynamic rendering since this page uses getServerSession
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  console.log('🔐 Dashboard - Session check:', session)
  console.log('🔐 Dashboard - Session user:', session?.user)
  console.log('🔐 Dashboard - Session user role:', session?.user?.role)

  if (!session || !session.user) {
    console.log('❌ Dashboard - No session, redirecting to signin')
    redirect('/auth/signin')
  }

  console.log('✅ Dashboard - Session found:', {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    approved: session.user.approved
  })

  // Check if user is approved (for non-admin users)
  if (session.user.role !== 'admin' && !session.user.approved) {
    console.log('❌ Dashboard - User not approved, redirecting to signin')
    redirect('/auth/signin')
  }

  if (session.user.role === 'admin') {
    console.log('✅ Dashboard - Rendering AdminDashboard')
    return <AdminDashboard />
  }

  console.log('✅ Dashboard - Rendering UserDashboard')
  return <UserDashboard />
} 