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

  if (!session || !session.user) {
    console.log('❌ Dashboard - No session, redirecting to signin')
    redirect('/auth/signin')
  }

  console.log('✅ Dashboard - Session found:', {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role
  })

  if (session.user.role === 'admin') {
    return <AdminDashboard />
  }

  return <UserDashboard />
} 